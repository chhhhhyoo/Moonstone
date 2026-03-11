import { execSync, spawnSync } from "node:child_process";
import { classifyFilePath, loadScopeMap, mergeScopes } from "./pr-governance-lib.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    withTests: false,
    docsOnly: false
  };
  for (const arg of args) {
    if (arg === "--with-tests") {
      options.withTests = true;
    } else if (arg === "--docs-only") {
      options.docsOnly = true;
    }
  }
  return options;
}

function run(name, cmd, argv) {
  const result = spawnSync(cmd, argv, { stdio: "inherit" });
  if ((result.status ?? 1) !== 0) {
    throw new Error(`[prepush-fast] FAIL: ${name}`);
  }
}

function changedFiles() {
  try {
    return execSync("git diff --name-only", { encoding: "utf8" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function inferScope() {
  const scopeMap = await loadScopeMap();
  const files = changedFiles();
  if (files.length === 0) {
    return "runtime";
  }
  return mergeScopes(files.map((filePath) => classifyFilePath(filePath, scopeMap)));
}

async function main() {
  const options = parseArgs();
  const scope = options.docsOnly ? "docs_only" : await inferScope();

  if (scope === "docs_only") {
    run("check-spec", "npm", ["run", "check:spec"]);
    run("check-strategy", "npm", ["run", "check:strategy"]);
    run("check-links", "npm", ["run", "check:links"]);
    run("check-text-hygiene", "npm", ["run", "check:text-hygiene"]);
    return;
  }

  run("check-spec", "npm", ["run", "check:spec"]);
  run("check-strategy", "npm", ["run", "check:strategy"]);
  run("check-skills", "npm", ["run", "check:skills"]);
  run("check-links", "npm", ["run", "check:links"]);
  run("check-symlinks", "npm", ["run", "check:symlinks"]);
  run("check-memory", "npm", ["run", "check:memory"]);
  run("check-text-hygiene", "npm", ["run", "check:text-hygiene"]);
  run("check-type", "npm", ["run", "check:type"]);
  run("check-lint", "npm", ["run", "check:lint"]);
  run("check-contracts", "npm", ["run", "check:contracts"]);
  run("check-branch-name", "npm", ["run", "check:branch-name"]);
  run("check-scope-classifier", "npm", ["run", "check:scope-classifier"]);

  if (options.withTests || scope === "runtime") {
    run("test-unit", "npm", ["run", "test:unit"]);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
