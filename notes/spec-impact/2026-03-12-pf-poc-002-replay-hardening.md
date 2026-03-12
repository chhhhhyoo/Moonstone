---
status: accepted
changed_areas:
  - runtime-core
  - replay-recovery
  - conformance-tests
consulted_sources:
  - specs/01-architecture.md
  - specs/02-workflows.md
  - docs/strategy/MILESTONES.md
  - docs/strategy/FUTURE-ACTIONS.md
decisions:
  - Add resume-time continuation reconciliation when a run is still running but has no queue/pending commands.
  - Cover crash windows after receipt persistence and retry scheduling with explicit conformance tests.
  - Track remaining fan-out continuation crash risk as a planned PF-POC-002 action.
---

# 2026-03-12 PF-POC-002 Replay Hardening Impact

## Summary

This change hardens replay/resume behavior for partial-failure windows discovered after PF-POC-001 merge.

## Runtime Contract Impact

1. `WorkflowRuntime.resume` now reconciles missing continuation work from persisted receipt/retry state when the journal tail indicates interrupted progression.
2. Recovery behavior is deterministic and journal-driven, preserving idempotency semantics for resumed attempts.

## Test Impact

1. Added conformance tests for crash after `receipt_recorded` and crash after `retry_scheduled`.
2. Verified that replay/resume drives runs to the expected terminal state without dropping downstream execution.

## Strategy Impact

1. `PF-POC-001` marked complete.
2. `PF-POC-002` moved to in progress with explicit next risk slice (multi-edge fan-out crash handling).
