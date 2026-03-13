# PF-POC-010: Resume CLI And Crash-Recovery Operator Qualification Plan

**Milestone**: `PF-POC-010`
**Execution Branch**: `codex/pf-runtime-025-resume-cli-qualification`
**Owner**: `core`
**Status**: `in_progress`
**Last Updated**: `2026-03-13`

## Objective

Close the operator recovery gap by adding a first-class CLI resume entrypoint and deterministic crash-recovery qualification evidence.

## Scope Lock

1. CLI recovery command:
   - add `poc:resume -- --run-id <id> [--journal-dir <dir>]`
   - return run summary compatible with `poc:run` output shape
2. Recovery qualification:
   - crash-injected run interrupted mid-execution
   - operator resumes using `poc:resume`
   - inspect/replay/summary remain deterministic
3. Governance updates:
   - milestone/action/risk/log/spec-impact updates in same slice

## Non-Goals (This Slice)

1. Distributed runner architecture changes.
2. Multi-process queue orchestration.
3. Human-wait state UX.

## Initial Plan

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | RED: recovery contract test | failing CLI-level recovery qualification case for resume path | targeted resume conformance test fails for expected reason before implementation | done |
| 2 | GREEN: resume command implementation | `poc:resume` CLI wired to runtime `resume` and journal store | targeted resume test passes | done |
| 3 | REFACTOR: operator docs and helper reuse | runbook/checklist include explicit crash->resume workflow and shared e2e helper reuse | doc commands and tests stay aligned | done |
| 4 | Strict regression + governance sync | tracker/risk/spec-impact/log closure with strict evidence | `npm run verify:strict` + `npm run check:verification-fresh` pass | done |

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 11:52 | Initialized PF-POC-010 after PF-POC-009 merge closure to implement CLI resume qualification. | `docs/strategy/PF-POC-010.md`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md` |
| 2026-03-13 12:18 | Added pilot promptable-workflow command to gather product signal before PF-POC-010 resume implementation proceeds. | `scripts/poc-pilot.mjs`, `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 13:10 | Parked PF-POC-010 as planned to prioritize pilot product-fit slice PF-POC-011, then resume deterministic recovery work next. | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md` |
| 2026-03-13 14:05 | Reactivated PF-POC-010 immediately after PF-POC-011 merge closure and started new execution branch for resume CLI qualification work. | `docs/strategy/PF-POC-010.md`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md` |
| 2026-03-13 14:12 | Added RED CLI conformance gate for crash->resume->inspect/replay operator flow; confirmed expected failure due missing `poc-resume` script. | `test/integration/conformance/poc-resume-cli-qualification.conformance.test.mjs`, `node --test test/integration/conformance/poc-resume-cli-qualification.conformance.test.mjs` |
| 2026-03-13 14:19 | Implemented first-class `poc:resume` CLI command and wired targeted qualification command; RED gate turned green. | `scripts/poc-resume.mjs`, `package.json`, `node --test test/integration/conformance/poc-resume-cli-qualification.conformance.test.mjs`, `npm run poc:qualify:resume` |
| 2026-03-13 14:22 | Updated operator runbook and qualification checklist to include resume CLI gate and troubleshooting path for interrupted runs. | `docs/workflows/PF-POC-008-operator-runbook.md`, `docs/workflows/PF-POC-008-qualification-checklist.md` |
| 2026-03-13 14:28 | Completed strict verification and freshness evidence with resume CLI qualification included in conformance route. | `npm run verify:strict`, `npm run check:verification-fresh` |
| 2026-03-13 14:35 | Opened PF-RUNTIME-025 implementation PR for resume CLI qualification slice with required governance template and evidence. | `https://github.com/chhhhhyoo/Moonstone/pull/17` |
