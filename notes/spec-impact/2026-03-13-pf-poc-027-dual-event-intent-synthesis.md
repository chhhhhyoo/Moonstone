---
status: accepted
changed_areas:
  - planner
  - conformance
  - pilot-workflow
  - strategy-governance
consulted_sources:
  - VISION.md
  - docs/strategy/PF-POC-027.md
  - docs/workflows/PF-POC-PILOT-promptable-builder.md
decisions:
  - Expand bounded intent synthesis to support explicit dual-event summary intent (`on success` + `on failed`) as a deterministic proposal-pack case.
  - Keep fail-closed rejection for incompatible mixed event combinations (for example `always` combined with another explicit event).
  - Preserve existing explicit-pack path and single-event synthesis path without schema changes.
---

# 2026-03-13 PF-POC-027 Dual-Event Intent Synthesis Impact

## Summary

PF-POC-027 removes a high-friction product gap: high-level synthesized directions can now express both success and failed review handling in one prompt without falling back to low-level micro-directions.

## Contract Impact

1. `chef-intent-pack-v1` synthesis now supports bounded dual-event summary intent:
   - explicit `on success` + `on failed` generates deterministic dual summary clauses.
2. Existing deterministic diagnostics remain in place:
   - `mode`
   - `synthesisApplied`
   - `derivedClauses[]`
   - `intentSignals[]`
3. Event conflict remains fail-closed for incompatible mixes:
   - `CHEF_DIRECTION_INTENT_EVENT_CONFLICT` is retained for invalid combinations (for example `on success` + `on always`).

## Test Impact

1. Unit planner tests now assert:
   - dual-event synthesis resolves with deterministic clause/event ordering,
   - incompatible mixed events still fail closed.
2. Pilot conformance now asserts:
   - dual-event proposal and apply path succeed,
   - incompatible mixed events fail with deterministic code.
3. Dedicated intent-synthesis qualification fixtures now include:
   - dual-event synthesis success scenario,
   - retained event-conflict scenario with incompatible event mix.

## Safety / Governance Impact

1. Capability expansion is bounded:
   - only `success` + `failed` dual-event summary synthesis was added,
   - no broad NLP widening.
2. Governance remains fail-closed:
   - milestone/action/risk tracking moved through required lifecycle updates,
   - strict verification gates remain mandatory.

## Known Limits (Deferred)

1. Dual-event synthesis is limited to bounded summary/report intent patterns.
2. More complex event choreography and heterogeneous per-event tool plans remain deferred to later slices.
