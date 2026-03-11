---
name: finishing-a-development-branch
description: Close a completed implementation branch by running final quality gates, presenting structured integration options, and executing the chosen path safely.
---

# finishing-a-development-branch

Codex-native migration of Gemini `finishing-a-development-branch`.

## Purpose

Provide a deterministic "definition of done" closeout workflow: verify quality, present explicit integration options, execute the selected path safely, and preserve traceability.

## Protocol

### Phase 1: Pre-Closeout Verification (Mandatory)

1. Announce branch-closeout mode.
2. If code changed, run:

```bash
npm run lint:fix
```

3. Run `ship` protocol (or equivalent verification flow) to gather fresh governance evidence.
4. If verification fails, stop closeout and report blockers; do not present integration options yet.

### Phase 2: Base Branch Resolution

1. Detect likely base branch (`main` unless repo policy states otherwise).
2. Confirm base branch with user when uncertain.

### Phase 3: Present Exactly Four Options

Use this exact option set:

1. Merge back to `<base-branch>` locally.
2. Push and create a Pull Request.
3. Keep the branch as-is (handle later).
4. Discard this work.

Do not add extra options until one of the four is selected.

### Phase 4: Execute Chosen Option

#### Option 1: Merge Locally

1. Ensure base branch is up to date.
2. Merge feature branch into base branch.
3. If merge conflict occurs, abort merge and report conflict.
4. Re-run required tests/verification before deleting feature branch.
5. Remove worktree only after successful merge and verification.

#### Option 2: Push And Create PR

1. Confirm PR title/body against repo governance (`docs/governance/pr-branch-policy.md`).
2. Push branch and open PR only after user confirmation.
3. Ask whether to keep worktree for follow-up changes (recommended default: keep).
4. If user declines, clean up worktree after confirming no further edits are needed.

#### Option 3: Keep As-Is

1. Report branch name and worktree path.
2. Do not cleanup branch/worktree.

#### Option 4: Discard

1. Show exact deletion impact (branch + commits + worktree path).
2. Require typed confirmation: `discard`.
3. Only then delete branch/worktree.

### Phase 5: Cleanup Rules

1. Clean up worktree for Options 1 and 4.
2. Keep worktree for Option 3.
3. For Option 2, cleanup only if user explicitly requests it.

## Red Flags

1. Never proceed with failing tests or stale verification evidence.
2. Never delete work without explicit typed confirmation.
3. Never push/merge implicitly without user approval.

## Skill Synergy

1. With `ship`: provides scope-aware verification and policy alignment before branch decisions.
2. With `eval-suite-checklist`: confirms conformance quality before declaring done.
3. With `executing-plans`: default handoff target once planned implementation completes.
4. With non-migrated `git-craft-commit`: use standard git hygiene and commit-quality checks before final options.

## Exit Protocol

1. Update `progress.md` with selected closeout option and execution outcome.
2. Reconcile closeout decisions and risks into `docs/logs/YYYY-MM-DD.md`.
3. Promote durable branch-closeout lessons to `docs/learnings.md`.
