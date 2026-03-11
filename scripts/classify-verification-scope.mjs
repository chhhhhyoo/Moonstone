import { execSync } from "node:child_process";
import { classifyFilePath, loadScopeMap, mergeScopes } from "./pr-governance-lib.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const changedFiles = [];
  let base = "origin/main";
  let head = "HEAD";
  for (let i = 0; i < args.length; i += 1) {
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
  return { base, head, changedFiles };
}

function resolveChangedFiles(base, head) {
  try {
    const output = execSync(`git diff --name-only ${base}...${head}`, { encoding: "utf8" });
    return output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    try {
      const fallback = execSync("git diff --name-only", { encoding: "utf8" });
      return fallback
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  }
}

async function main() {
  const { base, head, changedFiles } = parseArgs();
  const files = changedFiles.length > 0 ? changedFiles : resolveChangedFiles(base, head);
  if (files.length === 0) {
    console.log("runtime");
    return;
  }

  const scopeMap = await loadScopeMap();
  const scopes = files.map((filePath) => classifyFilePath(filePath, scopeMap));
  console.log(mergeScopes(scopes));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
