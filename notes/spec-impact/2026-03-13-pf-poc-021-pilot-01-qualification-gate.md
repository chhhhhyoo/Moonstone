---
status: accepted
changed_areas:
  - direction-planning
  - poc-cli
  - runtime-conformance
  - pilot-workflow
consulted_sources:
  - VISION.md
  - docs/strategy/PF-POC-021.md
  - docs/workflows/PF-POC-PILOT-promptable-builder.md
decisions:
  - Add fixture-driven Pilot-01 conformance gate covering resolved role directions, ambiguity choice, apply-selection, invalid apply, and unsupported direction failures.
  - Normalize `poc:pilot` error behavior to deterministic JSON payloads with stable `error.code` and `error.message` on stdout.
  - Enforce natural node-id ordering for ambiguity candidate proposals (`...-2` before `...-10`) for deterministic, operator-legible proposal lists.
---

# 2026-03-13 PF-POC-021 Pilot-01 Qualification Gate Impact

## Summary

PF-POC-021 introduces a hard qualification gate for Pilot-01 so lead-chef behavior is validated with repeatable scenario evidence instead of isolated happy-path checks.

## Contract Impact

1. New conformance gate:
   - `test/integration/conformance/poc-pilot-01-qualification.conformance.test.mjs`
2. New fixture and criteria contracts:
   - `test/fixtures/poc/poc-pilot-01-fixtures.json`
   - `test/fixtures/poc/poc-pilot-01-quality-criteria.json`
3. New CLI gate command:
   - `npm run poc:qualify:pilot`
4. `poc:pilot` failure output contract:
   - deterministic stdout JSON payload on failure:
     - `ok: false`
     - `status: failed`
     - `error.code`
     - `error.message`

## Determinism Impact

1. Ambiguous role candidate ordering now uses natural node-id ordering, not naive lexical ordering:
   - `openai-summary-2` sorts before `openai-summary-10`.
2. Unit guard added:
   - `test/unit/poc/ChefDirectionPlanner.test.mjs`

## Operational Impact

1. Pilot runbook now includes:
   - Pilot-01 qualification command
   - failure-code to operator-action map
   - deterministic failure payload expectations

## Known Limits (Intentional In This Slice)

1. Qualification remains CLI-first; no UI/canvas validation.
2. Direction contract remains single-operation and fail-closed.
3. Choice flow still supports exactly one ambiguous role reference per direction.
