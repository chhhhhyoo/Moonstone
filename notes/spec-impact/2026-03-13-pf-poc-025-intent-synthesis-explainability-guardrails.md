---
status: accepted
changed_areas:
  - direction-planning
  - poc-cli
  - pilot-workflow
  - runtime-conformance
consulted_sources:
  - VISION.md
  - docs/strategy/PF-POC-025.md
  - docs/workflows/PF-POC-PILOT-promptable-builder.md
decisions:
  - Extend `proposalPack.diagnostics` with deterministic synthesis transparency fields (`synthesisApplied`, `derivedClauses[]`, `intentSignals[]`, `warnings[]`) without introducing a new top-level payload fork.
  - Add fail-closed synthesis conflict guards for multi-URL intent and conflicting explicit event intent in a single inferred direction.
  - Keep explicit `then` direction-pack behavior backward-compatible and non-synthesized even when synthesis fallback is enabled.
---

# 2026-03-13 PF-POC-025 Intent-Synthesis Explainability + Safety Guardrails Impact

## Summary

PF-POC-025 hardens trust in high-level intent synthesis by making inferred planning rationale explicitly visible and by blocking bounded conflict patterns with deterministic error codes.

## Contract Impact

1. `proposalPack.diagnostics` (synthesized and explicit packs) now includes deterministic fields:
   - `mode`
   - `synthesisApplied`
   - `derivedClauses[]`
   - `intentSignals[]`
   - `warnings[]`
2. Synthesized packs (`mode = chef-intent-pack-v1`) now carry explainability evidence for why a pack was inferred.
3. Explicit packs (`mode = bounded-operation-direction-pack-v1`) remain backward-compatible and non-synthesized (`synthesisApplied = false`).

## Safety Contract

1. Synthesis now rejects multi-URL direction intent with:
   - `CHEF_DIRECTION_INTENT_MULTI_URL_CONFLICT`
2. Synthesis now rejects conflicting explicit event intent (`on success` + `on failed`) with:
   - `CHEF_DIRECTION_INTENT_EVENT_CONFLICT`
3. Unsupported vague direction still fails closed with:
   - `CHEF_DIRECTION_UNSUPPORTED`

## Test Impact

1. Planner unit coverage expanded:
   - `test/unit/poc/ChefDirectionPlanner.test.mjs`
2. Pilot conformance expanded:
   - `test/integration/conformance/poc-pilot.conformance.test.mjs`
3. New assertions verify:
   - deterministic diagnostics fields for synthesized and explicit pack paths,
   - deterministic rejection codes for bounded synthesis conflict cases.

## Operational Impact

1. Operator runbook now documents:
   - synthesized vs explicit diagnostics interpretation,
   - conflict error/action map for intent synthesis.
2. Pilot outputs are more reviewable for lead-chef workflows because inferred clause chains and intent signals are surfaced directly.

## Known Limits (Deferred)

1. Synthesis remains intentionally pattern-bounded; no broad natural-language expansion in this slice.
2. Conflict guards cover bounded known patterns only (multi-URL/event-conflict) and intentionally fail closed for other unsupported ambiguity.
