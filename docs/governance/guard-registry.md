# Guard Registry

## Purpose

Canonical inventory of active Moonstone guards and their ownership.

## Active Guards

| Guard | Path | Scope | Blocks |
|---|---|---|---|
| PR branch naming | `scripts/check-branch-name.mjs` | PR governance | Invalid branch naming and stream IDs |
| PR title naming | `scripts/check-pr-title.mjs` | PR governance | Invalid PR title identity and format |
| Scope classifier | `scripts/classify-verification-scope.mjs` | Verification routing | Fail-open scope classification |
| PR governance aggregate | `scripts/check-pr-governance.mjs` | PR governance | Naming/template/body/scope contract drift |
| Strategy tracker integrity | `scripts/check-strategy-trackers.mjs` | Governance/strategy | Invalid milestone-action schema, IDs, status, or link integrity |
| Epistemic unresolved-gap gate | `scripts/check-epistemic-gaps.mjs` | Planning governance | Execution closeout with unresolved `[Gap:]` items in `task_plan.md` |
| Skill prerequisite gate | `scripts/check-skill-prereqs.mjs` | Skill preflight | Execution without required plan/handbook prerequisites |
| Verification freshness gate | `scripts/check-verification-fresh.mjs` | Completion integrity | Completion/ship claims without recent passing verification |
| Workspace safety policy gate | `scripts/check-workspace-safety-policy.mjs` | Safety governance | Missing/altered destructive-command safety policy |
| Session automation policy gate | `scripts/check-session-automation-policy.mjs` | Workflow governance | Drift between migrated lifecycle-hook policy and Codex-native controls |
| Text hygiene | `scripts/check-text-hygiene.mjs` | Repo hygiene | Tabs/trailing whitespace/missing EOF newline drift |
| TypeScript compile | `npm run check:type` | Runtime gates | Type drift in JS-check scope for runtime modules |
| ESLint strict | `npm run check:lint` | Runtime gates | Lint drift and unsafe runtime patterns |
| Contract export integrity | `npm run check:contracts` | Runtime contracts | Missing required public contract export set |
| Pre-push fast lanes | `scripts/check-prepush-fast.mjs` | Local validation | High-latency full verify on low-risk changes |
| Canonical verify | `npm run verify` | Stage 0 | Missing baseline governance/runtime guarantees |
| Canonical strict verify | `npm run verify:strict` | Stage 1/2 | Parity/index/conformance drift |

## Change Control

When adding or modifying a guard:

1. update this registry,
2. update policy docs if contract behavior changes,
3. add evidence to `docs/logs/YYYY-MM-DD.md`,
4. run `npm run verify:strict`.
