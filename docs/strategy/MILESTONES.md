# Milestones

Canonical milestone tracker for Moonstone.

| milestone_id | title | status | owner | target_window | depends_on | exit_criteria |
|---|---|---|---|---|---|---|
| PF-BOOT-001 | Bootstrap baseline + governance + first PR setup | done | core | 2026-Q1 | none | First bootstrap PR merged with `verify:strict` green |
| PF-RUNTIME-002 | TypeScript + ESLint + strict compile gates | done | core | 2026-Q1 | PF-BOOT-001 | TS compile and ESLint become required strict gates |
| PF-RUNTIME-003 | Durable Execution Core + Second Agent Parity | in_progress | core | 2026-Q1 | PF-RUNTIME-002 | Pure Moonstone transitions; Outbox/Inbox relay; Multi-agent crash/resume tests green |
| PF-GOV-001 | PR governance automation hardening in CI | done | governance | 2026-Q1 | PF-BOOT-001 | PR naming/scope/template checks are mandatory in CI |
| PF-CONF-001 | MSW-backed provider conformance and strict stage-2 gates | planned | qa | 2026-Q2 | PF-RUNTIME-003 | Stage-2 conformance gates are enforced and stable |
