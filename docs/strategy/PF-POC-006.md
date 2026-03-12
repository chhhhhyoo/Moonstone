# PF-POC-006: Compile-To-Runtime Qualification Matrix Plan

**Milestone**: `PF-POC-006`
**Execution Branch**: `codex/pf-runtime-018-compile-runtime-matrix`
**Owner**: `core`
**Status**: `in_progress`
**Last Updated**: `2026-03-12`

## Objective

Prove compiled fixtures are not just schema-valid but runtime-valid by executing them through the command/receipt path and asserting deterministic branch outcomes.

## Scope Lock

1. Runtime qualification matrix:
   - compile fixture prompts into artifacts
   - execute artifacts with deterministic connector stubs
   - assert branch-correct node execution and terminal status
2. Coverage targets:
   - default, exists, comparator, failure fallback, warning-fallback compile classes
3. Governance evidence updates in same change set:
   - strategy trackers
   - daily log and spec-impact record

## Non-Goals (This Slice)

1. Connector network behavior validation against external endpoints.
2. Parallel execution semantics redesign.
3. Prompt parser expansion beyond current supported contract.

## Initial Plan

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | Define runtime matrix fixture contract | runtime execution expectations per fixture class (input, expected executed nodes, expected status) | runtime matrix test file exists and fails first on missing expectations | done |
| 2 | Implement compile-to-runtime matrix test | deterministic runtime assertions for compiled fixtures across branch classes | targeted runtime matrix test passes | done |
| 3 | Wire runtime matrix into strict route | test is included in `test:unit` or conformance route and remains deterministic | `npm run verify:strict` passes with runtime matrix active | done |
| 4 | Refresh strategy/risk/log/spec-impact | tracker truth and evidence references updated for PF-POC-006 | `npm run check:strategy` + `npm run check:spec` pass | done |
| 5 | Regression confirmation | no regressions across existing runtime/conformance suites | `npm run verify:strict` pass | done |

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-12 17:19 | Initialized PF-POC-006 after PF-POC-005 merge closure to enforce compile-to-runtime branch outcome qualification. | `docs/strategy/PF-POC-006.md`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md` |
| 2026-03-12 17:20 | Added runtime fixture corpus encoding compile prompt, runtime input, HTTP behavior, and expected branch execution outcomes. | `test/fixtures/poc/prompt-runtime-fixtures.json` |
| 2026-03-12 17:20 | Added compile-to-runtime conformance matrix test validating executed node set, attempts, status, and warning/branch mode expectations per fixture. | `test/integration/conformance/poc-compile-runtime-matrix.conformance.test.mjs`, `node --test test/integration/conformance/poc-compile-runtime-matrix.conformance.test.mjs` |
| 2026-03-12 17:25 | Completed strict regression + freshness verification with compile-to-runtime conformance matrix active. | `npm run verify:strict`, `npm run check:verification-fresh` |
