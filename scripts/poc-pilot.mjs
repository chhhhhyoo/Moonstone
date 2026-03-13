import path from "node:path";
import { compilePrompt } from "../src/core/poc/PromptCompiler.mjs";
import { planWorkflowMutation } from "../src/core/poc/WorkflowMutationPlanner.mjs";
import { applyWorkflowMutation } from "../src/core/poc/WorkflowMutationApplier.mjs";
import { planChefDirection } from "../src/core/poc/ChefDirectionPlanner.mjs";
import { buildChefDirectionPreview } from "../src/core/poc/ChefDirectionPlannerPreview.mjs";
import { WorkflowRuntime } from "../src/core/poc/WorkflowRuntime.mjs";
import { FileRunJournalStore } from "../src/service/poc/FileRunJournalStore.mjs";
import { createDefaultConnectorExecutors } from "../src/provider/poc/ConnectorRegistry.mjs";
import { parseArgs, loadInput, loadArtifact, writeJsonFile } from "./poc-common.mjs";

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
  if (args.direction === true) {
    throw new Error("Optional --direction requires a value.");
  }
  if (args["apply-direction"] && args["apply-direction"] !== true) {
    throw new Error("Flag --apply-direction does not accept a value.");
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
  const direction = args.direction ? String(args.direction).trim() : null;
  const applyDirection = Boolean(args["apply-direction"]);
  if (feedbackPrompt && direction) {
    throw new Error("Use either --feedback or --direction, not both.");
  }
  if (applyDirection && !direction) {
    throw new Error("Flag --apply-direction requires --direction.");
  }

  const isDirectionProposalOnly = Boolean(direction && !applyDirection);
  const shouldWriteMutatedArtifact = Boolean(feedbackPrompt || (direction && applyDirection));

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
    shouldWriteMutatedArtifact ? "artifact.mutated.json" : "artifact.json"
  );
  const shouldWriteSourceSnapshot = Boolean(prompt && shouldWriteMutatedArtifact);
  const sourceArtifactPath = path.resolve(
    pilotRoot,
    shouldWriteSourceSnapshot ? "artifact.source.json" : "artifact.json"
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
  let proposal = null;
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
  if (direction) {
    proposal = {
      ...planChefDirection({
        artifact: sourceArtifact,
        direction
      }),
      preview: buildChefDirectionPreview({
        artifact: sourceArtifact,
        direction
      }),
      applied: false
    };
  }

  if (feedbackPrompt || applyDirection) {
    const mutationPlan = feedbackPrompt
      ? planWorkflowMutation({
          artifact: sourceArtifact,
          prompt: feedbackPrompt
        })
      : {
          planId: `direction.${proposal.proposalId}`,
          sourceArtifactId: sourceArtifact.artifactId,
          prompt: `direction:${direction}`,
          operationType: proposal.operationType,
          operation: proposal.operation,
          diagnostics: {
            plannerVersion: proposal.diagnostics?.plannerVersion ?? "0.1.0",
            mode: "chef-direction-proposal",
            warnings: []
          }
        };
    const applyResult = applyWorkflowMutation({
      artifact: sourceArtifact,
      plan: mutationPlan
    });
    effectiveArtifact = applyResult.mutatedArtifact;
    mutation = {
      applied: true,
      operationType: applyResult.operationType,
      changeSummary: applyResult.changeSummary,
      planId: mutationPlan.planId
    };
    if (proposal) {
      proposal = {
        ...proposal,
        applied: true
      };
    }
  }

  const generatedTools = buildGeneratedToolsFromArtifact(effectiveArtifact);
  const resolvedSourceArtifactPath = prompt ? sourceArtifactPath : artifactArg;
  const resolvedEffectiveArtifactPath = isDirectionProposalOnly
    ? resolvedSourceArtifactPath
    : artifactPath;

  if (prompt || feedbackPrompt || applyDirection) {
    await writeJsonFile(sourceArtifactPath, sourceArtifact);
  }
  if (!isDirectionProposalOnly) {
    await writeJsonFile(artifactPath, effectiveArtifact);
  }
  await writeJsonFile(diagnosticsPath, diagnostics);
  await writeJsonFile(toolsPath, generatedTools);

  if (isDirectionProposalOnly) {
    console.log(JSON.stringify({
      ok: true,
      mode,
      prompt,
      artifact: artifactArg,
      feedback: feedbackPrompt,
      direction,
      runId: null,
      status: "proposal_only",
      diagnostics: {
        branchMode: diagnostics.branchMode,
        warnings: diagnostics.warnings
      },
      proposal,
      lineage: {
        sourceArtifactPath: resolvedSourceArtifactPath,
        effectiveArtifactPath: resolvedEffectiveArtifactPath,
        feedbackPrompt,
        mutation
      },
      generatedTools,
      executedNodeIds: [],
      paths: {
        artifactPath: resolvedEffectiveArtifactPath,
        sourceArtifactPath: resolvedSourceArtifactPath,
        mutatedArtifactPath: null,
        diagnosticsPath,
        runSummaryPath,
        inspectionPath,
        replayPath,
        toolsPath,
        journalDir
      },
      quickStart: {
        inspect: null,
        replay: null
      }
    }, null, 2));
    return;
  }

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
    direction,
    runId: runSummary.runId,
    status: runSummary.status,
    diagnostics: {
      branchMode: diagnostics.branchMode,
      warnings: diagnostics.warnings
    },
    proposal,
    lineage: {
      sourceArtifactPath: resolvedSourceArtifactPath,
      effectiveArtifactPath: resolvedEffectiveArtifactPath,
      feedbackPrompt,
      mutation
    },
    generatedTools,
    executedNodeIds: Object.keys(runSummary.nodeResults).sort(),
    paths: {
      artifactPath: resolvedEffectiveArtifactPath,
      sourceArtifactPath: resolvedSourceArtifactPath,
      mutatedArtifactPath: shouldWriteMutatedArtifact ? resolvedEffectiveArtifactPath : null,
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
