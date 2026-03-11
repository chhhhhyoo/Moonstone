import assert from "node:assert/strict";
import { classifyFilePath, loadScopeMap, mergeScopes } from "./pr-governance-lib.mjs";

async function main() {
  const scopeMap = await loadScopeMap();

  assert.equal(classifyFilePath("docs/README.md", scopeMap), "docs_only");
  assert.equal(classifyFilePath("notes/00-Index.md", scopeMap), "docs_only");
  assert.equal(classifyFilePath("docs/governance/pr-branch-policy.md", scopeMap), "governance");
  assert.equal(classifyFilePath(".github/workflows/verify-moonstone.yml", scopeMap), "governance");
  assert.equal(classifyFilePath("scripts/check-strategy-trackers.mjs", scopeMap), "governance");
  assert.equal(classifyFilePath("src/core/Orchestrator.mjs", scopeMap), "runtime");
  assert.equal(classifyFilePath("test/unit/core/SessionKey.test.mjs", scopeMap), "runtime");
  assert.equal(classifyFilePath("unknown/path/file.txt", scopeMap), "runtime");

  assert.equal(mergeScopes(["docs_only", "docs_only"]), "docs_only");
  assert.equal(mergeScopes(["docs_only", "governance"]), "governance");
  assert.equal(mergeScopes(["docs_only", "runtime"]), "runtime");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
