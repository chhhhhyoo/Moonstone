# Milestones

Canonical milestone tracker for Moonstone.

| milestone_id | title | status | owner | target_window | depends_on | exit_criteria |
|---|---|---|---|---|---|---|
| PF-POC-001 | CLI-first workflow-builder POC (Webhook + HTTP + OpenAI) | done | core | 2026-Q1 | none | POC commands (poc:compile, poc:validate, poc:run, poc:serve, poc:replay, poc:inspect) run end-to-end with replay evidence and strict verification green |
| PF-POC-002 | Durable replay hardening for command/receipt execution | done | core | 2026-Q2 | PF-POC-001 | Crash-injected run can resume from append-only journal across command, receipt, retry scheduling, and fan-out continuation windows without duplicate side effects |
| PF-POC-003 | Prompt-to-workflow quality and branching coverage expansion | done | core | 2026-Q2 | PF-POC-001 | Compiler output quality, branch comparator coverage, and retry policy conformance are stable under strict gates |
| PF-POC-004 | Compiler diagnostics and prompt-contract guardrails | done | core | 2026-Q2 | PF-POC-003 | `poc:compile` emits deterministic diagnostics for inferred/fallback behavior and strict verification confirms diagnostic contract stability |
| PF-POC-005 | Workflow fixture corpus and golden compile regression matrix | done | core | 2026-Q2 | PF-POC-004 | Representative prompt/artifact fixture matrix is executable, deterministic, and enforced under strict verification |
| PF-POC-006 | Compile-to-runtime qualification matrix | in_progress | core | 2026-Q2 | PF-POC-005 | Compiled fixture artifacts execute through runtime with branch-correct outcomes and deterministic command/receipt behavior under strict verification |
| PF-GOV-001 | PR governance automation hardening in CI | done | governance | 2026-Q1 | none | PR naming/scope/template checks are mandatory in CI |
| PF-LEGACY-001 | PF-RUNTIME-003 archival and supersession cleanup | done | core | 2026-Q1 | PF-POC-001 | Runtime-003 strategy docs explicitly marked superseded by PF-POC-001 |
