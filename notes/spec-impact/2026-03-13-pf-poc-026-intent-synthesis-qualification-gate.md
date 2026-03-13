---
status: accepted
changed_areas:
  - conformance
  - poc-cli
  - pilot-workflow
  - strategy-governance
consulted_sources:
  - VISION.md
  - docs/strategy/PF-POC-026.md
  - docs/workflows/PF-POC-PILOT-promptable-builder.md
decisions:
  - Add a dedicated intent-synthesis qualification corpus and conformance gate to isolate synthesized-vs-explicit diagnostics and conflict rejection behavior from broad pilot suites.
  - Add first-class operator command `poc:qualify:intent-synthesis` for targeted synthesis regression checks.
  - Keep planner capability unchanged in this slice; focus only on qualification strength and evidence clarity.
---

# 2026-03-13 PF-POC-026 Intent-Synthesis Qualification Gate Impact

## Summary

PF-POC-026 introduces a dedicated fixture-driven qualification lane for intent-synthesis behavior so diagnostics and fail-closed contracts are validated explicitly instead of being buried in broad pilot tests.

## Contract Impact

1. New fixture corpus:
   - `test/fixtures/poc/poc-intent-synthesis-fixtures.json`
   - `test/fixtures/poc/poc-intent-synthesis-quality-criteria.json`
2. New conformance suite:
   - `test/integration/conformance/poc-intent-synthesis-qualification.conformance.test.mjs`
3. New command:
   - `npm run poc:qualify:intent-synthesis`

## Qualification Scope

1. Synthesized pack diagnostics determinism:
   - `mode = chef-intent-pack-v1`
   - `synthesisApplied = true`
   - deterministic `derivedClauses[]` and `intentSignals[]`
2. Explicit-pack invariance:
   - `mode = bounded-operation-direction-pack-v1`
   - `synthesisApplied = false`
   - empty derived/signal arrays
3. Conflict rejection codes:
   - `CHEF_DIRECTION_INTENT_MULTI_URL_CONFLICT`
   - `CHEF_DIRECTION_INTENT_EVENT_CONFLICT`
4. Unsupported fallback:
   - `CHEF_DIRECTION_UNSUPPORTED`

## Safety / Governance Impact

1. Isolated synthesis gate reduces regression masking risk from broad pilot conformance runs.
2. Operator workflow gains a focused pre-strict check for synthesis drift.
3. No runtime mutation/connector capability expansion in this slice.

## Test Impact

1. Dedicated conformance suite is executable directly:
   - `npm run poc:qualify:intent-synthesis`
2. Suite is also included via existing strict conformance runner (`npm run verify:strict`) because it lives under `test/integration/conformance`.

## Known Limits (Deferred)

1. Qualification remains pattern-bounded by current synthesis capabilities.
2. No language coverage expansion is attempted in PF-POC-026.
