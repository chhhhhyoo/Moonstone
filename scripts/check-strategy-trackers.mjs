import path from "node:path";
import { fail, read, repoRoot } from "./common.mjs";
import { parseMarkdownTable, validateStrategyTrackers } from "./strategy-tracker-lib.mjs";

async function main() {
  const milestonesPath = path.join(repoRoot, "docs/strategy/MILESTONES.md");
  const actionsPath = path.join(repoRoot, "docs/strategy/FUTURE-ACTIONS.md");

  const milestonesContent = await read(milestonesPath);
  const actionsContent = await read(actionsPath);

  const milestonesTable = parseMarkdownTable(
    milestonesContent,
    "docs/strategy/MILESTONES.md"
  );
  const actionsTable = parseMarkdownTable(
    actionsContent,
    "docs/strategy/FUTURE-ACTIONS.md"
  );

  const errors = validateStrategyTrackers(milestonesTable, actionsTable);
  if (errors.length > 0) {
    fail(errors);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
