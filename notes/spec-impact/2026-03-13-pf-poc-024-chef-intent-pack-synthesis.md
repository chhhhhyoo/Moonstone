---
status: accepted
changed_areas:
  - direction-planning
  - poc-cli
  - pilot-workflow
  - runtime-conformance
consulted_sources:
  - VISION.md
  - docs/strategy/PF-POC-024.md
  - docs/workflows/PF-POC-PILOT-promptable-builder.md
decisions:
  - Add bounded high-level intent synthesis path that can produce deterministic direction packs without explicit `then` choreography.
  - Reuse existing proposal pack schema and apply-confirm contract; do not introduce a parallel payload format.
  - Keep fail-closed posture by using intent synthesis only as a fallback for unsupported single-direction plans and rethrowing unsupported errors when no bounded synthesis pattern applies.
---

# 2026-03-13 PF-POC-024 Chef Intent Pack Synthesis Impact

## Summary

PF-POC-024 raises the lead-chef abstraction by allowing bounded high-level intent sentences to synthesize deterministic multi-operation direction packs, reducing explicit operation choreography burden while preserving existing safety contracts.

## Contract Impact

1. Planner:
   - `planChefDirectionPackWithChoices(...)` now supports optional bounded intent synthesis via `allowIntentSynthesis`.
   - pack diagnostics mode now distinguishes inferred intent packs: `chef-intent-pack-v1`.
2. Pilot CLI:
   - single-direction planning path now attempts intent-pack synthesis when primary planner fails with `CHEF_DIRECTION_UNSUPPORTED`.
3. Output schema:
   - unchanged top-level shape (`proposalPack` / `proposalPackCandidates`) to avoid contract fork.

## Safety Contract

1. Intent synthesis is bounded and deterministic; no open-ended graph generation.
2. Unsupported/vague intent remains fail-closed (`CHEF_DIRECTION_UNSUPPORTED`).
3. Synthesized packs still pass through existing pack ambiguity/apply safety boundaries.
4. Source artifact immutability and inspect/replay continuity guarantees are unchanged.

## Test Impact

1. Planner unit coverage expanded:
   - `test/unit/poc/ChefDirectionPlanner.test.mjs`
2. Pilot conformance expanded:
   - `test/integration/conformance/poc-pilot.conformance.test.mjs`

## Operational Impact

1. Pilot runbook now includes:
   - high-level intent synthesis example,
   - expected deterministic output semantics,
   - bounded synthesis limits and failure behavior.

## Known Limits (Deferred)

1. Intent synthesis remains pattern-bounded, not general autonomous topology design.
2. Multi-ambiguity and vague directions remain fail-closed.
