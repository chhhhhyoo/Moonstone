import test from "node:test";
import assert from "node:assert/strict";
import {
  ensureBranchPrIdentityMatch,
  loadPrPolicy,
  loadScopeMap,
  parseBranchIdentity,
  parseCommitSubject,
  parsePrTitleIdentity,
  validatePrBody,
  classifyFilePath,
  mergeScopes
} from "../../../scripts/pr-governance-lib.mjs";

test("branch identity parsing accepts valid feature branch", async () => {
  const policy = await loadPrPolicy();
  const parsed = parseBranchIdentity("codex/pf-boot-001-moonstone-bootstrap", policy);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.streamLower, "boot");
  assert.equal(parsed.id, "001");
});

test("branch identity parsing accepts main as exempt", async () => {
  const policy = await loadPrPolicy();
  const parsed = parseBranchIdentity("main", policy);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.exempt, true);
});

test("PR title parsing validates canonical format", async () => {
  const policy = await loadPrPolicy();
  const parsed = parsePrTitleIdentity(
    "[PF-BOOT-001] Bootstrap Moonstone governance and runtime seed",
    policy
  );
  assert.equal(parsed.ok, true);
  assert.equal(parsed.streamUpper, "BOOT");
  assert.equal(parsed.id, "001");
});

test("commit subject parsing validates canonical format", async () => {
  const policy = await loadPrPolicy();
  const parsed = parseCommitSubject("PF-BOOT-001: bootstrap moonstone governance and runtime seed", policy);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.streamUpper, "BOOT");
});

test("branch and PR identities must match", async () => {
  const policy = await loadPrPolicy();
  const branch = parseBranchIdentity("codex/pf-boot-001-moonstone-bootstrap", policy);
  const pr = parsePrTitleIdentity("[PF-BOOT-001] Bootstrap Moonstone governance and runtime seed", policy);
  const matched = ensureBranchPrIdentityMatch(branch, pr, policy);
  assert.equal(matched.ok, true);
});

test("scope classification is fail-closed", async () => {
  const map = await loadScopeMap();
  assert.equal(classifyFilePath("docs/guide.md", map), "docs_only");
  assert.equal(classifyFilePath("docs/governance/pr-branch-policy.md", map), "governance");
  assert.equal(classifyFilePath("src/core/Orchestrator.mjs", map), "runtime");
  assert.equal(classifyFilePath("random/unknown.file", map), "runtime");
  assert.equal(mergeScopes(["docs_only", "governance"]), "governance");
  assert.equal(mergeScopes(["docs_only", "runtime"]), "runtime");
});

test("PR body validation accepts insight-first structured body", async () => {
  const policy = await loadPrPolicy();
  const body = `
## Problem Framing
- Session resume behavior was opaque under parallel agent transitions.
- This change removes a class of stuck-session regressions.

## Solution Shape
- Introduced explicit transition receipts and fail-closed transition checks.
- Rejected optimistic transition writes because they hide race conditions.

## Reviewer Focus
- \`src/core/Orchestrator.mjs\`: verify transition ordering and side-effect boundaries.
- \`src/core/session-store.mjs\`: verify idempotent persistence semantics.

## Risk Surface
- Main risk is over-restricting valid transitions.
- Mitigated with transition contract tests and receipt assertions.

## Validation And Evidence
- \`npm run verify\` passed locally.
- \`npm run verify:strict\` passed locally.

## Milestone And Follow-ups
- Milestone: PF-RUNTIME-002 in progress.
- Follow-up: PF-ACT-012 for transition timeout telemetry.

## PR Tactics Checklist
- [x] Single dominant milestone identity
- [x] Reviewer hotspots include explicit file paths and what to verify
- [x] Validation command outcomes are concrete and reproducible
- [x] Residual risk and confidence limits are stated
`.trim();
  const result = validatePrBody(body, policy);
  assert.equal(result.ok, true);
});

test("PR body validation rejects low-signal placeholders", async () => {
  const policy = await loadPrPolicy();
  const body = `
## Problem Framing
- todo

## Solution Shape
- same as title

## Reviewer Focus
- \`src/core/Orchestrator.mjs\`: as shown in diff

## Risk Surface
- tbd

## Validation And Evidence
- <replace with real commands and outcomes>

## Milestone And Follow-ups
- none

## PR Tactics Checklist
- [ ] Single dominant milestone identity
`.trim();
  const result = validatePrBody(body, policy);
  assert.equal(result.ok, false);
});

test("PR body validation rejects template shell content", async () => {
  const policy = await loadPrPolicy();
  const body = `
## Problem Framing
- Operational problem being solved:

## Solution Shape
- Core design decisions and boundaries:

## Reviewer Focus
- <path>: what is non-obvious and what to verify

## Risk Surface
- Primary regression vectors:

## Validation And Evidence
- Commands and outcomes:

## Milestone And Follow-ups
- Milestone ID and current state:

## PR Tactics Checklist
- [x] Single dominant milestone identity
`.trim();
  const result = validatePrBody(body, policy);
  assert.equal(result.ok, false);
});
