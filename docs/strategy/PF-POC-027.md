# PF-POC-027: Dual-Event Intent Synthesis For Success/Failed Review Lanes

**Milestone**: `PF-POC-027`
**Execution Branch**: `codex/pf-runtime-041-dual-event-intent-synthesis`
**Owner**: `core`
**Status**: `in_progress`
**Last Updated**: `2026-03-13`

## Objective

Unblock a core lead-chef automation pattern without weakening safety:

1. accept bounded high-level intent that asks for handling on both `success` and `failed`,
2. synthesize deterministic proposal-pack clauses for both events,
3. keep fail-closed rejection for incompatible mixed event combinations.

## Critical Gap Assessment

Current behavior rejects explicit `on success` + `on failed` in one direction with `CHEF_DIRECTION_INTENT_EVENT_CONFLICT`.

This is too strict for realistic n8n-style automation review loops where users expect to define dual-outcome handling in one intent. If we keep this behavior, users fall back to low-level micro-directions and pilot value regresses.

## Vision Alignment

This slice advances [VISION.md](/Users/chanhyunyoo/Project/Moonstone/VISION.md):

1. **Promptable graph synthesis**:
   - expands bounded synthesis coverage for common outcome-routing intent.
2. **Promptable graph mutation**:
   - keeps intent-to-pack mutation deterministic while increasing practical direction bandwidth.
3. **Lead-chef operating model**:
   - user can direct both success/failure outcomes in one high-level statement instead of operation-by-operation rewiring.
4. **Fail-closed governance and verification**:
   - incompatible event combinations still reject deterministically with explicit codes.

## Scope Lock

1. Only intent-synthesis event handling in chef-direction pack planning.
2. No connector-scope expansion.
3. No runtime durability semantic changes.
4. No UI/canvas work.

## Non-Goals

1. No broad natural-language coverage expansion beyond bounded event phrases.
2. No multi-agent or in-run self-modifying node behavior.
3. No change to mutation operation taxonomy.

## Public Contract Target

1. Supported bounded direction shape:
   - high-level direction that includes summary/report intent and both explicit events (`on success` and `on failed`).
2. Deterministic synthesis output:
   - proposal-pack clauses include one summary clause for `success` and one for `failed` (stable order),
   - diagnostics remain deterministic (`mode`, `synthesisApplied`, `derivedClauses[]`, `intentSignals[]`).
3. Fail-closed conflict behavior:
   - mixed incompatible event combinations remain rejected with deterministic event-conflict code.
4. Qualification updates:
   - unit + conformance + dedicated `poc:qualify:intent-synthesis` fixture matrix prove new behavior and preserved safety.

## Checkpoint Plan (Fail-Closed + TDD)

### C0 — Merge Closure + Activation

Deliverables:

1. close PF-POC-026 milestone/action/risk,
2. activate PF-POC-027 milestone/action/risk,
3. create this plan before any runtime implementation edits.

Gate:

1. `npm run check:strategy`
2. `npm run check:spec`

### C1 — RED: Dual-Event Intent Contracts

Deliverables:

1. unit RED tests asserting dual-event intent now resolves into deterministic pack clauses,
2. integration/conformance RED assertions for pilot proposal/apply continuity on dual-event intent,
3. dedicated intent-synthesis fixture/criteria RED updates reflecting new supported case and retained conflict case.

Gate (must fail first):

1. `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`
2. `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`
3. `npm run poc:qualify:intent-synthesis`

### C2 — GREEN: Planner Event-Synthesis Implementation

Deliverables:

1. implement bounded dual-event synthesis decomposition (`success` + `failed`) with deterministic clause order,
2. keep explicit fail-closed rejection for incompatible mixed events,
3. preserve explicit-pack and existing synthesized single-event behavior.

Gate:

1. `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`
2. `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`
3. `npm run poc:qualify:intent-synthesis`

### C3 — GREEN: Strict Verification Integration

Deliverables:

1. ensure no regression across existing pilot/conformance suites,
2. verify strict route remains green with updated synthesis behavior.

Gate:

1. `npm run verify:strict`

### C4 — REFACTOR: Docs + Memory

Deliverables:

1. update pilot runbook with dual-event synthesis usage and conflict map,
2. add PF-POC-027 spec-impact note,
3. append logs + learnings with dual-event bounded-synthesis rationale and risk limits.

Gate:

1. `npm run check:strategy`
2. `npm run check:spec`

### C5 — Final Strict Gate

Deliverables:

1. all checkpoint evidence appended here,
2. final strict/freshness/strategy/spec gates green after documentation updates.

Gate:

1. `npm run verify:strict`
2. `npm run check:verification-fresh`
3. `npm run check:strategy`
4. `npm run check:spec`

## Linked Risk

1. `POC-033`

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 17:28 | Activated PF-POC-027 after PF-POC-026 merge closure with scope locked to bounded dual-event intent synthesis and fail-closed invalid mixed-event handling. | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `docs/strategy/PF-POC-027.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 17:35 | C1 RED complete: updated unit/conformance/fixture contracts to require dual-event (`success` + `failed`) synthesis and retained incompatible mixed-event conflict coverage; captured expected failing gates before implementation. | `test/unit/poc/ChefDirectionPlanner.test.mjs`, `test/integration/conformance/poc-pilot.conformance.test.mjs`, `test/fixtures/poc/poc-intent-synthesis-fixtures.json`, `test/fixtures/poc/poc-intent-synthesis-quality-criteria.json`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs` (RED), `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` (RED), `npm run poc:qualify:intent-synthesis` (RED) |
| 2026-03-13 17:38 | C2 GREEN complete: implemented bounded dual-event synthesis decomposition in planner with deterministic clause/signal ordering and preserved fail-closed event-conflict behavior for incompatible combinations. | `src/core/poc/ChefDirectionPlanner.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`, `npm run poc:qualify:intent-synthesis` |
| 2026-03-13 17:40 | C3 GREEN complete: strict verification route remained green with updated synthesis behavior and no regression across conformance suites. | `npm run verify:strict` |
| 2026-03-13 17:44 | C4 REFACTOR/docs complete: updated pilot runbook for dual-event synthesis usage and conflict map, added PF-POC-027 spec-impact note, and captured durable learning for bounded expansion strategy. | `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `notes/spec-impact/2026-03-13-pf-poc-027-dual-event-intent-synthesis.md`, `docs/learnings.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 17:45 | C5 final gates complete after documentation updates: strict verification, freshness, strategy, and spec checks are all green. | `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` |
