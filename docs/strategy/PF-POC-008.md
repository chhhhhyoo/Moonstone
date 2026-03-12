# PF-POC-008: POC Demo-Readiness Qualification And Operator Runbook Plan

**Milestone**: `PF-POC-008`
**Execution Branch**: `codex/pf-runtime-020-demo-readiness-runbook`
**Owner**: `core`
**Status**: `done`
**Last Updated**: `2026-03-13`

## Objective

Convert accumulated technical quality into reproducible operator value by packaging deterministic demo scenarios, qualification checklist, and runbook workflows.

## Scope Lock

1. Demo pack:
   - concrete artifact/input fixtures for key scenarios (happy path, branch, failure/recovery)
   - single-command execution examples with expected outputs
2. Qualification checklist:
   - explicit pass criteria mapped to strict verification and conformance matrix evidence
3. Operator runbook:
   - compile/run/replay/inspect troubleshooting flow
   - failure diagnosis mapping to known risk IDs

## Non-Goals (This Slice)

1. UI layer delivery.
2. New connector categories.
3. External deployment automation.

## Initial Plan

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | Define demo qualification contract | deterministic demo scenario set and evidence expectations | runbook/checklist docs have executable commands and expected artifacts | done |
| 2 | Implement operator runbook | step-by-step CLI troubleshooting path for compile/run/replay/inspect | runbook walkthrough commands execute locally | done |
| 3 | Link checklist to strict gates | checklist maps each criterion to concrete verification commands | `npm run verify:strict` + targeted commands satisfy checklist | done |
| 4 | Refresh strategy/risk/log/spec-impact | tracker truth and evidence references updated for PF-POC-008 | `npm run check:strategy` + `npm run check:spec` pass | done |
| 5 | Regression confirmation | no regressions while adding runbook artifacts | `npm run verify:strict` pass | done |

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-12 17:30 | Initialized PF-POC-008 after PF-POC-007 merge closure to package demo-readiness and operator runbook qualification. | `docs/strategy/PF-POC-008.md`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md` |
| 2026-03-13 10:40 | Added machine-enforced demo qualification artifacts (fixtures, criteria contract, and CLI-level conformance matrix) and wired `poc:qualify:demo`. | `test/fixtures/poc/poc-demo-runbook-fixtures.json`, `test/fixtures/poc/poc-demo-quality-criteria.json`, `test/integration/conformance/poc-demo-runbook-qualification.conformance.test.mjs`, `package.json` |
| 2026-03-13 10:46 | Added deterministic run-id override for `poc:run` to make inspect/replay workflows reproducible from operator runbook. | `scripts/poc-run.mjs`, `test/integration/conformance/poc-demo-runbook-qualification.conformance.test.mjs` |
| 2026-03-13 10:53 | Added PF-POC-008 operator runbook + qualification checklist and linked workflow docs index. | `docs/workflows/PF-POC-008-operator-runbook.md`, `docs/workflows/PF-POC-008-qualification-checklist.md`, `docs/workflows/README.md` |
| 2026-03-13 11:02 | Completed PF-POC-008 closure evidence with strict verification + freshness gates green. | `npm run poc:qualify:demo`, `npm run verify:strict`, `npm run check:verification-fresh` |
