---
status: accepted
changed_areas:
  - poc-cli
  - pilot-workflow
  - direction-planning
  - runtime-conformance
consulted_sources:
  - VISION.md
  - docs/strategy/PF-POC-017.md
  - docs/workflows/PF-POC-PILOT-promptable-builder.md
decisions:
  - Add deterministic `ChefDirectionPlanner` to convert bounded intent directions into a single safe mutation proposal.
  - Extend `poc:pilot` with proposal-only `--direction` behavior and explicit apply gate via `--apply-direction`.
  - Keep source artifacts immutable and preserve inspect/replay safety by running only after explicit apply confirmation.
---

# 2026-03-13 PF-POC-017 Intent Direction Proposal Loop Impact

## Summary

PF-POC-017 raises pilot interaction from mutation syntax to intent direction by introducing a deterministic proposal checkpoint before any mutation is applied.

## Contract Impact

1. Added direction planner module:
   - `src/core/poc/ChefDirectionPlanner.mjs`
2. `poc:pilot` now accepts:
   - `--direction "..."` for proposal-only planning
   - `--apply-direction` to explicitly confirm apply + execute
3. Proposal-only contract:
   - `status: proposal_only`
   - `runId: null`
   - deterministic `proposal` payload (`proposalId`, `operationType`, `operation`, `confidence`, `rationale`, `ambiguity`)
4. Apply-confirm contract:
   - when `--apply-direction` is present, the proposed mutation is applied to a new artifact and the run executes.

## Test Impact

1. Added planner unit suite:
   - `test/unit/poc/ChefDirectionPlanner.test.mjs`
2. Extended pilot conformance:
   - `test/integration/conformance/poc-pilot.conformance.test.mjs`
3. New assertions cover:
   - deterministic proposal behavior
   - fail-closed ambiguity/vagueness handling
   - proposal-only no-run contract
   - apply-confirm mutated artifact execution with source immutability

## Operational Impact

1. Pilot runbook now documents direction proposal and explicit apply flow:
   - `docs/workflows/PF-POC-PILOT-promptable-builder.md`
2. Operators can now review a proposed mutation before execution without manual artifact edits.
