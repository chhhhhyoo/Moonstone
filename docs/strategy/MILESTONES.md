# Milestones

Canonical milestone tracker for Moonstone.

| milestone_id | title | status | owner | target_window | depends_on | exit_criteria |
|---|---|---|---|---|---|---|
| PF-POC-001 | CLI-first workflow-builder POC (Webhook + HTTP + OpenAI) | done | core | 2026-Q1 | none | POC commands (poc:compile, poc:validate, poc:run, poc:serve, poc:replay, poc:inspect) run end-to-end with replay evidence and strict verification green |
| PF-POC-002 | Durable replay hardening for command/receipt execution | done | core | 2026-Q2 | PF-POC-001 | Crash-injected run can resume from append-only journal across command, receipt, retry scheduling, and fan-out continuation windows without duplicate side effects |
| PF-POC-003 | Prompt-to-workflow quality and branching coverage expansion | done | core | 2026-Q2 | PF-POC-001 | Compiler output quality, branch comparator coverage, and retry policy conformance are stable under strict gates |
| PF-POC-004 | Compiler diagnostics and prompt-contract guardrails | done | core | 2026-Q2 | PF-POC-003 | `poc:compile` emits deterministic diagnostics for inferred/fallback behavior and strict verification confirms diagnostic contract stability |
| PF-POC-005 | Workflow fixture corpus and golden compile regression matrix | done | core | 2026-Q2 | PF-POC-004 | Representative prompt/artifact fixture matrix is executable, deterministic, and enforced under strict verification |
| PF-POC-006 | Compile-to-runtime qualification matrix | done | core | 2026-Q2 | PF-POC-005 | Compiled fixture artifacts execute through runtime with branch-correct outcomes and deterministic command/receipt behavior under strict verification |
| PF-POC-007 | Fault-injection runtime matrix and recovery qualification | done | core | 2026-Q2 | PF-POC-006 | Fault-injected fixture runs recover or fail with expected deterministic outcomes across retry/failure paths under strict verification |
| PF-POC-008 | POC demo-readiness qualification and operator runbook | done | core | 2026-Q2 | PF-POC-007 | End-to-end demo scenarios, qualification evidence, and operator runbook are deterministic, runnable, and strict-gate backed |
| PF-POC-009 | Webhook ingress E2E qualification and deterministic run-id contract | done | core | 2026-Q2 | PF-POC-008 | Webhook-triggered runs are health-checked, run-id deterministic when header is provided, replay/inspect consistent, and strict-gate backed |
| PF-POC-010 | Resume CLI and crash-recovery operator qualification | done | core | 2026-Q2 | PF-POC-009 | `poc:resume` recovery flow proves deterministic crash-to-recovery operator behavior and strict-gate evidence is green |
| PF-POC-011 | Promptable tool-blueprint pilot qualification | done | core | 2026-Q2 | PF-POC-009 | Prompt-driven pilot outputs explicit deterministic tool blueprints and executes end-to-end with strict verification evidence |
| PF-POC-012 | Multi-tool prompt synthesis pilot qualification | done | core | 2026-Q2 | PF-POC-011 | Prompts with multiple tool intents compile into deterministic sequential multi-HTTP workflows and execute through pilot with strict qualification evidence |
| PF-POC-013 | Multi-step dataflow qualification for prompt-synthesized tool chains | done | core | 2026-Q2 | PF-POC-012 | Sequential multi-tool workflows propagate prior-step outputs into downstream commands deterministically with strict qualification evidence |
| PF-POC-014 | Upstream-status conditional routing for prompt-synthesized workflows | done | core | 2026-Q2 | PF-POC-013 | Prompts that express status-based branching compile into deterministic upstream-condition routes and execute with strict qualification evidence |
| PF-POC-015 | Lead-chef SSOT and direct-apply prompt mutation loop | done | core | 2026-Q2 | PF-POC-014 | Prompt-driven single-operation workflow mutations apply deterministically to new artifacts, remain replay/inspect-safe, and are qualified under strict gates |
| PF-POC-016 | Lead-chef pilot feedback loop qualification | in_progress | core | 2026-Q2 | PF-POC-015 | `poc:pilot` supports iterative direction (`compile -> mutate -> rerun`) without manual JSON editing, preserves artifact lineage evidence, and remains strict-gate qualified |
| PF-GOV-001 | PR governance automation hardening in CI | done | governance | 2026-Q1 | none | PR naming/scope/template checks are mandatory in CI |
| PF-LEGACY-001 | PF-RUNTIME-003 archival and supersession cleanup | done | core | 2026-Q1 | PF-POC-001 | Runtime-003 strategy docs explicitly marked superseded by PF-POC-001 |
