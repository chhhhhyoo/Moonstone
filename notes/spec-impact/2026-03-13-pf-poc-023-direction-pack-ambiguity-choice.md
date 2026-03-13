---
status: accepted
changed_areas:
  - direction-planning
  - poc-cli
  - pilot-workflow
  - runtime-conformance
consulted_sources:
  - VISION.md
  - docs/strategy/PF-POC-023.md
  - docs/workflows/PF-POC-PILOT-promptable-builder.md
decisions:
  - Add bounded pack-choice planner behavior: when exactly one pack clause is ambiguous, emit deterministic `proposalPackCandidates[]` instead of hard-failing.
  - Keep fail-closed posture for higher ambiguity: multiple ambiguous clauses in one pack are rejected deterministically.
  - Require explicit `--proposal-id` selection for ambiguous pack apply; no best-guess auto-apply.
---

# 2026-03-13 PF-POC-023 Direction-Pack Ambiguity Choice Impact

## Summary

PF-POC-023 extends direction-pack mutation from PF-POC-022 by adding a deterministic choice layer for the single-ambiguous-clause case, preserving lead-chef abstraction without weakening safety.

## Contract Impact

1. New planner API:
   - `planChefDirectionPackWithChoices(...)` in `src/core/poc/ChefDirectionPlanner.mjs`
2. Pack proposal status expansion:
   - `status: proposal_pack_choice_required`
   - `proposalPackCandidates[]` with deterministic `packId` and ordered `proposals[]`
3. Pack apply contract:
   - when pack choice is required, `--proposal-id` is mandatory
   - missing/unknown selection returns deterministic failure payloads

## Safety Contract

1. Exactly one ambiguous clause is supported in pack-choice mode.
2. Multiple ambiguous clauses fail closed with `CHEF_DIRECTION_PACK_MULTI_AMBIGUOUS`.
3. No auto-selection heuristics; operator selection is explicit.
4. Existing artifact immutability + inspect/replay lineage guarantees remain unchanged.

## Test Impact

1. Planner unit coverage expanded:
   - `test/unit/poc/ChefDirectionPlanner.test.mjs`
2. Pilot conformance expanded:
   - `test/integration/conformance/poc-pilot.conformance.test.mjs`

## Operational Impact

1. Pilot runbook now documents:
   - pack-choice proposal flow
   - explicit apply selection flow
   - deterministic pack-choice error/failure map

## Known Limits (Deferred)

1. Candidate generation is limited to the single ambiguous clause case.
2. Clause decomposition remains explicit `then` chaining only.
