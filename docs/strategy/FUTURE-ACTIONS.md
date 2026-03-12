# Future Actions

Canonical operational backlog for follow-up work tied to milestones.

| action_id | linked_milestone_id | priority | owner | due_window | blocking_risk | definition_of_done | status | evidence_ref |
|---|---|---|---|---|---|---|---|---|
| ACT-001 | PF-POC-001 | high | core | 2026-Q1 | POC compiler output may drift from runtime schema and fail at execution time | `poc:compile` and `poc:validate` are deterministic and validated under tests | done | docs/logs/2026-03-12.md#pf-poc-001-runtime-implementation |
| ACT-002 | PF-POC-001 | high | core | 2026-Q1 | Runtime side effects can duplicate during crash windows without replay-safe command tracking | Append-only command/receipt journaling and replay path are passing conformance tests | done | docs/logs/2026-03-12.md#pf-poc-001-runtime-implementation |
| ACT-003 | PF-POC-001 | high | core | 2026-Q1 | No public ingress makes workflow execution hard to demonstrate and assess | `poc:serve` webhook ingress executes artifacts and returns run summaries | done | docs/logs/2026-03-12.md#pf-poc-001-runtime-implementation |
| ACT-004 | PF-POC-002 | high | core | 2026-Q2 | Replay may reconstruct stale queue/pending command state under partial-failure sequences | Resume logic includes crash-injection and pending-command reconciliation tests for receipt and retry windows | done | docs/logs/2026-03-12.md#pf-poc-002-replay-hardening-next-slice |
| ACT-005 | PF-POC-002 | medium | qa | 2026-Q2 | Type/lint guard coverage may miss new POC runtime files and allow silent drift | `check:type` and `check:lint` include POC core/service/provider modules | done | docs/logs/2026-03-12.md#pf-poc-001-runtime-implementation |
| ACT-006 | PF-POC-003 | medium | core | 2026-Q2 | Prompt compiler may produce low-signal or malformed branching graphs for non-trivial prompts | Compiler heuristics and schema checks are expanded with branch-focused fixtures | planned | none |
| ACT-007 | PF-GOV-001 | medium | governance | 2026-Q2 | POC commands may bypass governance visibility if strategy docs are stale | Strategy trackers and risk registers reflect PF-POC canonical direction | done | docs/logs/2026-03-12.md#pf-poc-001-governance-reset |
| ACT-008 | PF-POC-002 | medium | core | 2026-Q2 | Multi-edge continuation fan-out can still lose downstream nodes if crash occurs mid-enqueue loop | Transition fan-out is persisted as an atomic continuation decision and replayed deterministically | in_progress | docs/logs/2026-03-12.md#pf-poc-002-fan-out-continuation-hardening |
