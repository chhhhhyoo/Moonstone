import path from "node:path";
import { exists, fail, repoRoot, walkFiles } from "./common.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  let skill = "";
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--skill") {
      skill = args[i + 1] ?? "";
      i += 1;
    }
  }
  return { skill };
}

async function checkExecutingPlans(errors) {
  const plansDir = path.join(repoRoot, "docs", "plans");
  const planFiles = await walkFiles(plansDir, (p) => p.endsWith(".md"));
  if (planFiles.length === 0) {
    errors.push("Missing plan prerequisites for `executing-plans`: no markdown plan files found under docs/plans/.");
  }
}

async function checkBuildAgentFromScratch(errors) {
  const handbookPath = path.join(repoRoot, "docs", "TECHNICAL_HANDBOOK.md");
  if (!(await exists(handbookPath))) {
    errors.push("Missing prerequisites for `build-agent-from-scratch`: docs/TECHNICAL_HANDBOOK.md not found.");
  }
}

async function main() {
  const { skill } = parseArgs();
  if (!skill) {
    fail(["Missing required argument: --skill <name>"]);
  }

  const errors = [];
  if (skill === "executing-plans") {
    await checkExecutingPlans(errors);
  } else if (skill === "build-agent-from-scratch") {
    await checkBuildAgentFromScratch(errors);
  }

  if (errors.length > 0) {
    fail(errors);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
