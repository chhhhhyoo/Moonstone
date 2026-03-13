---
status: accepted
changed_areas:
  - direction-planning
  - poc-cli
  - pilot-workflow
  - runtime-conformance
consulted_sources:
  - VISION.md
  - docs/strategy/PF-POC-018.md
  - docs/workflows/PF-POC-PILOT-promptable-builder.md
decisions:
  - Expand `ChefDirectionPlanner` from summary-only mapping to bounded multi-operation intent mapping.
  - Add deterministic proposal diff preview so chef review can see graph impact before explicit apply.
  - Keep single-operation fail-closed direction contract and preserve source artifact immutability.
---

# 2026-03-13 PF-POC-018 Intent Operation-Pack And Proposal Preview Impact

## Summary

PF-POC-018 extends intent-direction planning so pilot feedback supports bounded add/replace/connect/remove directions and returns deterministic graph-diff preview prior to apply.

## Contract Impact

1. Planner operation coverage expanded:
   - `src/core/poc/ChefDirectionPlanner.mjs`
2. New preview contract module:
   - `src/core/poc/ChefDirectionPlannerPreview.mjs`
3. `poc:pilot` proposal output now includes:
   - `proposal.preview.affectedNodeIds`
   - `proposal.preview.nodeAdds`, `nodeUpdates`, `nodeRemoves`
   - `proposal.preview.edgeAdds`, `edgeRemoves`
   - `proposal.preview.blocked`, `blockedReasons`
4. Proposal/apply flow remains explicit:
   - no auto-apply without `--apply-direction`

## Test Impact

1. Extended planner unit matrix:
   - `test/unit/poc/ChefDirectionPlanner.test.mjs`
2. Added preview unit suite:
   - `test/unit/poc/ChefDirectionPlannerPreview.test.mjs`
3. Extended pilot conformance matrix:
   - `test/integration/conformance/poc-pilot.conformance.test.mjs`

## Operational Impact

1. Pilot runbook now includes operation-pack direction examples and preview expectations:
   - `docs/workflows/PF-POC-PILOT-promptable-builder.md`

## Known Limits (Intentional In This Slice)

1. Planner remains bounded heuristic mapping (no free-form LLM planning).
2. Single operation per direction remains mandatory.
3. In-run autonomous topology changes remain out of scope.
