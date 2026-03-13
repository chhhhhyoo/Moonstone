---
status: accepted
changed_areas:
  - direction-planning
  - poc-cli
  - pilot-workflow
  - runtime-conformance
consulted_sources:
  - VISION.md
  - docs/strategy/PF-POC-022.md
  - docs/workflows/PF-POC-PILOT-promptable-builder.md
decisions:
  - Add bounded multi-clause `then` direction-pack planning (`maxClauses=3`) for lead-chef composition intent.
  - Require deterministic per-clause proposal resolution in pack mode; ambiguous clauses fail closed in v1.
  - Apply full direction pack atomically (all-or-none) to preserve artifact lineage and safety.
---

# 2026-03-13 PF-POC-022 Direction Pack v1 Impact

## Summary

PF-POC-022 upgrades `poc:pilot` from single-operation direction proposals to bounded multi-step direction packs, enabling n8n-style composed topology mutation intent in one chef directive while preserving deterministic and fail-closed behavior.

## Contract Impact

1. New planner API:
   - `planChefDirectionPack(...)` in `src/core/poc/ChefDirectionPlanner.mjs`
2. Pack proposal contract:
   - `status: proposal_pack_only`
   - `proposalPack.packId`
   - `proposalPack.proposals[]` (ordered by clause index)
3. Pack apply semantics:
   - atomic all-or-none apply across all clause proposals
   - deterministic failure payload on pack-specific failures

## Safety Limits (Intentional v1)

1. Clause separator is explicit `then`.
2. Maximum clause count is 3.
3. Ambiguous clause in pack mode fails closed (`CHEF_DIRECTION_PACK_CLAUSE_AMBIGUOUS`).
4. `--proposal-id` is not supported for pack apply (`CHEF_DIRECTION_PACK_PROPOSAL_ID_UNSUPPORTED`).

## Test Impact

1. Planner unit coverage expanded:
   - `test/unit/poc/ChefDirectionPlanner.test.mjs`
2. Pilot conformance expanded:
   - `test/integration/conformance/poc-pilot.conformance.test.mjs`

## Operational Impact

1. Pilot runbook now documents:
   - multi-step direction-pack proposal/apply flow
   - pack-specific limits and failure-code handling

## Known Limits (Deferred)

1. Pack mode does not yet support ambiguity-choice candidate selection inside a pack.
2. Natural-language pack decomposition is limited to explicit `then` chaining.
