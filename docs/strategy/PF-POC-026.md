# PF-POC-026: Intent-Synthesis Qualification Matrix + Operator Gate

**Milestone**: `PF-POC-026`
**Execution Branch**: `codex/pf-runtime-040-intent-synthesis-qualification-gate`
**Owner**: `core`
**Status**: `in_progress`
**Last Updated**: `2026-03-13`

## Objective

Lock intent-synthesis behavior behind an explicit, fixture-driven qualification gate before any language-scope expansion:

1. create a dedicated qualification matrix for synthesized-vs-explicit pack diagnostics,
2. enforce deterministic fail-closed conflict rejection assertions for bounded synthesis conflicts,
3. provide a first-class operator command for this lane so regressions are not hidden in broad conformance suites.

## Critical Gap Assessment

PF-POC-025 hardened planner behavior, but qualification still relies on broad pilot suites:

1. intent-synthesis assertions are mixed with unrelated pilot scenarios,
2. no dedicated fixture/criteria corpus exists for synthesis diagnostics and conflict behavior,
3. this increases regression detection latency and weakens operator confidence before capability expansion.

## Vision Alignment

This slice advances [VISION.md](/Users/chanhyunyoo/Project/Moonstone/VISION.md):

1. **Promptable graph synthesis**:
   - protects synthesis contracts with deterministic, visible qualification evidence.
2. **Lead-chef operating model**:
   - preserves review trust by machine-checking synthesized rationale and fail-closed behavior.
3. **Fail-closed governance and verification**:
   - isolates intent-synthesis safety into a dedicated gate wired into strict verification.

## Scope Lock

1. No new synthesis language patterns.
2. No changes to connector scope.
3. No UI/canvas work.
4. Focus is qualification harness + evidence path only.

## Non-Goals

1. No planner capability expansion beyond current bounded intent synthesis.
2. No mutation/runtime semantic changes unrelated to qualification determinism.
3. No redesign of pilot output schema.

## Public Contract Target

1. New intent-synthesis fixture corpus:
   - `test/fixtures/poc/poc-intent-synthesis-fixtures.json`
   - `test/fixtures/poc/poc-intent-synthesis-quality-criteria.json`
2. New dedicated conformance suite:
   - `test/integration/conformance/poc-intent-synthesis-qualification.conformance.test.mjs`
3. New operator command:
   - `npm run poc:qualify:intent-synthesis`
4. Strict route inclusion:
   - command must run in strict verification path via existing conformance route.

## Checkpoint Plan (Fail-Closed)

### C0 — Merge Closure + Activation

Deliverables:

1. close PF-POC-025 milestone/action/risk,
2. activate PF-POC-026 milestone/action/risk,
3. create this plan before any implementation edits.

Gate:

1. `npm run check:strategy`
2. `npm run check:spec`

### C1 — RED: Qualification Matrix Contracts

Deliverables:

1. failing fixture corpus for synthesized success, explicit-pack invariance, conflict rejection, and unsupported vague direction behavior,
2. failing dedicated conformance suite consuming fixture/criteria files,
3. failing command route for `poc:qualify:intent-synthesis` (missing script/wiring initially).

Gate (must fail first):

1. `node --test test/integration/conformance/poc-intent-synthesis-qualification.conformance.test.mjs`

### C2 — GREEN: Harness + Command Wiring

Deliverables:

1. implement dedicated conformance harness and fixtures,
2. wire `npm run poc:qualify:intent-synthesis`,
3. ensure deterministic pass/fail payload checks for:
   - synthesized diagnostics contract,
   - explicit-pack non-synthesis contract,
   - `CHEF_DIRECTION_INTENT_MULTI_URL_CONFLICT`,
   - `CHEF_DIRECTION_INTENT_EVENT_CONFLICT`,
   - `CHEF_DIRECTION_UNSUPPORTED`.

Gate:

1. `npm run poc:qualify:intent-synthesis`

### C3 — GREEN: Strict Verification Integration

Deliverables:

1. ensure new qualification suite is included in strict conformance path,
2. ensure no contract drift against existing pilot/conformance suites.

Gate:

1. `npm run verify:strict`

### C4 — REFACTOR: Docs + Memory

Deliverables:

1. update runbook with dedicated qualification command and interpretation guidance,
2. add PF-POC-026 spec-impact note,
3. append logs/learnings with anti-regression rationale for isolated synthesis gates.

Gate:

1. `npm run check:strategy`
2. `npm run check:spec`

### C5 — Final Strict Gate

Deliverables:

1. all checkpoint evidence logged in this plan,
2. strict verification/freshness green after final documentation updates.

Gate:

1. `npm run verify:strict`
2. `npm run check:verification-fresh`
3. `npm run check:strategy`
4. `npm run check:spec`

## Linked Risk

1. `POC-032`

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 16:43 | Activated PF-POC-026 after PF-POC-025 merge closure with scope locked to dedicated intent-synthesis qualification gate (no capability expansion). | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `docs/strategy/PF-POC-026.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 16:47 | C1 RED complete: added dedicated intent-synthesis fixture corpus and conformance suite with an intentional failing contract on missing `poc:qualify:intent-synthesis` command wiring. | `test/fixtures/poc/poc-intent-synthesis-fixtures.json`, `test/fixtures/poc/poc-intent-synthesis-quality-criteria.json`, `test/integration/conformance/poc-intent-synthesis-qualification.conformance.test.mjs`, `node --test test/integration/conformance/poc-intent-synthesis-qualification.conformance.test.mjs` (RED) |
| 2026-03-13 16:48 | C2 GREEN complete: wired `poc:qualify:intent-synthesis` command and validated dedicated synthesis qualification matrix pass. | `package.json`, `npm run poc:qualify:intent-synthesis` |
| 2026-03-13 16:49 | C3 GREEN complete: strict verification confirms dedicated intent-synthesis suite is included in conformance route and no drift is introduced. | `npm run verify:strict` |
| 2026-03-13 16:50 | C4 REFACTOR/docs complete: updated pilot runbook with dedicated synthesis qualification command/guidance, added PF-POC-026 spec-impact, and captured durable learning note. | `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `notes/spec-impact/2026-03-13-pf-poc-026-intent-synthesis-qualification-gate.md`, `docs/learnings.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 16:51 | C5 final gates complete after documentation updates: strict verification, freshness, strategy, and spec checks all green. | `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` |
