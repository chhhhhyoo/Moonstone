import path from "node:path";
import { compilePrompt } from "../src/core/poc/PromptCompiler.mjs";
import { planWorkflowMutation } from "../src/core/poc/WorkflowMutationPlanner.mjs";
import { applyWorkflowMutation } from "../src/core/poc/WorkflowMutationApplier.mjs";
import { WorkflowRuntime } from "../src/core/poc/WorkflowRuntime.mjs";
import { FileRunJournalStore } from "../src/service/poc/FileRunJournalStore.mjs";
import { createDefaultConnectorExecutors } from "../src/provider/poc/ConnectorRegistry.mjs";
import { parseArgs, requireArg, loadInput, loadArtifact, writeJsonFile } from "./poc-common.mjs";

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "pilot";
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function createMockConnectorExecutors() {
  const failOnceTracker = new Set();
  return {
    "action.http": async ({ command, scope }) => {
      const input = scope?.input ?? {};
      const failMode = String(input.forceHttpFailMode ?? "").toLowerCase();
      if (failMode === "always") {
        throw new Error("mock-http-failure(always)");
      }
      if (failMode === "once" && !failOnceTracker.has(command.nodeId)) {
        failOnceTracker.add(command.nodeId);
        throw new Error("mock-http-failure(once)");
      }

      return {
        status: 200,
        body: {
          ok: true,
          source: "mock-http",
          attempt: command.attempt,
          echoedInput: input
        }
      };
    },
    "action.openai": async ({ command }) => ({
      text: `mock-openai:${String(command.payload?.prompt ?? "").slice(0, 220)}`,
      source: "mock-openai"
    })
  };
}

function normalizeMode(rawMode) {
  const mode = String(rawMode ?? "mock").trim().toLowerCase();
  if (mode !== "mock" && mode !== "live") {
    throw new Error("Unsupported --mode. Allowed values: mock | live");
  }
  return mode;
}

function buildGeneratedToolsFromArtifact(artifact) {
  return (artifact.nodes ?? []).map((node) => {
    const normalizedNodeId = String(node.id ?? "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (node.type === "action.http") {
      const method = String(node.config?.method ?? "GET").toUpperCase();
      const url = String(node.config?.url ?? "");
      return {
        toolId: `tool.${normalizedNodeId}`,
        nodeId: node.id,
        connectorType: "action.http",
        name: `HTTP ${node.id}`,
        configSummary: `${method} ${url}`.trim()
      };
    }

    if (node.type === "action.openai") {
      const model = String(node.config?.model ?? "");
      return {
        toolId: `tool.${normalizedNodeId}`,
        nodeId: node.id,
        connectorType: "action.openai",
        name: `OpenAI ${node.id}`,
        configSummary: model ? `model=${model}` : "model=unknown"
      };
    }

    return {
      toolId: `tool.${normalizedNodeId}`,
      nodeId: node.id,
      connectorType: String(node.type ?? "unknown"),
      name: `Node ${node.id}`,
      configSummary: "unsupported-node-type"
    };
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.artifact === true) {
    throw new Error("Optional --artifact requires a value.");
  }
  if (args.feedback === true) {
    throw new Error("Optional --feedback requires a value.");
  }

  const prompt = args.prompt ? String(args.prompt) : null;
  const artifactArg = args.artifact ? path.resolve(process.cwd(), String(args.artifact)) : null;
  if (!prompt && !artifactArg) {
    throw new Error("Either --prompt or --artifact is required.");
  }
  if (prompt && artifactArg) {
    throw new Error("Use either --prompt or --artifact, not both.");
  }

  const feedbackPrompt = args.feedback ? String(args.feedback).trim() : null;
  const mode = normalizeMode(args.mode);
  const input = await loadInput(args.input ? String(args.input) : "");
  const runId = args["run-id"] ? String(args["run-id"]) : undefined;
  const pilotKeySource = prompt
    ? prompt.split(" ").slice(0, 8).join(" ")
    : path.basename(artifactArg ?? "artifact", path.extname(artifactArg ?? "artifact"));
  const pilotKey = `${slugify(pilotKeySource)}-${nowStamp()}`;

  const pilotRoot = path.resolve(
    process.cwd(),
    args.outdir ? String(args.outdir) : path.join(".moonstone", "pilot", pilotKey)
  );
  const artifactPath = path.resolve(
    pilotRoot,
    feedbackPrompt ? "artifact.mutated.json" : "artifact.json"
  );
  const sourceArtifactPath = path.resolve(
    pilotRoot,
    feedbackPrompt && prompt ? "artifact.source.json" : "artifact.json"
  );
  const diagnosticsPath = path.resolve(pilotRoot, "diagnostics.json");
  const runSummaryPath = path.resolve(pilotRoot, "run-summary.json");
  const inspectionPath = path.resolve(pilotRoot, "inspection.json");
  const replayPath = path.resolve(pilotRoot, "replay.json");
  const toolsPath = path.resolve(pilotRoot, "tools.json");
  const journalDir = path.resolve(
    process.cwd(),
    args["journal-dir"] ? String(args["journal-dir"]) : path.join(".moonstone", "pilot", "journal")
  );

  let sourceArtifact = null;
  let effectiveArtifact = null;
  let diagnostics = null;
  let mutation = {
    applied: false,
    operationType: null,
    changeSummary: null,
    planId: null
  };

  if (prompt) {
    const compiled = compilePrompt({
      prompt,
      httpUrl: args["http-url"] ? String(args["http-url"]) : undefined,
      openaiModel: args.model ? String(args.model) : undefined
    });
    sourceArtifact = compiled.artifact;
    diagnostics = compiled.diagnostics;
  } else {
    sourceArtifact = await loadArtifact(artifactArg);
    diagnostics = {
      version: "0.1.0",
      prompt: null,
      branchMode: "artifact-input",
      inferred: {
        sourceArtifactPath: artifactArg
      },
      warnings: []
    };
  }

  effectiveArtifact = sourceArtifact;
  if (feedbackPrompt) {
    const plan = planWorkflowMutation({
      artifact: sourceArtifact,
      prompt: feedbackPrompt
    });
    const applyResult = applyWorkflowMutation({
      artifact: sourceArtifact,
      plan
    });
    effectiveArtifact = applyResult.mutatedArtifact;
    mutation = {
      applied: true,
      operationType: applyResult.operationType,
      changeSummary: applyResult.changeSummary,
      planId: plan.planId
    };
  }

  const generatedTools = buildGeneratedToolsFromArtifact(effectiveArtifact);

  if (prompt || feedbackPrompt) {
    await writeJsonFile(sourceArtifactPath, sourceArtifact);
  }
  await writeJsonFile(artifactPath, effectiveArtifact);
  await writeJsonFile(diagnosticsPath, diagnostics);
  await writeJsonFile(toolsPath, generatedTools);

  const journalStore = new FileRunJournalStore({ rootDir: journalDir });
  const runtime = new WorkflowRuntime({
    journalStore,
    connectorExecutors: mode === "live" ? createDefaultConnectorExecutors() : createMockConnectorExecutors(),
    sleep: async () => {}
  });

  const runSummary = await runtime.run({
    artifact: effectiveArtifact,
    input,
    runId
  });
  const inspection = await runtime.inspect({ runId: runSummary.runId });
  const replay = await runtime.replay({ runId: runSummary.runId });

  await writeJsonFile(runSummaryPath, runSummary);
  await writeJsonFile(inspectionPath, inspection);
  await writeJsonFile(replayPath, replay);

  console.log(JSON.stringify({
    ok: runSummary.status === "completed",
    mode,
    prompt,
    artifact: artifactArg,
    feedback: feedbackPrompt,
    runId: runSummary.runId,
    status: runSummary.status,
    diagnostics: {
      branchMode: diagnostics.branchMode,
      warnings: diagnostics.warnings
    },
    lineage: {
      sourceArtifactPath: prompt ? sourceArtifactPath : artifactArg,
      effectiveArtifactPath: artifactPath,
      feedbackPrompt,
      mutation
    },
    generatedTools,
    executedNodeIds: Object.keys(runSummary.nodeResults).sort(),
    paths: {
      artifactPath,
      sourceArtifactPath: prompt ? sourceArtifactPath : artifactArg,
      mutatedArtifactPath: feedbackPrompt ? artifactPath : null,
      diagnosticsPath,
      runSummaryPath,
      inspectionPath,
      replayPath,
      toolsPath,
      journalDir
    },
    quickStart: {
      inspect: `npm run poc:inspect -- --run-id ${runSummary.runId} --journal-dir ${journalDir}`,
      replay: `npm run poc:replay -- --run-id ${runSummary.runId} --journal-dir ${journalDir}`
    }
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
