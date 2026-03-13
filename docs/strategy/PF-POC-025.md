# PF-POC-025: Intent-Synthesis Explainability + Conflict Guardrails

**Milestone**: `PF-POC-025`
**Execution Branch**: `codex/pf-runtime-039-intent-synthesis-guardrails`
**Owner**: `core`
**Status**: `done`
**Last Updated**: `2026-03-13`

## Objective

Harden trust in the new intent-synthesis path without broadening language scope:

1. expose deterministic synthesis diagnostics so operators can inspect why a pack was inferred,
2. fail closed on bounded conflict patterns (multi-url, conflicting event intent),
3. preserve backward compatibility for explicit direction packs.

## Critical Gap Assessment

PF-POC-024 added bounded high-level intent synthesis, but two trust gaps remain:

1. synthesized packs currently show limited rationale context in diagnostics,
2. conflict patterns can pass through without explicit deterministic rejection,
3. this risks confidence drift before expanding synthesis breadth.

## Vision Alignment

This slice advances [VISION.md](/Users/chanhyunyoo/Project/Moonstone/VISION.md):

1. **Promptable graph synthesis**:
   - improves explainability for inferred topology/tool decisions.
2. **Lead-chef operating model**:
   - keeps users at direction/review level with explicit generated rationale.
3. **Fail-closed governance and verification**:
   - adds deterministic conflict rejection and strict qualification coverage.

## Scope Lock

1. No synthesis language expansion; keep existing bounded patterns.
2. Diagnostics extension is additive under existing `proposalPack.diagnostics`.
3. Conflict guardrails in scope:
   - multiple URLs in one synthesized direction,
   - conflicting `on <event>` intent in one synthesized direction.
4. Existing explicit direction pack and apply flows remain unchanged.

## Non-Goals

1. No free-form graph generation.
2. No connector scope expansion.
3. No UI/canvas work.

## Public Contract Target

For synthesized pack proposals (`diagnostics.mode = "chef-intent-pack-v1"`):

1. `diagnostics.synthesisApplied: true`
2. `diagnostics.derivedClauses[]` (deterministic ordered inferred clauses)
3. `diagnostics.intentSignals[]` (deterministic ordered inference signals)
4. `diagnostics.warnings[]` (deterministic list)

Deterministic failure codes:

1. `CHEF_DIRECTION_INTENT_MULTI_URL_CONFLICT`
2. `CHEF_DIRECTION_INTENT_EVENT_CONFLICT`

## Checkpoint Plan (Fail-Closed)

### C0 — Merge Closure + Activation

Deliverables:

1. close PF-POC-024 milestone/action/risk,
2. activate PF-POC-025 milestone/action/risk,
3. create this plan before implementation.

Gate:

1. `npm run check:strategy`
2. `npm run check:spec`

### C1 — RED: Diagnostics + Conflict Contracts

Deliverables:

1. failing unit tests for synthesis diagnostics fields and determinism,
2. failing unit tests for multi-url/event conflict rejection,
3. failing conformance tests for conflict failure payloads.

Gate (must fail first):

1. `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`
2. `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`

### C2 — GREEN: Planner Guardrails + Diagnostics

Deliverables:

1. implement deterministic synthesis diagnostics fields,
2. add explicit fail-closed conflict guards with deterministic error codes,
3. keep explicit pack path backward-compatible.

Gate:

1. `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`

### C3 — GREEN: Pilot Contract Assertions

Deliverables:

1. assert deterministic failure payload codes from CLI conformance path,
2. assert synthesized diagnostics shape at conformance level.

Gate:

1. `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`

### C4 — REFACTOR: Runbook + Spec + Memory

Deliverables:

1. update runbook with synthesized vs explicit guidance + conflict failure map,
2. add PF-POC-025 spec-impact note,
3. append log/learnings anti-regression notes.

Gate:

1. `npm run check:strategy`
2. `npm run check:spec`

### C5 — Final Strict Gate

Deliverables:

1. all checkpoint evidence logged in this plan,
2. strict verification/freshness green.

Gate:

1. `npm run verify:strict`
2. `npm run check:verification-fresh`
3. `npm run check:strategy`
4. `npm run check:spec`

## Linked Risk

1. `POC-031`

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 23:59 | Activated PF-POC-025 after PF-POC-024 merge closure with bounded explainability + guardrail objective and fail-closed checkpoint/TDD plan. | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `docs/strategy/PF-POC-024.md`, `docs/strategy/PF-POC-025.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 16:20 | C1 RED complete: added failing planner/conformance assertions for synthesized diagnostics contract and deterministic conflict codes (`CHEF_DIRECTION_INTENT_MULTI_URL_CONFLICT`, `CHEF_DIRECTION_INTENT_EVENT_CONFLICT`). | `test/unit/poc/ChefDirectionPlanner.test.mjs`, `test/integration/conformance/poc-pilot.conformance.test.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs` (RED), `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` (RED) |
| 2026-03-13 16:25 | C2+C3 GREEN complete: planner now emits deterministic synthesis diagnostics, explicit-pack non-synthesis diagnostics, and fail-closed conflict guards; unit + conformance suites green. | `src/core/poc/ChefDirectionPlanner.mjs`, `test/unit/poc/ChefDirectionPlanner.test.mjs`, `test/integration/conformance/poc-pilot.conformance.test.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs` (GREEN), `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` (GREEN) |
| 2026-03-13 16:29 | C4 REFACTOR/docs complete: updated operator runbook for synthesized vs explicit diagnostics interpretation and conflict action map; recorded PF-POC-025 spec impact and durable learning. | `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `notes/spec-impact/2026-03-13-pf-poc-025-intent-synthesis-explainability-guardrails.md`, `docs/learnings.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 16:30 | C5 strict gate complete: strict verification and freshness/strategy/spec checks all green after typecheck-safe JSDoc fix for diagnostics arrays. | `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` |
| 2026-03-13 16:43 | Merge closure complete: milestone/action/risk moved to done and next slice PF-POC-026 activated with dedicated qualification-gate plan before implementation edits. | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `docs/strategy/PF-POC-026.md`, `docs/logs/2026-03-13.md` |
