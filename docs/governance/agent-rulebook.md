# Agent Rulebook

## Canonical Principles

1. Spec-first, runtime-truth-first, verification-first
2. Repo-local docs are canonical; no external vault as source of truth
3. Transport logic is allowed in adapters only; orchestrator core stays transport-agnostic
4. Provider/proxy split is mandatory
5. One machine, one component family for each active Moonstone agent
6. Public contract changes require spec updates, tests, and spec-impact records in same change set
7. Historical docs never outrank active code and active specs
8. Drift between docs and code is unresolved work, not done work
9. Material actions and checks must be logged in `docs/logs/YYYY-MM-DD.md`
10. Durable engineering lessons must be promoted to `docs/learnings.md`
11. Planning scratch files are transient and must be reconciled before closeout
12. Branch and PR naming must follow `docs/governance/pr-branch-policy.md`
13. Material session closeout requires `wrap` protocol execution before termination
14. Lifecycle automation behavior must remain mapped through enforceable Codex-native policies (no silent hook drift)
15. PR recording rules and tactics must follow `docs/governance/RULE.md`

## Required Artifacts For Material Changes

1. check evidence (`npm run verify` and relevant strict gates)
2. spec-impact record under `notes/spec-impact/`
3. updated canonical docs when contract/behavior changes

## Tie-Break

Fail-closed governance wins over throughput.
