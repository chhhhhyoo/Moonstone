# PF-POC-022: Multi-Step Chef Direction Pack v1 (Then-Chain + Atomic Apply)

**Milestone**: `PF-POC-022`
**Execution Branch**: `codex/pf-runtime-036-direction-pack-v1`
**Owner**: `core`
**Status**: `done`
**Last Updated**: `2026-03-13`

## Objective

Ship the first real multi-step lead-chef direction loop so users can express workflow composition intent in one directive (not micro-step prompts):

1. proposal mode supports bounded multi-clause directions via `then`,
2. apply mode executes the whole direction pack atomically (all-or-none),
3. output remains deterministic and inspect/replay-safe.

## Critical Gap Assessment (No Sugarcoat)

Current single-operation direction is useful but still too close to implementation-level steering:

1. chef intent that naturally spans 2-3 topology edits requires multiple manual cycles,
2. this slows iteration and hides whether Moonstone can compose automation in one pass,
3. without atomic pack apply, partial success can silently degrade graph integrity and lineage trust.

If we skip this slice, we keep passing tests while still failing the n8n-style composition feel.

## Vision Alignment

This slice advances [VISION.md](/Users/chanhyunyoo/Project/Moonstone/VISION.md) outcomes by:

1. strengthening **promptable graph mutation** from single-op to bounded composition,
2. improving **lead-chef operating model** by reducing low-level micro-instruction burden,
3. preserving **durable execution core** through atomic apply + replay-safe evidence.

## Scope Lock (v1 Hard Limits)

1. Multi-clause syntax is explicit `then` chain only.
2. Maximum clause count is `3` (fail-closed above cap).
3. Clause operations remain existing bounded set:
   - `add_http_after`
   - `add_openai_after`
   - `replace_node_tool`
   - `connect_nodes`
   - `remove_leaf_node`
4. Every clause must resolve deterministically to one proposal in v1.
5. Any ambiguous clause in pack mode fails closed (single-clause ambiguity-choice contract remains unchanged).
6. Apply path is atomic all-or-none over the entire pack.

## Non-Goals

1. No autonomous in-run self-modification.
2. No open-ended free-form graph synthesis.
3. No UI/canvas.
4. No pack-level ambiguity candidate explosion handling (deferred).
5. No TypeScript source migration.

## Public Contract Target

1. Proposal mode:
   - `poc:pilot --direction "<clause1> then <clause2> ..."` returns `status: proposal_pack_only`.
   - payload includes deterministic `proposalPack` with ordered clause proposals.
2. Apply mode:
   - `--apply-direction` applies the full pack atomically.
   - failure in any clause blocks mutation output and returns deterministic error payload.
3. Single-clause behavior remains backward compatible.

## Checkpoint Delivery Plan (Fail-Closed)

### C0 — Merge Closure + Activation

Deliverables:

1. close PF-POC-021 tracker set (milestone/action/risk),
2. activate PF-POC-022 (milestone/action/risk),
3. create this plan before implementation.

Gate:

1. `npm run check:strategy`
2. `npm run check:spec`

### C1 — RED: Planner Pack Contracts

Deliverables:

1. add failing unit tests for:
   - deterministic clause splitting,
   - deterministic pack id/order,
   - >3 clause fail-closed,
   - ambiguous clause fail-closed in pack mode.
2. add failing integration/conformance for `poc:pilot` proposal/apply pack flow.

Gate (must fail first):

1. `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`
2. `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`

### C2 — GREEN: Planner Pack Engine

Deliverables:

1. implement deterministic pack planner (`then` chain, max 3),
2. sequentially validate clause proposals against evolving in-memory artifact,
3. emit deterministic pack summary metadata.

Gate:

1. planner unit tests green.

### C3 — GREEN: Pilot Atomic Apply

Deliverables:

1. wire pack proposal/apply into `scripts/poc-pilot.mjs`,
2. atomic all-or-none apply for full pack,
3. deterministic error codes for pack-specific failures.

Gate:

1. `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`

### C4 — REFACTOR: Runbook + Spec Impact + Memory

Deliverables:

1. update pilot runbook with pack usage + failure map,
2. add spec-impact note for PF-POC-022,
3. append daily log and durable learning entries.

Gate:

1. `npm run check:strategy`
2. `npm run check:spec`

### C5 — Final Strict Gate

Deliverables:

1. all checkpoints evidence logged in this plan,
2. strict verification and freshness green on final tree.

Gate:

1. `npm run verify:strict`
2. `npm run check:verification-fresh`
3. `npm run check:strategy`
4. `npm run check:spec`

## TDD Matrix

### Unit

1. `then` splitting is deterministic and whitespace-insensitive.
2. pack ordering and `packId` are deterministic for equivalent input.
3. clause cap (`>3`) fails closed with deterministic code.
4. ambiguous clause in pack mode fails closed with deterministic code.
5. sequential clause planning can reference prior clause mutation results deterministically.

### Integration

1. proposal-only pack output contract (`status: proposal_pack_only`, ordered proposals).
2. apply-direction executes full pack and preserves source artifact immutability.
3. pack apply failure returns deterministic JSON error payload and no partial mutation artifact.

### Conformance

1. end-to-end pack scenario runs to terminal state with inspect/replay continuity.
2. rerun determinism for same pack direction and input.
3. legacy single-clause proposal/apply paths remain green.

## Drift Prevention Protocol

1. no implementation starts without matching checkpoint id,
2. every material change appends evidence row here immediately,
3. scope expansion requires plan update before code,
4. failed RED/GREEN gates block forward progress.

## Linked Risk

1. `POC-028` (multi-step composition + atomicity risk).

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 20:45 | Activated PF-POC-022 after PF-POC-021 merge closure; set bounded direction-pack objective and fail-closed checkpoint/TDD plan. | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `docs/strategy/PF-POC-022.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 20:52 | C1 RED captured expected failures: planner pack export/contract missing and pilot multi-clause direction still hard-fails as single-operation ambiguity. | `test/unit/poc/ChefDirectionPlanner.test.mjs`, `test/integration/conformance/poc-pilot.conformance.test.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 21:04 | C2 GREEN complete: implemented deterministic `planChefDirectionPack` with bounded clause splitting, sequential evolving-artifact planning, and fail-closed ambiguous-clause enforcement. | `src/core/poc/ChefDirectionPlanner.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs` |
| 2026-03-13 21:07 | C3 GREEN complete: wired `poc:pilot` direction-pack proposal/apply contract and atomic all-or-none pack apply path with deterministic failure codes. | `scripts/poc-pilot.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 21:10 | C4 REFACTOR complete: updated operator runbook + spec-impact for direction-pack contract and limits. | `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `notes/spec-impact/2026-03-13-pf-poc-022-direction-pack-v1.md` |
| 2026-03-13 21:18 | C5 final gate complete: lint, strict verification, freshness, and strategy/spec gates are green after PF-POC-022 implementation. | `npm run lint:fix`, `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` |
