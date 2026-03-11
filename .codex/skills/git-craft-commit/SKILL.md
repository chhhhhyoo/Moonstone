---
name: git-craft-commit
description: Stage a logical unit of work and craft a high-signal Conventional Commit message without implicit push actions.
---

# git-craft-commit

Codex-native migration of Gemini `git-craft-commit`.

## Purpose

Produce clean, atomic commit preparation: select the right files, stage intentionally, and generate a commit message that explains both what changed and why.

## Protocol

### Phase 1: Status And Hygiene

1. Inspect workspace:
   - `git status --porcelain`
   - `git diff --stat`
   - `git diff --cached --stat`
2. If code files changed, run:

```bash
npm run lint:fix
```

3. Re-check status after lint fixes.

### Phase 2: Logical Unit Selection

1. Select files tied to a single coherent change.
2. Do not use `git add .` unless user explicitly requests it.
3. Exclude transient/session artifacts by default:
   - `task_plan.md`
   - `findings.md`
   - `progress.md`
   - temporary logs/scratch files
4. Include tests and spec/docs that are coupled to the same behavior change.
5. If changes represent multiple concerns, propose split commits.

### Phase 3: Craft Commit Message

Use Conventional Commits:

1. Subject: `type(scope): summary`
2. Body bullets: key changes + rationale.
3. Mention risk/compatibility impact when relevant.

Preferred types:
1. `fix`
2. `feat`
3. `refactor`
4. `docs`
5. `test`
6. `chore`

### Phase 4: Stage And Propose Commit

1. Stage only selected files (`git add <files...>`).
2. By default, do not commit automatically; propose exact commit command.
3. Commit only when user explicitly asks to execute commit.
4. Never push without explicit user instruction.

## Rules

1. Atomicity over convenience.
2. No hidden staging of unrelated files.
3. Commit message must describe intent, not just file names.
4. If uncertain about grouping, ask before staging.

## Skill Synergy

1. With `finishing-a-development-branch`: preferred pre-step before merge/PR option execution.
2. With `systematic-debugging`: capture verified fixes as isolated commits.
3. With `orchestrator`: checkpoint completion of a phase with a traceable commit unit.

## Exit Protocol

1. Record staged-file rationale and commit proposal in `progress.md`.
2. Reconcile notable commit hygiene decisions into `docs/logs/YYYY-MM-DD.md`.
3. Promote durable commit-structuring patterns to `docs/learnings.md`.
