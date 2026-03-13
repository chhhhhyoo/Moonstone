import path from "node:path";
import { compilePrompt } from "../src/core/poc/PromptCompiler.mjs";
import { WorkflowRuntime } from "../src/core/poc/WorkflowRuntime.mjs";
import { FileRunJournalStore } from "../src/service/poc/FileRunJournalStore.mjs";
import { createDefaultConnectorExecutors } from "../src/provider/poc/ConnectorRegistry.mjs";
import { parseArgs, requireArg, loadInput, writeJsonFile } from "./poc-common.mjs";

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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const prompt = requireArg(args, "prompt");
  const mode = normalizeMode(args.mode);
  const input = await loadInput(args.input ? String(args.input) : "");
  const runId = args["run-id"] ? String(args["run-id"]) : undefined;
  const pilotKey = `${slugify(prompt.split(" ").slice(0, 8).join(" "))}-${nowStamp()}`;

  const pilotRoot = path.resolve(
    process.cwd(),
    args.outdir ? String(args.outdir) : path.join(".moonstone", "pilot", pilotKey)
  );
  const artifactPath = path.resolve(pilotRoot, "artifact.json");
  const diagnosticsPath = path.resolve(pilotRoot, "diagnostics.json");
  const runSummaryPath = path.resolve(pilotRoot, "run-summary.json");
  const inspectionPath = path.resolve(pilotRoot, "inspection.json");
  const replayPath = path.resolve(pilotRoot, "replay.json");
  const journalDir = path.resolve(
    process.cwd(),
    args["journal-dir"] ? String(args["journal-dir"]) : path.join(".moonstone", "pilot", "journal")
  );

  const { artifact, diagnostics } = compilePrompt({
    prompt,
    httpUrl: args["http-url"] ? String(args["http-url"]) : undefined,
    openaiModel: args.model ? String(args.model) : undefined
  });

  await writeJsonFile(artifactPath, artifact);
  await writeJsonFile(diagnosticsPath, diagnostics);

  const journalStore = new FileRunJournalStore({ rootDir: journalDir });
  const runtime = new WorkflowRuntime({
    journalStore,
    connectorExecutors: mode === "live" ? createDefaultConnectorExecutors() : createMockConnectorExecutors(),
    sleep: async () => {}
  });

  const runSummary = await runtime.run({
    artifact,
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
    runId: runSummary.runId,
    status: runSummary.status,
    diagnostics: {
      branchMode: diagnostics.branchMode,
      warnings: diagnostics.warnings
    },
    executedNodeIds: Object.keys(runSummary.nodeResults).sort(),
    paths: {
      artifactPath,
      diagnosticsPath,
      runSummaryPath,
      inspectionPath,
      replayPath,
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
