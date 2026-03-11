---
name: commit
description: Use when ready to commit code. High-integrity commit with verification gates, intelligent change clustering, and conventional commit format.
user-invocable: true
allowed-tools: Read, Bash, Glob, Grep
---

# High-Integrity Commit

Smart commit workflow: verifies quality gates, groups files into logical clusters, generates Conventional Commit messages, and requires user approval. Merges the best of git-craft-commit and high-integrity-commit workflows.

## The Iron Gate (Prerequisites)

Before ANY grouping or committing, these MUST pass:

```bash
npm run lint:fix
npm test
```

**If either fails, STOP.** Report the failure. Do not proceed to grouping or committing.

## Workflow

### 1. Verification Phase

Run quality gates and capture output:
```bash
npm run lint:fix
npm test
```
Confirm both pass before proceeding. **Fresh evidence only** - do not rely on "tests passed earlier."

### 2. Analysis Phase

Analyze the working directory:
```bash
git status
git diff --stat
git diff --cached --stat
```

### 3. Clustering Phase

Categorize changed files into **Logical Clusters**:

| Cluster | Files |
|---------|-------|
| **Core/Arch** | Refactors to base classes, registry updates, infrastructure |
| **Feature/Logic** | New services, Moonstone logic, business rules |
| **Tests** | New or updated test files |
| **Docs/Logs** | `docs/`, `specs/`, learnings, decisions |
| **Config/Build** | `package.json`, `tsconfig.json`, CI/CD files |

**Rules:**
- **No Blind Add**: Never `git add .` unless workspace is clean and user explicitly approves
- **Atomic Commits**: Don't split a single logical fix across two commits
- **Group Tests with Code**: Always include reproduction scripts/tests in the same commit as the fix
- **Include Specs**: Include specification changes alongside implementing code
- **Exclude Artifacts**: Skip `task_plan.md`, `findings.md`, `progress.md` unless explicitly asked

### 4. Interactive Proposal Phase

Present clusters to the user via `AskUserQuestion`:

```
High-Integrity Commit Proposal

Cluster 1: [Name] (N files)
- File A
- File B
Recommended: `type(scope): description`

Cluster 2: [Name] (N files)
- File C
Recommended: `type(scope): description`

Proceed with all / select specific / modify?
```

### 5. Execution Phase

For each approved cluster:
1. `git add <files>`
2. `git commit -m "<message>"`
3. Confirm with `git status`

**Never push without explicit instruction.**

## Conventional Commit Standards

| Type | Usage |
|------|-------|
| `feat` | New features |
| `fix` | Bug fixes |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs` | Documentation only changes |
| `test` | Adding or correcting tests |
| `chore` | Build process or auxiliary tool changes |

**Format**: `type(scope): description`

**Body** (if needed): Bullet points explaining _what_ and _why_.

**Scope**: The module or component affected (e.g., `auth`, `infra`, `moonstone`).

## Message Generation Guide

1. What was the _primary_ goal? (Subject line)
2. What distinct problems were solved? (Body bullets)
3. Are there breaking changes? (Footer: `BREAKING CHANGE:`)

## Synergies (Command Integration)

`/commit` ensures clean, descriptive version history:

- **+ `/finish-branch`**: Final step before finishing a branch
- **+ `/debug`**: After a fix is verified, craft an isolated commit
- **+ `/execute-plan`**: Checkpoint progress after each successful batch
- **+ `/verify`**: Run before committing to ensure gates pass

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract insights to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command`

$ARGUMENTS
