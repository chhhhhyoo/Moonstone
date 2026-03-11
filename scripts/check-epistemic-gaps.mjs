import path from "node:path";
import { exists, fail, read, repoRoot } from "./common.mjs";

const taskPlanPath = path.join(repoRoot, "task_plan.md");

function findUnresolvedGaps(content) {
  const lines = content.split("\n");
  const unresolved = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].includes("[ ] [Gap:")) {
      unresolved.push({ line: i + 1, text: lines[i].trim() });
    }
  }
  return unresolved;
}

async function main() {
  if (!(await exists(taskPlanPath))) {
    return;
  }

  const content = await read(taskPlanPath);
  const unresolved = findUnresolvedGaps(content);
  if (unresolved.length === 0) {
    return;
  }

  const errors = [
    `Epistemic gate failed: ${unresolved.length} unresolved gap item(s) in task_plan.md.`,
    ...unresolved.slice(0, 10).map((item) => `task_plan.md:${item.line} ${item.text}`)
  ];
  if (unresolved.length > 10) {
    errors.push(`...and ${unresolved.length - 10} more`);
  }
  fail(errors);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
