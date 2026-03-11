import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

function runWithEnv(overrides) {
  return spawnSync("node", ["scripts/check-branch-name.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...overrides
    },
    encoding: "utf8"
  });
}

test("check-branch-name accepts BRANCH_NAME override", () => {
  const result = runWithEnv({
    BRANCH_NAME: "codex/pf-boot-001-moonstone-bootstrap"
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("check-branch-name rejects invalid BRANCH_NAME override", () => {
  const result = runWithEnv({
    BRANCH_NAME: "invalid-branch-name"
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Branch name does not match policy/);
});
