---
name: high-integrity-commit
description: A high-integrity workflow for committing changes. Enforces lint/test gates, groups files into logical clusters, recommends conventional commit messages, and requires user approval before committing.
---

# High-Integrity Commit (HIC)

Use this skill when you are ready to commit your work. It ensures that no broken or unverified code enters the repository and that commits are logically organized and clearly described.

## The Iron Gate (Prerequisites)

Before any grouping or commitment, you **MUST** ensure the following commands pass:
1.  **LINT**: `npm run lint:fix`
2.  **TEST**: `npm test` (or the relevant test suite for the task)

**If either fails, STOP.** Report the failure and do not proceed to grouping or committing.

## The HIC Workflow

### 1. Verification Phase
- Run `npm run lint:fix`.
- Run `npm test`.
- Capture output and confirm success.

### 2. Clustering Phase
- Run `git status` and `git diff --stat`.
- Categorize changed files into **Logical Clusters**.
- **Cluster Examples**:
    - `Arch/Core`: Refactors to base classes, registry updates.
    - `Feature/Logic`: Implementation of new services, Moonstone logic.
    - `Docs/Logs`: Updates to `docs/logs/`, `docs/learnings.md`, `GEMINI.md`.
    - `Tests`: New or updated test files.

### 3. Interactive Proposal Phase
Present the clusters to the user in a clear format:

```
### 🛠️ High-Integrity Commit Proposal

**Cluster 1: [Name]**
- File A
- File B
**Recommended Message**: `type(scope): description`

**Cluster 2: [Name]**
- File C
**Recommended Message**: `type(scope): description`

**Permission Required**: "Would you like me to proceed with these commits? Please specify if you want all, some, or none."
```

### 4. Execution Phase
- For each approved cluster:
    1.  `git add <files>`
    2.  `git commit -m "<message>"`
- Confirm success with `git status`.

## Conventional Commit Standards
- **feat**: New feature.
- **fix**: Bug fix.
- **refactor**: Code change that neither fixes a bug nor adds a feature.
- **docs**: Documentation only changes.
- **test**: Adding or correcting tests.
- **chore**: Build process or auxiliary tool changes.

## Rules
- **No Atomic Violations**: Do not split a single logical fix across two commits.
- **No Blind Add**: Never `git add .`.
- **Fresh Evidence**: Do not rely on "tests passed earlier in the session". Run them **NOW**.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
