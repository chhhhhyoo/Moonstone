# PF-POC-002: Replay Hardening Plan

**Milestone**: `PF-POC-002`
**Execution Branch**: `codex/pf-runtime-013-fanout-replay-atomicity`
**Owner**: `core`
**Status**: `in_progress`
**Last Updated**: `2026-03-12`

## Objective

Close replay/recovery correctness gaps so interrupted runs resume deterministically without dropping or duplicating downstream work.

## Scope Lock

1. Runtime recovery semantics only (`src/core/poc/WorkflowRuntime.mjs` and replay conformance tests).
2. Crash windows covered in this slice:
   - interruption after continuation decision for multi-edge fan-out.
3. Governance artifacts updated in the same change set:
   - milestone/action trackers
   - daily log
   - spec-impact note

## Non-Goals (This Slice)

1. Visual builder/UI.
2. Connector expansion beyond webhook/http/openai.
3. Parallel execution engine redesign.

## Initial Plan

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | Reproduce fan-out crash-loss failure | failing conformance test that proves missing downstream node execution after crash mid-enqueue | `node --test test/integration/conformance/poc-replay.conformance.test.mjs` shows targeted failure first | done |
| 2 | Persist continuation decisions atomically | runtime records fan-out continuation intent before enqueue loop and reconciles missing nodes during resume | targeted replay conformance test passes | done |
| 3 | Prevent duplicate re-enqueue on resume | continuation reconciliation only enqueues nodes not already recorded in continuation scope | targeted replay conformance test passes without duplicate node executions | done |
| 4 | Closeout governance and evidence | strategy trackers, log, and spec-impact reflect PF-POC-002 progress and residual risk | `npm run check:strategy` + `npm run check:spec` pass | done |
| 5 | Full regression gate | no regressions across strict route | `npm run verify:strict` pass | done |

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-12 16:28 | Initialized PF-POC-002 execution plan with concrete phased gates for ACT-008 fan-out crash safety. | `docs/strategy/PF-POC-002.md` |
| 2026-03-12 16:31 | Added crash-injected fan-out conformance test; reproduced failure where one downstream branch was dropped after resume. | `test/integration/conformance/poc-replay.conformance.test.mjs` |
| 2026-03-12 16:34 | Implemented continuation planning/reconciliation events in runtime (`continuation_planned`, `continuation_applied`, `continuation_recovered`) and validated targeted replay suite green. | `src/core/poc/WorkflowRuntime.mjs`, `node --test test/integration/conformance/poc-replay.conformance.test.mjs` |
| 2026-03-12 16:36 | Updated trackers/log/spec-impact to register ACT-008 execution and fan-out residual-risk handling under PF-POC-002 governance flow. | `docs/strategy/FUTURE-ACTIONS.md`, `docs/logs/2026-03-12.md`, `notes/spec-impact/2026-03-12-pf-poc-002-fanout-continuation-hardening.md` |
| 2026-03-12 16:39 | Ran full strict gate after fan-out hardening and passed all type/lint/contracts/unit/conformance checks. | `npm run verify:strict` |
