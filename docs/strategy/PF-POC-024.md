# PF-POC-024: Chef Intent Pack Synthesis v1 (No Explicit `then` Choreography)

**Milestone**: `PF-POC-024`
**Execution Branch**: `codex/pf-runtime-038-chef-pack-intent-synthesis`
**Owner**: `core`
**Status**: `in_progress`
**Last Updated**: `2026-03-13`

## Objective

Move one layer closer to lead-chef behavior:

1. accept high-level chef direction without explicit step-by-step operation choreography,
2. synthesize deterministic multi-operation proposal packs from that direction,
3. preserve fail-closed safety and proposal/apply confirmation boundaries.

## Critical Gap Assessment

PF-POC-023 fixed ambiguity in pack mode, but the product still asks users to write like low-level operators:

1. explicit `then` choreography is still required for most multi-step directions,
2. operation verbs are still expected per clause (`add/connect/replace/remove`),
3. this is structurally below the lead-chef abstraction promised in [VISION.md](/Users/chanhyunyoo/Project/Moonstone/VISION.md).

If we stop here, we keep deterministic machinery but fail the product test: user still authors workflow wiring manually.

## Vision Alignment

This slice advances [VISION.md](/Users/chanhyunyoo/Project/Moonstone/VISION.md):

1. **Promptable graph synthesis**:
   - extend direction planning from operation-script interpretation to bounded intent decomposition.
2. **Lead-chef operating model**:
   - chef provides outcome direction; system infers tool/topology pack proposal.
3. **Fail-closed governance and verification**:
   - intent synthesis remains deterministic, bounded, and strictly qualified.

## Scope Lock

1. Applies to `poc:pilot --direction` proposal/apply lane only.
2. Bounded synthesis only (2-3 operations max).
3. Supported synthesized intents (v1):
   - HTTP enrichment/check intent with explicit URL,
   - summary/report intent with optional event (`on success|failed|always`),
   - failure-route-to-summary intent.
4. Existing explicit direction pack (`then`) path remains canonical and backward-compatible.
5. Ambiguity policy remains strict:
   - exactly one ambiguity can produce choice candidates,
   - otherwise fail closed.

## Non-Goals

1. No free-form autonomous graph generation from vague prompts.
2. No multi-agent in-run self-modification.
3. No UI/canvas.
4. No connector expansion beyond `Webhook + HTTP + OpenAI`.

## Public Contract Target

1. `poc:pilot --direction "<high-level chef intent>"` can emit:
   - `status: proposal_pack_only` (resolved intent),
   - `status: proposal_pack_choice_required` (single bounded ambiguity),
   - deterministic failure payload for unsupported/ambiguous intent.
2. Proposal payload remains existing pack schema (`proposalPack` / `proposalPackCandidates`), no parallel schema fork.
3. Existing apply-confirm contract remains mandatory (`--apply-direction`, optional `--proposal-id` when required).

## Checkpoint Plan (Fail-Closed)

### C0 — Merge Closure + Activation

Deliverables:

1. close PF-POC-023 milestone/action/risk,
2. activate PF-POC-024 milestone/action/risk,
3. create this plan before implementation.

Gate:

1. `npm run check:strategy`
2. `npm run check:spec`

### C1 — RED: Intent-Synthesis Planner Contracts

Deliverables:

1. failing unit tests for:
   - high-level intent decomposition into deterministic pack proposals,
   - deterministic ordering and IDs across reruns,
   - fail-closed rejection for vague intent.
2. failing pilot conformance test case for high-level intent proposal/apply flow.

Gate (must fail first):

1. `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`
2. `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`

### C2 — GREEN: Planner Intent-to-Pack Synthesis

Deliverables:

1. add bounded intent decomposition path (without mandatory explicit `then`),
2. map supported intents to deterministic operation packs,
3. preserve pack-choice fail-closed behavior.

Gate:

1. `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`

### C3 — GREEN: Pilot CLI Integration

Deliverables:

1. wire intent-synthesis planner path into pilot direction flow,
2. keep explicit direction behavior backward-compatible,
3. keep deterministic proposal/apply status/error contracts.

Gate:

1. `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`

### C4 — REFACTOR: Runbook + Spec + Memory

Deliverables:

1. update pilot runbook with high-level intent examples and failure map,
2. add PF-POC-024 spec-impact note,
3. append logs/learnings with anti-regression notes.

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

## TDD Matrix

### Unit

1. same intent + artifact -> deterministic synthesized proposal pack.
2. supported high-level intent phrases map to expected operation sequence.
3. vague/underspecified intent fails closed with deterministic error.

### Integration

1. high-level intent proposal mode returns deterministic `proposal_pack_only` payload.
2. high-level intent apply mode executes mutated artifact and preserves source immutability.
3. ambiguous synthesized path requires explicit `--proposal-id` when choice-required.

### Conformance

1. existing explicit direction pack scenarios remain green.
2. new high-level intent scenario passes proposal/apply + inspect/replay continuity.

## Linked Risk

1. `POC-030`

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 23:12 | Activated PF-POC-024 after PF-POC-023 merge closure with bounded intent-to-pack synthesis objective and fail-closed checkpoint/TDD plan. | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `docs/strategy/PF-POC-023.md`, `docs/strategy/PF-POC-024.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 23:20 | C1 RED captured expected failures: high-level intent without explicit `then` fails with `CHEF_DIRECTION_PACK_REQUIRED` in planner and `CHEF_DIRECTION_UNSUPPORTED` in pilot CLI path. | `test/unit/poc/ChefDirectionPlanner.test.mjs`, `test/integration/conformance/poc-pilot.conformance.test.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 23:36 | C2/C3 GREEN completed: added bounded intent-to-pack synthesis fallback and wired pilot direction flow to promote unsupported single-direction intent into deterministic pack proposal/apply path. | `src/core/poc/ChefDirectionPlanner.mjs`, `scripts/poc-pilot.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 23:45 | C4 REFACTOR completed: runbook/spec-impact/learnings updated for high-level intent synthesis contract, limits, and anti-regression guidance. | `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `notes/spec-impact/2026-03-13-pf-poc-024-chef-intent-pack-synthesis.md`, `docs/learnings.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 23:54 | C5 strict qualification passed: lint/strict/freshness/strategy/spec gates are green after intent-synthesis implementation and docs sync. | `npm run lint:fix`, `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` |
