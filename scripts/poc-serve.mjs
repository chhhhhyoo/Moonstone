import path from "node:path";
import { WorkflowRuntime } from "../src/core/poc/WorkflowRuntime.mjs";
import { FileRunJournalStore } from "../src/service/poc/FileRunJournalStore.mjs";
import { createDefaultConnectorExecutors } from "../src/provider/poc/ConnectorRegistry.mjs";
import { startWebhookServer } from "../src/provider/poc/WebhookServer.mjs";
import { parseArgs, requireArg, loadArtifact } from "./poc-common.mjs";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifactPath = path.resolve(process.cwd(), requireArg(args, "artifact"));
  const artifact = await loadArtifact(artifactPath);
  const port = args.port ? Number(args.port) : 3000;
  const host = args.host ? String(args.host) : "0.0.0.0";
  if (args["run-id-header"] === true) {
    throw new Error("Optional --run-id-header requires a value.");
  }
  const runIdHeader = args["run-id-header"]
    ? String(args["run-id-header"])
    : "x-moonstone-run-id";

  const journalStore = new FileRunJournalStore({
    rootDir: args["journal-dir"] ? String(args["journal-dir"]) : ".moonstone/poc-journal"
  });

  const runtime = new WorkflowRuntime({
    journalStore,
    connectorExecutors: createDefaultConnectorExecutors()
  });

  startWebhookServer({ runtime, artifact, port, host, runIdHeader });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
