---
status: accepted
changed_areas:
  - direction-planning
  - poc-cli
  - pilot-workflow
  - runtime-conformance
consulted_sources:
  - VISION.md
  - docs/strategy/PF-POC-020.md
  - docs/workflows/PF-POC-PILOT-promptable-builder.md
decisions:
  - Add choice-capable planner contract for single ambiguous role-anchor directions (`resolved` vs `choice_required`).
  - Require explicit `--proposal-id` for ambiguous direction apply path in `poc:pilot`.
  - Preserve fail-closed behavior for multi-ambiguous role references and non-role ambiguity classes.
---

# 2026-03-13 PF-POC-020 Role-Ambiguity Choice Flow Impact

## Summary

PF-POC-020 upgrades lead-chef direction handling from hard-fail ambiguity to deterministic proposal-choice flow for exactly one ambiguous role reference, while preserving explicit confirmation boundaries and fail-closed safety.

## Contract Impact

1. Direction planner now supports choice-capable output:
   - `status: resolved` with one proposal, or
   - `status: choice_required` with deterministic proposal candidates.
2. New planner API:
   - `planChefDirectionWithChoices(...)` in `src/core/poc/ChefDirectionPlanner.mjs`
3. Role analysis support:
   - `inspectChefRoleReference(...)` and `listChefRoleCandidates(...)` in `src/core/poc/ChefDirectionPlannerRoles.mjs`
4. `poc:pilot` direction apply contract:
   - `--proposal-id` is required when direction status is `choice_required`.
   - missing/unknown proposal IDs fail closed with deterministic error codes.

## Test Impact

1. Planner unit coverage expanded:
   - `test/unit/poc/ChefDirectionPlanner.test.mjs`
2. Pilot conformance expanded:
   - `test/integration/conformance/poc-pilot.conformance.test.mjs`

## Operational Impact

1. Pilot runbook now documents proposal-choice mode and apply semantics:
   - `docs/workflows/PF-POC-PILOT-promptable-builder.md`

## Known Limits (Intentional In This Slice)

1. Proposal-choice mode handles only one ambiguous role reference per direction.
2. Multi-ambiguous role references still fail closed.
3. Non-role ambiguity remains out of scope and fail closed.
