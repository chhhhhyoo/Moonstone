---
status: accepted
changed_areas:
  - poc-cli
  - pilot-workflow
  - mutation-integration
  - runtime-conformance
consulted_sources:
  - VISION.md
  - docs/strategy/PF-POC-016.md
  - docs/workflows/PF-POC-PILOT-promptable-builder.md
decisions:
  - Extend `poc:pilot` with artifact-first execution mode (`--artifact`) so users can iterate without manual JSON edits.
  - Add optional `--feedback` mutation direction to apply one deterministic mutation before pilot execution.
  - Emit explicit lineage evidence (`sourceArtifactPath`, `effectiveArtifactPath`, mutation summary) for reproducible chef-style review loops.
---

# 2026-03-13 PF-POC-016 Pilot Feedback Loop Impact

## Summary

PF-POC-016 adds an iterative lead-chef loop to the pilot command so users can provide directional feedback and rerun mutated workflows with deterministic evidence.

## Contract Impact

1. `poc:pilot` now accepts:
   - `--artifact <path>` as an alternative to `--prompt`
   - optional `--feedback "..."` to apply one deterministic mutation pre-run
2. `poc:pilot` now returns lineage metadata:
   - `lineage.sourceArtifactPath`
   - `lineage.effectiveArtifactPath`
   - `lineage.feedbackPrompt`
   - `lineage.mutation` (`applied`, `operationType`, `changeSummary`, `planId`)
3. Source artifact immutability is preserved; feedback runs execute against a new mutated artifact file.

## Test Impact

1. Added conformance scenario in:
   - `test/integration/conformance/poc-pilot.conformance.test.mjs`
2. Scenario enforces:
   - artifact-first feedback invocation
   - deterministic lineage fields
   - source artifact byte immutability
   - inspect/replay completion continuity

## Operational Impact

1. Pilot runbook now documents chef feedback workflow:
   - `docs/workflows/PF-POC-PILOT-promptable-builder.md`
