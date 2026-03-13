---
status: accepted
changed_areas:
  - direction-planning
  - poc-cli
  - pilot-workflow
  - runtime-conformance
consulted_sources:
  - VISION.md
  - docs/strategy/PF-POC-019.md
  - docs/workflows/PF-POC-PILOT-promptable-builder.md
decisions:
  - Add deterministic role-index/anchor resolver so chef directions can reference workflow roles without explicit node IDs.
  - Restrict role substitution to anchor contexts only (`after`, `connect`, `replace`, `remove leaf`) to avoid unintended phrase rewrites.
  - Emit `resolvedAnchors` in proposal payload for reviewability and fail closed when role mapping is ambiguous.
---

# 2026-03-13 PF-POC-019 Role-Based Direction Anchor Impact

## Summary

PF-POC-019 introduces bounded node-id-free direction planning by resolving role references (request/summary/trigger) into deterministic concrete node anchors before mutation planning.

## Contract Impact

1. Added role-index + anchor resolver module:
   - `src/core/poc/ChefDirectionPlannerRoles.mjs`
2. Updated direction planner to:
   - resolve role references in context-aware anchor positions,
   - include `resolvedAnchors` evidence in proposal output,
   - preserve fail-closed ambiguity handling.
3. Existing apply-confirm runtime contract remains unchanged.

## Test Impact

1. Added role resolver unit suite:
   - `test/unit/poc/ChefDirectionPlannerRoles.test.mjs`
2. Expanded planner unit suite with role-direction scenarios:
   - `test/unit/poc/ChefDirectionPlanner.test.mjs`
3. Expanded pilot conformance suite with role-based direction scenario:
   - `test/integration/conformance/poc-pilot.conformance.test.mjs`

## Operational Impact

1. Pilot runbook now documents node-id-free role anchors and failure boundaries:
   - `docs/workflows/PF-POC-PILOT-promptable-builder.md`

## Known Limits (Intentional In This Slice)

1. Role taxonomy remains bounded (request/summary/trigger only).
2. Ambiguous roles require disambiguators (`first`/`latest`) and otherwise fail closed.
3. Multi-operation role-directed changes remain out of scope.
