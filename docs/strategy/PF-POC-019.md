# PF-POC-019: Role-Based Direction Anchors For Node-ID-Free Mutation Planning

**Milestone**: `PF-POC-019`
**Execution Branch**: `codex/pf-runtime-033-role-based-direction`
**Owner**: `core`
**Status**: `in_progress`
**Last Updated**: `2026-03-13`

## Objective

Remove explicit node-ID authoring pressure from chef direction by introducing deterministic role-based anchor inference (for example "summary step", "first request step", "latest http node") while keeping fail-closed proposal-confirm contracts.

## Critical Gap Assessment

PF-POC-018 is materially better but still below product bar:

1. node-id dependency leaks implementation internals into user prompts,
2. role intent in natural language can’t be expressed safely without manual IDs,
3. this blocks realistic n8n/Opal-style direction where users specify outcome/role rather than graph symbols.

If we ignore this slice, we keep proving parser quality but not user-level abstraction progress.

## Vision Alignment

This slice advances `VISION.md` by:

1. moving interaction further from node-authoring to vision-level direction,
2. strengthening chef review loop with deterministic role-resolution evidence,
3. preserving durable safety via explicit ambiguity rejection instead of silent best-guess rewiring.

## Scope Lock

1. Add bounded role taxonomy in planner:
   - `summary_step` -> OpenAI summary-like nodes
   - `request_step_first` / `request_step_latest` -> HTTP nodes by deterministic order
   - `trigger_step` -> trigger anchor
2. Add role-reference syntax support in direction planner:
   - examples: `after summary step`, `connect trigger step to summary step`, `replace latest request step with openai ...`
3. Deterministic role resolution contract:
   - `resolvedAnchors` payload in proposal output,
   - ambiguity rejection when role maps to multiple candidates without explicit disambiguator,
   - unknown role rejection fail-closed.
4. Maintain existing node-ID paths; role-based mode is additive.
5. Keep single-operation contract and apply-confirm boundary unchanged.

## Non-Goals (This Slice)

1. No free-form semantic role understanding via LLM.
2. No multi-operation direction packs.
3. No automatic conflict resolution when role references are ambiguous.
4. No in-run self-modifying topology.

## TDD Plan (RED -> GREEN -> REFACTOR)

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | RED: role-resolution unit matrix | failing tests for role anchors, deterministic selection, and ambiguity rejection | `node --test test/unit/poc/ChefDirectionPlannerRoles.test.mjs` fails on missing role contracts | done |
| 2 | RED: planner integration for node-id-free directions | failing tests asserting role phrases map to expected operation plans and resolved anchors | `node --test test/unit/poc/ChefDirectionPlanner.test.mjs` fails on role-direction scenarios | done |
| 3 | RED: pilot conformance for role-direction flow | failing conformance scenario using role direction without node IDs | `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` fails on role-direction contract | done |
| 4 | GREEN: role inference + planner/pilot wiring | deterministic role-index inference and proposal payload anchor evidence implemented | targeted unit + conformance tests pass | done |
| 5 | REFACTOR: docs/spec/log sync | runbook + spec-impact + logs + learnings updated with role-based usage and failure map | docs/tests stay consistent | done |
| 6 | Strict regression and freshness | strict verification and tracker/spec checks pass after final sync | `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` | done |

## Test Plan And Qualification Criteria

1. Unit (`ChefDirectionPlannerRoles`):
   - deterministic role index generation from artifact,
   - deterministic `first/latest` selection,
   - explicit ambiguity rejection with deterministic error code/message.
2. Unit (`ChefDirectionPlanner`):
   - role phrases resolve into expected operation type and operation payload,
   - proposal includes `resolvedAnchors` evidence,
   - unsupported/ambiguous role phrases fail closed.
3. Conformance (`poc:pilot`):
   - role-based direction proposal-only path works without node IDs,
   - apply-confirm with role direction completes run and remains source-immutable,
   - inspect/replay consistency remains intact.
4. Qualification gates:
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
| 2026-03-13 15:27 | Activated PF-POC-019 after PF-RUNTIME-032 merge closure; closed PF-POC-018 tracker set and opened role-based next slice for node-id-free direction planning. | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `docs/strategy/PF-POC-018.md`, `docs/strategy/PF-POC-019.md`, `docs/logs/2026-03-13.md` |
| 2026-03-13 15:41 | Added RED tests for role-index contracts, role-based planner directions, and role-direction conformance path; confirmed expected failures for missing role module and unsupported role phrase planning. | `test/unit/poc/ChefDirectionPlannerRoles.test.mjs`, `test/unit/poc/ChefDirectionPlanner.test.mjs`, `test/integration/conformance/poc-pilot.conformance.test.mjs`, `node --test test/unit/poc/ChefDirectionPlannerRoles.test.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 15:56 | Implemented GREEN role-based anchor inference and planner integration: added deterministic role index/anchor resolver, context-aware role substitution, and `resolvedAnchors` proposal evidence; turned targeted suites green. | `src/core/poc/ChefDirectionPlannerRoles.mjs`, `src/core/poc/ChefDirectionPlanner.mjs`, `test/unit/poc/ChefDirectionPlannerRoles.test.mjs`, `test/unit/poc/ChefDirectionPlanner.test.mjs`, `test/integration/conformance/poc-pilot.conformance.test.mjs`, `node --test test/unit/poc/ChefDirectionPlannerRoles.test.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 16:05 | Completed REFACTOR sync for PF-POC-019 with role-based runbook guidance, spec-impact capture, and durable learning update. | `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `notes/spec-impact/2026-03-13-pf-poc-019-role-based-anchors.md`, `docs/logs/2026-03-13.md`, `docs/learnings.md` |
| 2026-03-13 16:13 | Completed strict regression and freshness gates after PF-POC-019 role-anchor implementation and documentation sync. | `npm run lint:fix`, `node --test test/unit/poc/ChefDirectionPlannerRoles.test.mjs`, `node --test test/unit/poc/ChefDirectionPlanner.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs`, `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` |
