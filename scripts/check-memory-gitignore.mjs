import path from "node:path";
import { exists, fail, read, repoRoot } from "./common.mjs";

const requiredEntries = ["task_plan.md", "findings.md", "progress.md"];

async function main() {
  const ignorePath = path.join(repoRoot, ".gitignore");
  const errors = [];
  if (!(await exists(ignorePath))) {
    errors.push("Missing .gitignore");
    fail(errors);
  }

  const content = await read(ignorePath);
  for (const entry of requiredEntries) {
    if (!content.split("\n").includes(entry)) {
      errors.push(`.gitignore missing memory entry: ${entry}`);
    }
  }

  if (errors.length > 0) {
    fail(errors);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
