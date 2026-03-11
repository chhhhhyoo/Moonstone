import { execSync } from "node:child_process";
import { loadPrPolicy, parseBranchIdentity } from "./pr-governance-lib.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  let branch = null;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--branch") {
      branch = args[i + 1] ?? null;
      i += 1;
    }
  }
  return { branch };
}

function firstNonEmpty(values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }
  return null;
}

function branchFromGit() {
  try {
    const current = execSync("git branch --show-current", { encoding: "utf8" }).trim();
    if (current) {
      return current;
    }
  } catch {
    // no-op
  }

  try {
    const fallback = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    if (fallback && fallback !== "HEAD") {
      return fallback;
    }
  } catch {
    // no-op
  }

  return null;
}

function resolveBranch(explicitBranch) {
  return firstNonEmpty([
    explicitBranch,
    process.env.BRANCH_NAME,
    process.env.GITHUB_HEAD_REF,
    process.env.GITHUB_REF_NAME,
    branchFromGit()
  ]);
}

async function main() {
  const { branch: explicitBranch } = parseArgs();
  const branch = resolveBranch(explicitBranch);
  if (!branch) {
    throw new Error(
      "Cannot determine current git branch. Provide --branch or BRANCH_NAME (CI fallback uses GITHUB_HEAD_REF/GITHUB_REF_NAME)."
    );
  }

  const policy = await loadPrPolicy();
  const parsed = parseBranchIdentity(branch, policy);
  if (!parsed.ok) {
    throw new Error(parsed.reason);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
