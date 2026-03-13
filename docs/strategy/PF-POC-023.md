# PF-POC-023: Direction-Pack Ambiguity Choice (Single Ambiguous Clause v1)

**Milestone**: `PF-POC-023`
**Execution Branch**: `codex/pf-runtime-037-pack-ambiguity-choice`
**Owner**: `core`
**Status**: `in_progress`
**Last Updated**: `2026-03-13`

## Objective

Upgrade multi-step direction packs so ambiguous clauses do not hard-fail by default:

1. allow deterministic candidate packs when exactly one clause is ambiguous,
2. require explicit candidate selection before apply,
3. preserve fail-closed behavior for multi-ambiguous packs.

## Critical Gap Assessment

PF-POC-022 moved us from micro-step to pack composition, but a major usability gap remains:

1. pack mode currently rejects any ambiguity, forcing users back to low-level rewrites,
2. this breaks the lead-chef composition loop at the exact moment where abstraction matters most,
3. naive auto-selection would be unsafe and non-transparent.

Skipping this slice keeps the platform deterministic but not chef-grade.

## Vision Alignment

This slice advances [VISION.md](/Users/chanhyunyoo/Project/Moonstone/VISION.md):

1. **Promptable graph mutation**: expands from single deterministic pack to deterministic pack-choice branching.
2. **Lead-chef operating model**: preserves high-level direction by offering structured choices instead of hard-fail rewrites.
3. **Fail-closed governance and verification**: ambiguous cases remain bounded and machine-qualified.

## Scope Lock

1. Applies only to direction-pack mode (`then` chain with 2-3 clauses).
2. Only one ambiguous clause is supported for candidate generation.
3. If more than one clause is ambiguous, fail closed.
4. Candidate ordering must be deterministic.
5. Apply requires explicit `--proposal-id` when pack status is choice-required.
6. No auto-pick heuristic.

## Non-Goals

1. No pack candidate generation for multiple ambiguous clauses.
2. No broad natural-language decomposition beyond explicit `then`.
3. No UI/canvas.

## Public Contract Target

1. Proposal mode:
   - `status: proposal_pack_only` when fully resolved.
   - `status: proposal_pack_choice_required` when exactly one clause is ambiguous.
2. Choice payload:
   - `proposalPackCandidates[]` with deterministic `packId`, proposals, and resolved anchors.
3. Apply mode:
   - in choice-required state, missing `--proposal-id` fails with deterministic code.
   - unknown `--proposal-id` fails with deterministic code.

## Checkpoint Plan (Fail-Closed)

### C0 — Merge Closure + Activation

Deliverables:

1. close PF-POC-022 milestone/action/risk,
2. activate PF-POC-023 milestone/action/risk,
3. create this plan before implementation.

Gate:

1. `npm run check:strategy`
2. `npm run check:spec`

### C1 — RED: Planner Pack-Choice Contracts

Deliverables:

1. failing unit tests for:
   - pack choice-required result when exactly one clause is ambiguous,
   - deterministic pack candidate ordering/ids,
   - fail-closed for multi-ambiguous clauses.
2. failing pilot conformance for:
   - `proposal_pack_choice_required`,
   - missing/unknown `--proposal-id` on apply.

Gate (must fail first):

1. `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`
2. `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`

### C2 — GREEN: Planner Pack-Choice Engine

Deliverables:

1. add choice-capable planner path for exactly one ambiguous clause,
2. generate deterministic candidate packs with stable IDs and ordering,
3. keep multi-ambiguous fail-closed.

Gate:

1. `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`

### C3 — GREEN: Pilot Apply Selection

Deliverables:

1. support `proposal_pack_choice_required` in `poc:pilot`,
2. enforce `--proposal-id` selection for pack apply when choice-required,
3. return deterministic error payload codes for missing/unknown selection.

Gate:

1. `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`

### C4 — REFACTOR: Docs + Spec Impact + Memory

Deliverables:

1. update pilot runbook with pack-choice examples and failure map,
2. add PF-POC-023 spec-impact note,
3. append log/learnings for anti-regression.

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

1. exactly-one ambiguous clause -> `choice_required` with deterministic pack candidates.
2. candidate pack IDs and ordering deterministic across reruns.
3. multi-ambiguous clauses fail closed with deterministic error code.

### Integration

1. `poc:pilot` proposal mode returns `proposal_pack_choice_required`.
2. apply missing `--proposal-id` fails deterministically.
3. apply unknown `--proposal-id` fails deterministically.
4. apply with valid candidate succeeds and preserves source artifact immutability.

### Conformance

1. new pack-choice scenario integrated into pilot conformance suite.
2. existing single-clause and pack-only paths remain green.

## Linked Risk

1. `POC-029`

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 21:40 | Activated PF-POC-023 after PF-POC-022 merge closure with bounded pack ambiguity-choice objective and fail-closed TDD checkpoints. | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `docs/strategy/PF-POC-023.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 21:48 | C1 RED captured expected failures: pack-choice planner export missing and pack ambiguity still hard-fails with `CHEF_DIRECTION_PACK_CLAUSE_AMBIGUOUS` in pilot conformance path. | `test/unit/poc/ChefDirectionPlanner.test.mjs`, `test/integration/conformance/poc-pilot.conformance.test.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 22:24 | C2/C3 GREEN completed: added `planChefDirectionPackWithChoices` and wired pilot `--proposal-id` selection for pack-choice apply with deterministic pack candidate/status/error contracts. | `src/core/poc/ChefDirectionPlanner.mjs`, `scripts/poc-pilot.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 22:31 | C4 REFACTOR completed: runbook updated for pack-choice flow and failure map; PF-POC-023 spec-impact and durable learning entries appended. | `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `notes/spec-impact/2026-03-13-pf-poc-023-direction-pack-ambiguity-choice.md`, `docs/learnings.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 22:43 | C5 strict qualification passed: full strict verification green with fresh verification-state check and strategy/spec gates green. | `npm run lint:fix`, `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` |
