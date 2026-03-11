---
status: aligned
changed_areas:
  - runtime-core
  - validation
consulted_sources:
  - SPEC.md
  - specs/01-architecture.md
  - specs/04-validation.md
  - docs/strategy/2026-03-09-pf-runtime-003-build-plan.md
decisions:
  - "Introduced explicit kernel-level contract fields for actor addressing, run context, command envelopes, receipt envelopes, and artifact version pinning."
  - "Added runtime envelope validators as non-mutating guard utilities to establish shape contracts before implementing outbox/inbox execution flow."
  - "Extended contract verification and unit tests to block drift on new kernel envelope exports."
---

# Spec Impact: PF-RUNTIME-003 Kernel Envelope Contracts

This change introduces phase-A kernel contracts required for multi-actor orchestration hardening and durable command/receipt semantics.
