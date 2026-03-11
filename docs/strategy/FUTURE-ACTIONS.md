# Future Actions

Canonical operational backlog for follow-up work tied to milestones.

| action_id | linked_milestone_id | priority | owner | due_window | blocking_risk | definition_of_done | status | evidence_ref |
|---|---|---|---|---|---|---|---|---|
| ACT-001 | PF-BOOT-001 | high | infra | 2026-Q1 | Branch protection cannot be enabled on the current private-repo plan tier | Branch protection limitation and fallback merge policy are documented | blocked | docs/logs/2026-03-09.md#act-001-blocked-evidence |
| ACT-002 | PF-RUNTIME-002 | high | core | 2026-Q1 | Dependency-light checks miss real type/lint defects | TypeScript and ESLint strict gates are active in `verify:strict` | done | docs/logs/2026-03-09.md#pf-runtime-002-closeout-evidence |
| ACT-003 | PF-GOV-001 | medium | governance | 2026-Q1 | PR triage noise and inconsistent labeling | `scope:*`, `risk:*`, `stream:*` label taxonomy is live | planned | none |
| ACT-004 | PF-GOV-001 | high | governance | 2026-Q1 | Required reviewer enforcement depends on branch protection features unavailable on current plan tier | Required reviewer rule for `runtime` scope is enforced | blocked | docs/logs/2026-03-09.md#act-004-blocked-evidence |
| ACT-005 | PF-GOV-001 | medium | infra | 2026-Q2 | Release notes remain manual and inconsistent | Milestone-ID-based release-note generator is active | planned | none |
| ACT-006 | PF-CONF-001 | medium | qa | 2026-Q2 | Milestone drift accumulates silently | Stale milestone detector script is active in CI | planned | none |
| ACT-007 | PF-RUNTIME-003 | high | core | 2026-Q1 | Single active agent leaves parity and session-resume pressure unproven | Second active Moonstone agent is live with parity and resume-flow tests green | in_progress | docs/strategy/2026-03-09-pf-runtime-003-build-plan.md |
| ACT-008 | PF-RUNTIME-003 | medium | core | 2026-Q2 | TS/ESLint static gates currently cover only a narrowed core module surface | TS/ESLint scope includes agent/provider/adapter modules with strict CI pass | planned | none |
