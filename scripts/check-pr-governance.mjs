import { execSync } from "node:child_process";
import {
  ensureBranchPrIdentityMatch,
  loadPrPolicy,
  loadScopeMap,
  parseBranchIdentity,
  parseCommitSubject,
  parsePrTitleIdentity,
  classifyFilePath,
  mergeScopes,
  validatePrBody,
  validatePrTemplate
} from "./pr-governance-lib.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  let branch = null;
  let title = null;
  let body = null;
  let base = "origin/main";
  let head = "HEAD";
  const changedFiles = [];

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--branch") {
      branch = args[i + 1] ?? branch;
      i += 1;
      continue;
    }
    if (args[i] === "--title") {
      title = args[i + 1] ?? title;
      i += 1;
      continue;
    }
    if (args[i] === "--body") {
      body = args[i + 1] ?? body;
      i += 1;
      continue;
    }
    if (args[i] === "--base") {
      base = args[i + 1] ?? base;
      i += 1;
      continue;
    }
    if (args[i] === "--head") {
      head = args[i + 1] ?? head;
      i += 1;
      continue;
    }
    if (args[i] === "--changed-file") {
      const value = args[i + 1];
      if (value) {
        changedFiles.push(value);
      }
      i += 1;
    }
  }

  return { branch, title, body, base, head, changedFiles };
}

function currentBranch() {
  return execSync("git branch --show-current", { encoding: "utf8" }).trim();
}

function lastCommitSubject() {
  try {
    return execSync("git log -1 --pretty=%s", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function isSyntheticMergeSubject(subject) {
  return subject.startsWith("Merge ");
}

function resolveChangedFiles(base, head) {
  try {
    const output = execSync(`git diff --name-only ${base}...${head}`, { encoding: "utf8" });
    return output.split("\n").map((line) => line.trim()).filter(Boolean);
  } catch {
    try {
      const fallback = execSync("git diff --name-only", { encoding: "utf8" });
      return fallback.split("\n").map((line) => line.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }
}

async function main() {
  const {
    branch: explicitBranch,
    title: explicitTitle,
    body: explicitBody,
    base,
    head,
    changedFiles
  } = parseArgs();
  const branch = explicitBranch ?? currentBranch();
  const title = explicitTitle ?? process.env.PR_TITLE ?? null;
  const body = explicitBody ?? process.env.PR_BODY ?? null;

  const policy = await loadPrPolicy();
  const scopeMap = await loadScopeMap();

  const templateCheck = await validatePrTemplate(policy);
  if (!templateCheck.ok) {
    throw new Error(templateCheck.reason);
  }

  const branchIdentity = parseBranchIdentity(branch, policy);
  if (!branchIdentity.ok) {
    throw new Error(branchIdentity.reason);
  }

  if (title) {
    const prIdentity = parsePrTitleIdentity(title, policy);
    if (!prIdentity.ok) {
      throw new Error(prIdentity.reason);
    }
    const branchPrMatch = ensureBranchPrIdentityMatch(branchIdentity, prIdentity, policy);
    if (!branchPrMatch.ok) {
      throw new Error(branchPrMatch.reason);
    }

    const prBodyValidation = validatePrBody(body, policy);
    if (!prBodyValidation.ok) {
      throw new Error(prBodyValidation.reason);
    }
  }

  const commitSubject = lastCommitSubject();
  if (commitSubject && !policy.allow_branches.includes(branch)) {
    // In PR CI, checkout can point to a synthetic merge commit subject.
    // Commit-subject policy applies to authored feature commits, not merge artifacts.
    if (isSyntheticMergeSubject(commitSubject)) {
      const files = changedFiles.length > 0 ? changedFiles : resolveChangedFiles(base, head);
      const scope = files.length === 0
        ? "runtime"
        : mergeScopes(files.map((filePath) => classifyFilePath(filePath, scopeMap)));
      console.log(`scope=${scope}`);
      return;
    }
    const commitIdentity = parseCommitSubject(commitSubject, policy);
    if (!commitIdentity.ok) {
      throw new Error(commitIdentity.reason);
    }
    if (branchIdentity.id && commitIdentity.id !== branchIdentity.id) {
      throw new Error(`Commit ID mismatch: commit=${commitIdentity.id} branch=${branchIdentity.id}`);
    }
  }

  const files = changedFiles.length > 0 ? changedFiles : resolveChangedFiles(base, head);
  const scope = files.length === 0
    ? "runtime"
    : mergeScopes(files.map((filePath) => classifyFilePath(filePath, scopeMap)));

  console.log(`scope=${scope}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
