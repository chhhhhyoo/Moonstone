# PF-POC-018: Intent Operation-Pack Expansion And Proposal Diff Qualification

**Milestone**: `PF-POC-018`
**Execution Branch**: `codex/pf-runtime-032-poc-018-kickoff`
**Owner**: `core`
**Status**: `done`
**Last Updated**: `2026-03-13`

## Objective

Upgrade the direction planner from a summary-only lane into a bounded multi-operation intent lane so the pilot feels closer to n8n/Opal-style "chef gives direction, system proposes concrete graph changes" while staying deterministic and fail-closed.

## Critical Gap Assessment

Current PF-POC-017 solved proposal-confirm safety but still has a product ceiling:

1. intent coverage is too narrow (`summary` only),
2. proposal output does not show concrete graph-delta preview before apply,
3. user confidence is limited because the mutation impact is inferred from operation text, not explicit pre-apply diff evidence.

If we skip this slice, the system remains technically safe but product-shallow.

## Vision Alignment

This slice advances `VISION.md` outcomes by:

1. improving promptable graph mutation breadth (not one narrow intent),
2. strengthening chef review loop with deterministic proposal diff preview before apply,
3. preserving durable execution guarantees by keeping apply-confirm boundaries strict and replay/inspect-safe.

## Scope Lock

1. Expand bounded intent-operation mapping in `ChefDirectionPlanner`:
   - `add_openai_after` (existing summary lane hardening)
   - `add_http_after`
   - `replace_node_tool`
   - `connect_nodes`
   - `remove_leaf_node`
2. Keep fail-closed contracts:
   - single operation per direction,
   - required hint extraction by operation (`url`, `method`, `model`, `prompt`, `event`, node refs),
   - deterministic low-confidence/ambiguity rejection.
3. Add proposal diff preview contract:
   - proposal-only output includes deterministic graph impact summary prior to apply:
   - `affectedNodeIds`, `nodeAdds`, `nodeUpdates`, `nodeRemoves`, `edgeAdds`, `edgeRemoves`, `blockedReasons`.
4. Extend pilot proposal/apply conformance matrix for all bounded operation directions.
5. Keep current runtime and connector scope fixed (`Webhook + HTTP + OpenAI`), CLI-first.

## Non-Goals (This Slice)

1. No multi-operation direction batches.
2. No free-form LLM planner.
3. No in-run autonomous topology rewiring.
4. No UI/canvas authoring work.

## TDD Plan (RED -> GREEN -> REFACTOR)

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | RED: direction-operation planner matrix | failing planner unit tests for each intent-operation mapping and fail-closed ambiguity/low-confidence cases | `node --test test/unit/poc/ChefDirectionPlanner.test.mjs` fails on missing operation coverage | done |
| 2 | RED: proposal diff preview contract | failing unit tests for deterministic preview diff shape and safety-blocked cases | `node --test test/unit/poc/ChefDirectionPlannerPreview.test.mjs` fails for missing preview contract | done |
| 3 | RED: pilot conformance operation matrix | failing conformance tests for proposal/apply per operation direction scenario | `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` fails on missing operation scenarios | done |
| 4 | GREEN: planner + preview + pilot wiring | bounded operation mapping + diff preview implemented and conformance turned green | targeted unit + conformance tests pass | done |
| 5 | REFACTOR: docs/spec/log sync | runbook/plan/spec-impact/log/learnings updated with new direction matrix and failure taxonomy | docs/tests stay consistent | done |
| 6 | Strict regression and freshness | strict verification and tracker checks are green after final sync | `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` | done |

## Test Plan And Qualification Criteria

1. Unit (`ChefDirectionPlanner`):
   - deterministic proposal for same `(artifact, direction)` across all five operations,
   - required hints enforced per operation,
   - ambiguous/multi-intent/low-confidence direction rejected deterministically.
2. Unit (`ProposalDiff`):
   - preview diff deterministic for same `(artifact, proposal)`,
   - preview mirrors apply result for node/edge adds/removes/updates,
   - blocked/safety-rejected proposals include deterministic reason codes.
3. Conformance (`poc:pilot`):
   - proposal-only and apply-confirm flow validated per operation,
   - source artifact remains byte-unchanged,
   - valid apply path remains inspect/replay consistent.
4. Qualification gates:
   - `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`
   - `node --test test/unit/poc/ChefDirectionPlannerPreview.test.mjs`
   - `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`
   - `npm run verify:strict`
   - `npm run check:verification-fresh`
   - `npm run check:strategy`
   - `npm run check:spec`

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 14:30 | Activated PF-POC-018 after PF-RUNTIME-031 merge closure; closed PF-POC-017 tracker set and opened next risk-driven slice focused on intent-operation expansion + proposal diff preview. | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `docs/strategy/PF-POC-017.md`, `docs/strategy/PF-POC-018.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 14:42 | Added RED tests for multi-operation direction coverage and proposal diff preview; confirmed expected failures on unsupported operation mappings and missing preview module/contract. | `test/unit/poc/ChefDirectionPlanner.test.mjs`, `test/unit/poc/ChefDirectionPlannerPreview.test.mjs`, `test/integration/conformance/poc-pilot.conformance.test.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/unit/poc/ChefDirectionPlannerPreview.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 15:04 | Implemented GREEN operation pack + preview contract: planner now supports bounded add/replace/connect/remove intent mappings and pilot direction output includes deterministic proposal preview diff. | `src/core/poc/ChefDirectionPlanner.mjs`, `src/core/poc/ChefDirectionPlannerPreview.mjs`, `scripts/poc-pilot.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/unit/poc/ChefDirectionPlannerPreview.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 15:12 | Completed REFACTOR sync for PF-POC-018: runbook operation-pack guidance, spec-impact record, and durable learning update captured. | `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `notes/spec-impact/2026-03-13-pf-poc-018-intent-operation-pack-preview.md`, `docs/logs/2026-03-13.md`, `docs/learnings.md` |
| 2026-03-13 15:21 | Completed strict regression + freshness gates after PF-POC-018 implementation and docs sync. | `npm run lint:fix`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/unit/poc/ChefDirectionPlannerPreview.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`, `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` |
| 2026-03-13 15:27 | Merged PF-RUNTIME-032 and closed tracker set (`PF-POC-018`, `ACT-023`, `POC-022`) before activating PF-POC-019. | `https://github.com/chhhhhyoo/Moonstone/pull/24`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md` |
