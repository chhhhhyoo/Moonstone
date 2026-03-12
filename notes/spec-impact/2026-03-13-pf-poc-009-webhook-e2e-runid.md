---
status: accepted
changed_areas:
  - webhook-ingress
  - poc-cli
  - runtime-conformance
  - strategy-tracking
consulted_sources:
  - SPEC.md
  - specs/02-workflows.md
  - docs/strategy/PF-POC-009.md
  - docs/strategy/2026-03-12-pf-poc-001-risk-register.md
decisions:
  - Add optional webhook run-id override with default header `x-moonstone-run-id` and UUID fallback when absent.
  - Add a CLI-level webhook E2E qualification matrix that proves health/trigger/inspect/replay continuity.
  - Refactor shared CLI E2E test helpers to reduce duplicated spawn/poll/JSON parsing logic.
---

# 2026-03-13 PF-POC-009 Webhook E2E Run-ID Impact

## Summary

This slice starts PF-POC-009 by hardening ingress reproducibility and adding end-to-end webhook qualification evidence.

## Contract Impact

1. `startWebhookServer` now accepts optional run-id override from request header (`x-moonstone-run-id` by default).
2. `poc:serve` now accepts `--run-id-header <name>`.
3. Runbook/checklist now include webhook E2E verification path and deterministic run-id diagnostics.

## Test Impact

1. Added webhook fixture corpus:
   - `test/fixtures/poc/poc-webhook-e2e-fixtures.json`
2. Added webhook criteria contract:
   - `test/fixtures/poc/poc-webhook-e2e-quality-criteria.json`
3. Added webhook E2E qualification test:
   - `test/integration/conformance/poc-webhook-e2e-qualification.conformance.test.mjs`
4. Added shared CLI E2E helper module used by demo + webhook tests:
   - `test/integration/conformance/helpers/cli-e2e-helpers.mjs`

## Strategy Impact

1. Added `PF-POC-009` milestone plan doc.
2. Added `ACT-014` and `POC-013` as active tracking entries.
