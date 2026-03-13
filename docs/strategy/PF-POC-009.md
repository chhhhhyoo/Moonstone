# PF-POC-009: Webhook E2E Qualification And Deterministic Run-ID Plan

**Milestone**: `PF-POC-009`
**Execution Branch**: `codex/pf-runtime-021-webhook-e2e-gate`
**Owner**: `core`
**Status**: `done`
**Last Updated**: `2026-03-13`

## Objective

Prove webhook ingress behavior end-to-end with deterministic run-id correlation and replay continuity, not just unit-level runtime assertions.

## Scope Lock

1. Ingress contract:
   - optional header override for run-id (`x-moonstone-run-id`, configurable in `poc:serve`)
   - UUID fallback when header is absent
2. E2E qualification:
   - spawn `poc:serve`
   - health check
   - trigger run
   - inspect and replay continuity for the same run-id
3. Governance updates:
   - milestone/action/risk/log/spec-impact updates for kickoff and evidence

## Non-Goals (This Slice)

1. New connector categories.
2. UI or hosted deployment paths.
3. Runtime architecture redesign beyond ingress contract wiring.

## Initial Plan

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | RED: define webhook E2E criteria | fixture + criteria contract and failing E2E test for run-id override | `node --test test/integration/conformance/poc-webhook-e2e-qualification.conformance.test.mjs` fails for expected reason before fix | done |
| 2 | GREEN: ingress/CLI implementation | webhook header run-id override + `poc:serve` option plumbing | targeted webhook E2E test passes | done |
| 3 | REFACTOR: shared CLI E2E utilities | helper module for spawn/poll/JSON parsing and test simplification | demo + webhook qualification tests pass together | done |
| 4 | Runbook/checklist refresh | operator docs include webhook path and failure map | docs align with CLI commands and criteria files | done |
| 5 | Strict regression + tracker/spec updates | strict gate and freshness with PF-POC-009 trackers active | `npm run verify:strict` + `npm run check:verification-fresh` pass | done |

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 11:18 | Initialized PF-POC-009 after PF-POC-008 closure to add webhook ingress E2E qualification. | `docs/strategy/PF-POC-009.md`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md` |
| 2026-03-13 11:22 | Added webhook E2E fixture/criteria contract and RED test asserting run-id header determinism + replay continuity. | `test/fixtures/poc/poc-webhook-e2e-fixtures.json`, `test/fixtures/poc/poc-webhook-e2e-quality-criteria.json`, `test/integration/conformance/poc-webhook-e2e-qualification.conformance.test.mjs`, `node --test test/integration/conformance/poc-webhook-e2e-qualification.conformance.test.mjs` |
| 2026-03-13 11:26 | Implemented webhook run-id header override and `poc:serve --run-id-header` plumbing; webhook E2E test turned green. | `src/provider/poc/WebhookServer.mjs`, `scripts/poc-serve.mjs`, `node --test test/integration/conformance/poc-webhook-e2e-qualification.conformance.test.mjs` |
| 2026-03-13 11:30 | Refactored shared CLI E2E utilities for spawn/poll/JSON parsing and applied to demo + webhook qualification suites. | `test/integration/conformance/helpers/cli-e2e-helpers.mjs`, `test/integration/conformance/poc-demo-runbook-qualification.conformance.test.mjs`, `test/integration/conformance/poc-webhook-e2e-qualification.conformance.test.mjs` |
| 2026-03-13 11:35 | Completed qualification and strict regression evidence for PF-POC-009 kickoff slice. | `npm run poc:qualify:demo`, `npm run poc:qualify:webhook`, `npm run verify:strict`, `npm run check:verification-fresh` |
| 2026-03-13 11:50 | Merged PF-RUNTIME-021 PR and closed PF-POC-009 action/risk scope (`ACT-014`, `POC-013`) with exit criteria satisfied. | `https://github.com/chhhhhyoo/Moonstone/pull/12`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md` |
