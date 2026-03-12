# PF-POC-007: Fault-Injection Runtime Matrix And Recovery Qualification Plan

**Milestone**: `PF-POC-007`
**Execution Branch**: `codex/pf-runtime-019-fault-injection-matrix`
**Owner**: `core`
**Status**: `in_progress`
**Last Updated**: `2026-03-12`

## Objective

Validate deterministic retry, failure-edge routing, and recovery behavior under connector faults across compiled fixture runs.

## Scope Lock

1. Fault-injection matrix:
   - run compiled fixture artifacts with injected connector failure patterns
   - assert retry counts, failure-edge routing, and terminal status determinism
2. Recovery validation:
   - verify replay/resume correctness for at least one injected-fault branch case
3. Governance evidence updates in same change set:
   - strategy trackers
   - daily log and spec-impact record

## Non-Goals (This Slice)

1. External network fault testing.
2. New connector integrations.
3. Runtime scheduler architecture changes.

## Initial Plan

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | Define fault scenarios | fixture-level failure injection contract for retry/failure/recovery cases | targeted fault matrix test has RED cases first | done |
| 2 | Implement fault-injection matrix test | deterministic assertions for retry/failure-edge/recovery outcomes | targeted fault matrix test passes | done |
| 3 | Wire into strict route | fault matrix test is included in strict verification path | `npm run verify:strict` passes with fault matrix active | done |
| 4 | Refresh strategy/risk/log/spec-impact | tracker truth and evidence references updated for PF-POC-007 | `npm run check:strategy` + `npm run check:spec` pass | done |
| 5 | Regression confirmation | no regressions across existing runtime/conformance suites | `npm run verify:strict` pass | done |

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-12 17:26 | Initialized PF-POC-007 after PF-POC-006 merge closure to add fault-injection runtime qualification. | `docs/strategy/PF-POC-007.md`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md` |
| 2026-03-12 17:27 | Added fault-injection runtime fixture corpus for transient failure recovery, failure-edge routing, terminal failure, and retry-scheduled crash recovery. | `test/fixtures/poc/prompt-fault-fixtures.json` |
| 2026-03-12 17:27 | Added fault-injection conformance matrix test validating deterministic retry/failure/recovery outcomes for compiled fixture artifacts. | `test/integration/conformance/poc-runtime-fault-matrix.conformance.test.mjs`, `node --test test/integration/conformance/poc-runtime-fault-matrix.conformance.test.mjs` |
| 2026-03-12 17:29 | Completed strict regression + freshness verification with fault matrix and compile-runtime matrix active together. | `npm run verify:strict`, `npm run check:verification-fresh` |
