# PF-POC-020: Role-Ambiguity Choice Flow + PF-POC-019 Tracker Closure

**Milestone**: `PF-POC-020`
**Execution Branch**: `codex/pf-runtime-034-role-ambiguity-choice`
**Owner**: `core`
**Status**: `done`
**Last Updated**: `2026-03-13`

## Objective

Preserve lead-chef abstraction when role anchors are ambiguous by returning deterministic proposal choices and requiring explicit proposal selection for apply, while keeping fail-closed behavior for broader ambiguity classes.

## Critical Gap Assessment

PF-POC-019 solved node-id-free anchors but still hard-fails whenever a role maps to multiple candidates. That blocks practical review loops because the user is forced back to node IDs rather than selecting from clear, deterministic options.

If this gap is not closed, role-based direction becomes brittle and product feel regresses to implementation-level authoring.

## Vision Alignment

This slice advances `VISION.md` by:

1. improving lead-chef review flow with deterministic candidate proposals instead of raw parser failures,
2. preserving promptable mutation safety through explicit apply-confirm selection (`proposal-id`),
3. keeping core fail-closed posture by rejecting multi-ambiguity and non-role ambiguity paths.

## Scope Lock

1. Add choice-capable direction planner entrypoint:
   - `status: resolved` with a single proposal, or
   - `status: choice_required` with deterministic `proposalCandidates[]`.
2. Ambiguity scope is limited to exactly one ambiguous role reference.
3. Multi-ambiguous role references fail closed.
4. Non-role ambiguity and vague intent remain fail closed.
5. Add `--proposal-id` to `poc:pilot` apply path for ambiguous role-choice flows.
6. Candidate previews must use existing deterministic preview contract per candidate.

## Non-Goals (This Slice)

1. No multi-operation direction packs.
2. No automatic "best guess" candidate selection.
3. No free-form ambiguity handling outside role-anchor contexts.
4. No TypeScript source migration; `.mjs` runtime contract remains active.

## TDD Plan (RED -> GREEN -> REFACTOR)

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | RED: planner choice contract tests | failing unit tests expecting `choice_required` result and deterministic candidate proposals for ambiguous role anchor | `node --test test/unit/poc/ChefDirectionPlanner.test.mjs` fails on missing choice contract | done |
| 2 | RED: pilot CLI ambiguity-apply tests | failing integration tests for proposal-choice status and missing/invalid `--proposal-id` errors | `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` fails on missing proposal-choice behavior | done |
| 3 | GREEN: planner + pilot apply wiring | choice-capable planner, preview-candidate generation, and apply-by-proposal-id behavior implemented | targeted unit + conformance tests pass | done |
| 4 | REFACTOR: helper extraction + error normalization | shared proposal candidate builder and deterministic error code strings for proposal-id failures | targeted tests stay green | done |
| 5 | Strict regression and tracker/spec freshness | strict verification and governance/spec checks pass with milestone/action/risk/doc updates | `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` | done |

## Test Plan And Qualification Criteria

1. Unit (`ChefDirectionPlanner`):
   - ambiguous single-role direction yields `choice_required`,
   - candidate ordering deterministic by node id,
   - each candidate includes deterministic `proposalId`, `operation`, `resolvedAnchors`,
   - multi-ambiguous-role direction fails closed.
2. Integration (`poc:pilot`):
   - ambiguous role direction returns `status: proposal_choice_required` and `proposalCandidates[]`,
   - apply without `--proposal-id` fails with deterministic error,
   - apply with unknown `--proposal-id` fails with deterministic error,
   - apply with valid `--proposal-id` completes and remains source-immutable.
3. Qualification gates:
   - `node --test test/unit/poc/ChefDirectionPlannerRoles.test.mjs`
   - `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`
   - `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`
   - `npm run verify:strict`
   - `npm run check:verification-fresh`
   - `npm run check:strategy`
   - `npm run check:spec`

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 17:45 | Activated PF-POC-020 after PF-POC-019 merge closure; refreshed milestone/action/risk trackers and opened ambiguity-choice scope. | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `docs/strategy/PF-POC-019.md`, `docs/strategy/PF-POC-020.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 18:00 | Added RED unit/integration contracts for role-ambiguity proposal-choice semantics and proposal-id apply guardrails; captured expected failures before implementation. | `test/unit/poc/ChefDirectionPlanner.test.mjs`, `test/integration/conformance/poc-pilot.conformance.test.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 18:14 | Implemented GREEN planner + pilot contracts: choice-capable direction planning, deterministic candidate ordering, and explicit `--proposal-id` selection for ambiguous apply path. | `src/core/poc/ChefDirectionPlannerRoles.mjs`, `src/core/poc/ChefDirectionPlanner.mjs`, `scripts/poc-pilot.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 18:20 | Completed REFACTOR sync with operator runbook ambiguity-choice guidance, spec-impact capture, and durable learning update. | `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `notes/spec-impact/2026-03-13-pf-poc-020-role-ambiguity-choice-flow.md`, `docs/logs/2026-03-13.md`, `docs/learnings.md` |
| 2026-03-13 18:35 | Completed strict regression and freshness gates for PF-POC-020 role-ambiguity choice contract and tracker/doc sync. | `node --test test/unit/poc/ChefDirectionPlannerRoles.test.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`, `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` |
| 2026-03-13 19:25 | Closed PF-POC-020 after PR #26 merge and activated PF-POC-021 C0 kickoff for Pilot-01 airtight qualification execution. | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `docs/strategy/PF-POC-020.md`, `docs/strategy/PF-POC-021.md`, `docs/logs/2026-03-13.md` |
