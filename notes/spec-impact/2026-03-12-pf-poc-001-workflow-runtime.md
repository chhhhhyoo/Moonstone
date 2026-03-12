---
status: accepted
changed_areas:
  - runtime-core
  - poc-cli
  - provider-connectors
  - strategy-governance
consulted_sources:
  - SPEC.md
  - specs/01-architecture.md
  - specs/02-workflows.md
  - docs/strategy/MILESTONES.md
  - docs/strategy/FUTURE-ACTIONS.md
decisions:
  - Introduce WorkflowArtifact-driven POC runtime with command/receipt envelopes.
  - Use append-only file-backed run journal for replay and inspection in v0.
  - Scope connector surface to webhook/http/openai and workflow semantics to sequential+branch+retry.
  - Supersede PF-RUNTIME-003 strategic stream with PF-POC-001 canonical stream.
---

# 2026-03-12 PF-POC-001 Workflow Runtime Impact

## Summary

This change introduces a runnable workflow-builder POC execution path and resets strategy trackers to PF-POC direction.

## Runtime Contract Additions

1. `WorkflowArtifact` schema validation and normalization.
2. POC `OperationCommand`/`OperationReceipt` envelope lifecycle for node execution.
3. File-backed append-only run journaling for replay and inspection.

## Operational Additions

1. New CLI commands: compile, validate, run, serve, replay, inspect.
2. New connector implementations for HTTP and OpenAI.
3. New replay/resume and connector conformance tests.

## Governance Impact

1. Strategy milestones/actions are now POC-first.
2. Legacy PF-RUNTIME-003 docs are explicitly marked superseded.
