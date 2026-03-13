# PF-POC-017: Intent-Level Chef Direction To Mutation Proposal Loop

**Milestone**: `PF-POC-017`
**Execution Branch**: `codex/pf-runtime-031-intent-feedback-planner`
**Owner**: `core`
**Status**: `in_progress`
**Last Updated**: `2026-03-13`

## Objective

Upgrade the pilot from explicit mutation-instruction feedback to intent-level chef direction by adding a deterministic proposal stage (`direction -> proposed mutation`) with a mandatory confirmation gate before apply.

## Critical Gap Assessment

Current state after PF-POC-016 is improved but still below lead-chef bar:

1. users must still speak in near-operation syntax to get reliable mutation behavior,
2. feedback apply path lacks explicit proposal-confirm separation,
3. ambiguity handling is mostly parser failure, not structured guidance.

If we skip this slice, the product will look like a CLI wrapper around low-level graph editing, not intent-led automation.

## Vision Alignment

This slice advances `VISION.md` by:

1. raising user interaction from operation-authoring to outcome-direction (`direction`),
2. introducing explicit review checkpoint before topology mutation apply,
3. preserving deterministic evidence and safety boundaries during iterative workflow evolution.

## Scope Lock

1. New intent proposal planner:
   - add deterministic `ChefDirectionPlanner` module (`direction + artifact -> MutationProposal`)
   - planner must support a bounded set of high-value intent patterns and produce explicit diagnostics
2. Proposal-confirm contract in pilot:
   - `poc:pilot --artifact <path> --direction "..."` returns proposal only by default (`applied: false`)
   - `poc:pilot --artifact <path> --direction "..." --apply-direction` applies the proposed mutation and runs
3. Deterministic proposal payload:
   - include `proposalId`, `operationType`, `operation`, `confidence`, `rationale`, `ambiguity`
4. Safety boundaries:
   - no proposal auto-apply unless `--apply-direction` present
   - ambiguous/low-confidence proposals fail closed with deterministic guidance payload
5. Docs and governance sync:
   - update pilot runbook + spec-impact + strategy trackers with evidence

## Non-Goals (This Slice)

1. LLM-based open-ended direction planning.
2. Multi-operation direction batches.
3. In-run autonomous topology self-modification.

## TDD Plan (RED -> GREEN -> REFACTOR)

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | RED: intent planner contracts | failing unit tests for deterministic proposal output, ambiguity rejection, and confidence diagnostics | `node --test test/unit/poc/ChefDirectionPlanner.test.mjs` fails for expected missing module/contract | done |
| 2 | RED: pilot CLI proposal/confirm contracts | failing conformance tests for propose-only and apply-confirm flow | `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` fails on missing direction contract | done |
| 3 | GREEN: planner + pilot integration | deterministic proposal contract and apply-confirm flow implemented in `poc:pilot` | targeted unit + conformance tests pass | done |
| 4 | REFACTOR: docs + diagnostics hygiene | runbook/spec-impact/learnings updated; proposal error taxonomy normalized | docs/tests remain consistent | done |
| 5 | Strict regression + evidence sync | strict verification and freshness pass with updated tracker evidence | `npm run verify:strict` + `npm run check:verification-fresh` pass | done |

## Test Plan And Qualification Criteria

1. Unit (`ChefDirectionPlanner`):
   - deterministic output for same `(artifact, direction)`
   - bounded intent pattern mapping to exactly one operation or deterministic ambiguity failure
   - confidence and rationale fields always present
2. Integration/conformance (`poc:pilot`):
   - propose-only mode returns proposal and `applied:false`
   - apply-confirm mode mutates new artifact and completes run
   - source artifact remains byte-unchanged
3. Safety:
   - ambiguous intent returns non-zero with deterministic diagnostics
   - no apply occurs without `--apply-direction`
4. Qualification gates:
   - `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`
   - `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`
   - `npm run verify:strict`
   - `npm run check:verification-fresh`
   - `npm run check:strategy`
   - `npm run check:spec`

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 12:17 | Activated PF-POC-017 after PF-RUNTIME-030 merge closure; closed PF-POC-016 tracker set and opened next risk-driven slice with one dominant milestone identity. | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `docs/strategy/PF-POC-016.md`, `docs/strategy/PF-POC-017.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 12:25 | Added RED tests for intent planner and proposal-confirm pilot flow; confirmed expected failures (`ChefDirectionPlanner` missing module and `poc:pilot` still auto-runs direction input instead of proposal-only mode). | `test/unit/poc/ChefDirectionPlanner.test.mjs`, `test/integration/conformance/poc-pilot.conformance.test.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 13:54 | Implemented GREEN contracts: added deterministic `ChefDirectionPlanner` and wired `poc:pilot --direction` proposal-only default with explicit `--apply-direction` apply path while preserving source artifact immutability. | `src/core/poc/ChefDirectionPlanner.mjs`, `scripts/poc-pilot.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 14:03 | Completed REFACTOR documentation sync: runbook direction flow, spec-impact note, and durable learning capture for proposal-gate pattern. | `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `notes/spec-impact/2026-03-13-pf-poc-017-intent-direction-proposal-loop.md`, `docs/logs/2026-03-13.md`, `docs/learnings.md` |
| 2026-03-13 14:07 | Completed strict regression + freshness gates for PF-POC-017 after final code/docs sync. | `npm run lint:fix`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`, `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` |
