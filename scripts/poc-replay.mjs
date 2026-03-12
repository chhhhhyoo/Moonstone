import { WorkflowRuntime } from "../src/core/poc/WorkflowRuntime.mjs";
import { FileRunJournalStore } from "../src/service/poc/FileRunJournalStore.mjs";
import { parseArgs, requireArg } from "./poc-common.mjs";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const runId = requireArg(args, "run-id");
  const journalStore = new FileRunJournalStore({
    rootDir: args["journal-dir"] ? String(args["journal-dir"]) : ".moonstone/poc-journal"
  });

  const runtime = new WorkflowRuntime({
    journalStore,
    connectorExecutors: {}
  });

  const replay = await runtime.replay({ runId });
  console.log(JSON.stringify(replay, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
