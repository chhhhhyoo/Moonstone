import path from "node:path";
import { WorkflowRuntime } from "../src/core/poc/WorkflowRuntime.mjs";
import { FileRunJournalStore } from "../src/service/poc/FileRunJournalStore.mjs";
import { createDefaultConnectorExecutors } from "../src/provider/poc/ConnectorRegistry.mjs";
import { parseArgs, requireArg, loadArtifact, loadInput } from "./poc-common.mjs";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifactPath = path.resolve(process.cwd(), requireArg(args, "artifact"));
  const artifact = await loadArtifact(artifactPath);
  const input = await loadInput(args.input ? String(args.input) : "");

  const journalStore = new FileRunJournalStore({
    rootDir: args["journal-dir"] ? String(args["journal-dir"]) : ".moonstone/poc-journal"
  });

  const runtime = new WorkflowRuntime({
    journalStore,
    connectorExecutors: createDefaultConnectorExecutors()
  });

  const result = await runtime.run({ artifact, input });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
