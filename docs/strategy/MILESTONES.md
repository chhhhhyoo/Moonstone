# Milestones

Canonical milestone tracker for Moonstone.

| milestone_id | title | status | owner | target_window | depends_on | exit_criteria |
|---|---|---|---|---|---|---|
| PF-POC-001 | CLI-first workflow-builder POC (Webhook + HTTP + OpenAI) | done | core | 2026-Q1 | none | POC commands (poc:compile, poc:validate, poc:run, poc:serve, poc:replay, poc:inspect) run end-to-end with replay evidence and strict verification green |
| PF-POC-002 | Durable replay hardening for command/receipt execution | done | core | 2026-Q2 | PF-POC-001 | Crash-injected run can resume from append-only journal across command, receipt, retry scheduling, and fan-out continuation windows without duplicate side effects |
| PF-POC-003 | Prompt-to-workflow quality and branching coverage expansion | in_progress | core | 2026-Q2 | PF-POC-001 | Compiler output quality, branch comparator coverage, and retry policy conformance are stable under strict gates |
| PF-GOV-001 | PR governance automation hardening in CI | done | governance | 2026-Q1 | none | PR naming/scope/template checks are mandatory in CI |
| PF-LEGACY-001 | PF-RUNTIME-003 archival and supersession cleanup | done | core | 2026-Q1 | PF-POC-001 | Runtime-003 strategy docs explicitly marked superseded by PF-POC-001 |
