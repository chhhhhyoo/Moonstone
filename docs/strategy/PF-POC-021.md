# PF-POC-021: Pilot-01 Airtight Qualification Plan (Lead-Chef Runtime Fit)

**Milestone**: `PF-POC-021`
**Execution Branch**: `codex/pf-runtime-035-pilot-01-qualification`
**Owner**: `core`
**Status**: `done`
**Last Updated**: `2026-03-13`

## Objective

Prove Pilot-01 product fit with machine-enforced evidence, not narrative confidence:

1. chef can direct outcomes without node IDs,
2. system returns deterministic proposal/apply/run evidence,
3. replay/inspect integrity remains intact after iterative direction.

## Critical Gap Assessment (Brutal Version)

Current platform is technically strong but still vulnerable to false confidence:

1. passing unit/conformance on narrow patterns can still miss product-level failure modes,
2. no single hard qualification gate today declares "Pilot-01 is actually good enough",
3. without a scenario corpus + scoring contract, every slice can claim success on different bars.

If this slice is skipped, we risk "demo theater": many green checks, unclear product truth.

## Vision Alignment

This slice advances [VISION.md](/Users/chanhyunyoo/Project/Moonstone/VISION.md) by:

1. enforcing lead-chef operating model with scenario-level proof,
2. strengthening iterative synthesis evidence (`proposal -> apply -> run -> replay`),
3. protecting durable core guarantees while evolving direction quality.

## Pilot-01 Non-Negotiable Success Contract

Pilot-01 is accepted only when all are true:

1. **Abstraction**: scenario prompts require no explicit node IDs for targeted direction tasks.
2. **Determinism**: same input yields equivalent proposal IDs, candidate ordering, and mutation summaries.
3. **Safety**: ambiguous/unsupported cases fail closed with deterministic error codes.
4. **Durability**: every accepted scenario is inspectable and replayable with consistent terminal state.
5. **Lineage**: source/effective artifact paths and mutation evidence are always emitted.

## Scope Lock

1. Qualify current bounded operation pack (`add_http_after`, `add_openai_after`, `replace_node_tool`, `connect_nodes`, `remove_leaf_node`).
2. Qualify role-anchor ambiguity choice flow from PF-POC-020.
3. Enforce single-operation direction contract (no multi-op packs in this slice).
4. Keep connector scope fixed (`Webhook + HTTP + OpenAI`).

## Non-Goals

1. No fully open-ended graph synthesis from arbitrary vague prompts.
2. No autonomous in-run self-modifying node behavior.
3. No UI/canvas work.
4. No TypeScript migration in this slice.

## Checkpoint-Driven Delivery Plan (Fail-Closed)

Progress is blocked unless each checkpoint gate is green.

### C0 — Entry Gate (Governance + Baseline Freeze)

Deliverables:

1. PF-POC-020 merged and closed in milestone/action/risk trackers.
2. PF-POC-021 activated with linked action/risk entries.
3. Branch created: `codex/pf-runtime-035-pilot-01-qualification`.

Gate:

1. `npm run check:strategy`
2. `npm run check:spec`

### C1 — RED: Pilot-01 Scenario Corpus + Qualification Harness

Deliverables:

1. Add deterministic Pilot-01 scenario corpus fixture covering:
   - role-based resolved direction,
   - single-role ambiguity (`proposal_choice_required`),
   - apply with selected proposal id,
   - invalid missing proposal id,
   - invalid unknown proposal id,
   - unsupported vague direction,
   - replay/inspect continuity after apply.
2. Add failing conformance gate:
   - `test/integration/conformance/poc-pilot-01-qualification.conformance.test.mjs`

Gate (must fail before GREEN):

1. `node --test test/integration/conformance/poc-pilot-01-qualification.conformance.test.mjs`

### C2 — RED: Determinism + Drift Assertions

Deliverables:

1. Add deterministic snapshot assertions (semantic, not brittle raw full-file snapshots):
   - proposal candidate ordering,
   - proposalId stability,
   - mutation summary stability.
2. Add failing unit assertions in planner-level tests where behavior currently drifts.

Gate (must fail before GREEN):

1. `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`

### C3 — GREEN: Close Pilot-01 Product Gaps Found By RED

Deliverables:

1. Implement only gaps exposed by C1/C2 RED.
2. Keep behavior bounded and deterministic; do not widen scope opportunistically.
3. Ensure all Pilot-01 scenario IDs pass with inspect/replay assertions.

Gate:

1. `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`
2. `node --test test/integration/conformance/poc-pilot-01-qualification.conformance.test.mjs`

### C4 — REFACTOR: Shared Helpers + Error Contract Normalization

Deliverables:

1. Extract shared Pilot conformance helpers to remove duplicated process/json/assertion logic.
2. Normalize deterministic error code assertions for direction failures.
3. Update runbook with a compact failure map ("error code -> operator action").

Gate:

1. `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`
2. `node --test test/integration/conformance/poc-pilot-01-qualification.conformance.test.mjs`

### C5 — Final Qualification + Anti-Drift Gate

Deliverables:

1. Full strict verification green after final docs/log/spec sync.
2. Plan log includes evidence rows for each checkpoint.
3. Daily log + learnings updated with hard lessons from failed RED assumptions.

Gate:

1. `npm run verify:strict`
2. `npm run check:verification-fresh`
3. `npm run check:strategy`
4. `npm run check:spec`

## TDD Matrix (Required)

### Unit

1. Planner choice determinism: same artifact/direction -> same candidate set and IDs.
2. Multi-ambiguity fail-closed: deterministic rejection code.
3. Proposal-id selection integrity: selected candidate maps to exact operation payload.

### Integration

1. `poc:pilot` proposal-only resolved path.
2. `poc:pilot` proposal-choice-required path.
3. apply missing/unknown `--proposal-id` deterministic failure payload.
4. selected proposal apply preserves source artifact immutability.

### Conformance/E2E

1. pilot scenario corpus execution from fixture.
2. inspect/replay continuity check for each successful apply scenario.
3. determinism rerun check (same scenario repeated produces equivalent semantic outputs).

## Drift Prevention Protocol (Mandatory For This Slice)

1. No implementation step starts unless mapped to a specific checkpoint above.
2. Every material step appends an evidence entry in this plan immediately.
3. If an unplanned requirement appears, checkpoint table must be updated before coding.
4. Any failed checkpoint test blocks forward progress; no bypass commits.
5. No PR merge unless C0..C5 evidence is complete and strict gates are fresh.

## Risks (To Register On Activation)

1. `POC-025`: Pilot-01 confidence drift if scenario coverage is narrow or non-representative.
2. `POC-026`: Determinism regressions across proposal-choice flow under repeated runs.
3. `POC-027`: Operator confusion if failure codes exist without runbook action mapping.

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 19:00 | Drafted airtight Pilot-01 checkpoint/TDD plan with fail-closed progression gates. | `docs/strategy/PF-POC-021.md` |
| 2026-03-13 19:25 | Activated PF-POC-021 C0: closed PF-POC-020 tracker set, linked PF-POC-021 action/risk entries, and aligned execution branch to latest `origin/master`. | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `docs/strategy/PF-POC-020.md`, `docs/strategy/PF-POC-021.md`, `docs/logs/2026-03-13.md`, `git checkout -B codex/pf-runtime-035-pilot-01-qualification origin/master` |
| 2026-03-13 20:02 | C1 RED complete: added fixture-driven Pilot-01 qualification conformance gate and captured expected failures for invalid direction/apply paths (empty stdout on failures). | `test/fixtures/poc/poc-pilot-01-fixtures.json`, `test/fixtures/poc/poc-pilot-01-quality-criteria.json`, `test/integration/conformance/poc-pilot-01-qualification.conformance.test.mjs`, `node --test test/integration/conformance/poc-pilot-01-qualification.conformance.test.mjs` |
| 2026-03-13 20:08 | C2 RED complete: added unit determinism guard for natural numeric candidate ordering and captured expected failure (`...-10` sorted before `...-2`). | `test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs` |
| 2026-03-13 20:16 | C3 GREEN complete: implemented deterministic pilot error JSON contract and natural candidate ordering in planner; flipped C1/C2 targeted failures to green. | `scripts/poc-pilot.mjs`, `src/core/poc/ChefDirectionPlanner.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot-01-qualification.conformance.test.mjs` |
| 2026-03-13 20:19 | C4 REFACTOR complete: added dedicated `poc:qualify:pilot` command, refreshed pilot runbook failure map/operator actions, and documented slice-level spec impact. | `package.json`, `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `notes/spec-impact/2026-03-13-pf-poc-021-pilot-01-qualification-gate.md`, `npm run poc:qualify:pilot`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 20:24 | C5 final gate complete: strict verification, freshness, and strategy/spec checks are all green after Pilot-01 qualification updates. | `npm run lint:fix`, `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` |
