---
name: high-integrity-commit
description: Commit workflow with mandatory fresh verification gates, logical file clustering, Conventional Commit proposals, and explicit user approval before commit execution.
---

# high-integrity-commit

Codex-native migration of Gemini `high-integrity-commit`.

## Purpose

Prevent unverified or poorly grouped commits by enforcing fresh quality gates and explicit cluster-by-cluster commit approval.

## Protocol

### Phase 1: Iron Gate Verification (Mandatory)

Run fresh checks before any staging/commit proposal:

```bash
npm run lint:fix
npm run verify
```

If either fails, stop. Do not stage or commit.

### Phase 2: Logical Clustering

1. Inspect:
   - `git status --porcelain`
   - `git diff --stat`
2. Group changed files into logical clusters.
3. Keep clusters atomic by behavior, not by directory shape alone.
4. Exclude temporary/session artifacts unless user explicitly wants them committed.

### Phase 3: Interactive Proposal

Present clusters with recommended Conventional Commit messages and request explicit approval (`all`, `some`, or `none`).

Proposal format:

```markdown
## High-Integrity Commit Proposal

Cluster 1: [name]
- [file]
- [file]
Recommended message: type(scope): summary
```

### Phase 4: Approved Execution

For each approved cluster:
1. `git add <cluster files>`
2. `git commit -m "<message>"`
3. Verify clean staging transition with `git status --porcelain`.

Never push unless explicitly instructed.

## Rules

1. No blind `git add .`.
2. No stale verification evidence; run gates in current session.
3. No splitting one logical fix across multiple unrelated commits.
4. No commit execution without explicit user approval of the cluster/message.

## Skill Synergy

1. With `git-craft-commit`: use for stricter gate-enforced version of commit preparation.
2. With `finishing-a-development-branch`: run before branch closeout options.
3. With `eval-suite-checklist`: ensure conformance-sensitive changes were validated before commit.

## Exit Protocol

1. Record approved clusters and commit outcomes in `progress.md`.
2. Reconcile commit decisions and gate evidence into `docs/logs/YYYY-MM-DD.md`.
3. Promote durable commit-quality patterns into `docs/learnings.md`.
