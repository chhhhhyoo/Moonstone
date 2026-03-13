---
status: accepted
changed_areas:
  - poc-cli
  - operator-workflow
  - runtime-conformance
consulted_sources:
  - SPEC.md
  - docs/workflows/PF-POC-008-operator-runbook.md
  - docs/strategy/PF-POC-010.md
decisions:
  - Add a single-command pilot lane (`poc:pilot`) to validate promptable workflow creation and execution quickly.
  - Provide default mock-mode execution so pilot validation does not depend on external APIs.
  - Add conformance coverage for pilot command output contract and artifact/run evidence files.
---

# 2026-03-13 PF Pilot Promptable Workflow Impact

## Summary

Introduces a practical product-signal lane to evaluate whether prompt-driven workflow creation feels usable before adding more governance-only layers.

## Contract Impact

1. New CLI entrypoint:
   - `npm run poc:pilot -- --prompt "..." [--mode mock|live] [--input <path|json>]`
2. Pilot output contract includes run status, executed node IDs, diagnostics summary, and paths for artifact/run/inspect/replay files.

## Test Impact

1. Added pilot conformance test:
   - `test/integration/conformance/poc-pilot.conformance.test.mjs`
2. Strict conformance route now validates pilot flow alongside existing matrices.

## Operational Impact

1. Added pilot runbook:
   - `docs/workflows/PF-POC-PILOT-promptable-builder.md`
