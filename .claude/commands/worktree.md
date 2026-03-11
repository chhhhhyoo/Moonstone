# Git Worktree Setup

Use when starting feature work that needs isolation from current workspace. Creates isolated git worktrees with smart directory selection and safety verification.

**Core principle:** Systematic directory selection + safety verification = reliable isolation.

## When to Use

- Before executing implementation plans that need isolation
- When working on features that shouldn't interfere with current workspace
- When you need to work on multiple branches simultaneously

## Directory Selection Process

Follow this priority order:

### 1. Check Existing Directories
```bash
ls -d .worktrees 2>/dev/null     # Preferred (hidden)
ls -d worktrees 2>/dev/null      # Alternative
```
If both exist, `.worktrees` wins.

### 2. Check CLAUDE.md
```bash
grep -i "worktree.*director" CLAUDE.md 2>/dev/null
```
If preference specified, use it.

### 3. Ask User
If no directory exists and no CLAUDE.md preference, use `AskUserQuestion`:
```
No worktree directory found. Where should I create worktrees?
1. .worktrees/ (project-local, hidden)
2. Custom path
```

## Safety Verification

### For Project-Local Directories

**MUST verify directory is gitignored before creating worktree:**

```bash
git check-ignore -q .worktrees 2>/dev/null
```

**If NOT ignored:** Add to `.gitignore` and commit before proceeding.

**Why critical:** Prevents accidentally committing worktree contents to repository.

## Creation Steps

1. **Detect Project Name**: `basename "$(git rev-parse --show-toplevel)"`
2. **Create Worktree**: `git worktree add "$path" -b "$BRANCH_NAME"`
3. **Run Project Setup**: Auto-detect from project files (package.json → `npm install`, etc.)
4. **Verify Clean Baseline**: Run tests. If they fail, report and ask whether to proceed.
5. **Report Location**: Full path, test status, ready state

## Quick Reference

| Situation | Action |
|-----------|--------|
| `.worktrees/` exists | Use it (verify ignored) |
| `worktrees/` exists | Use it (verify ignored) |
| Both exist | Use `.worktrees/` |
| Neither exists | Check CLAUDE.md → Ask user |
| Directory not ignored | Add to .gitignore + commit |
| Tests fail during baseline | Report failures + ask |

## Red Flags

**Never:**
- Create worktree without verifying it's ignored (project-local)
- Skip baseline test verification
- Proceed with failing tests without asking
- Assume directory location when ambiguous

**Always:**
- Follow directory priority: existing > CLAUDE.md > ask
- Verify directory is ignored for project-local
- Auto-detect and run project setup
- Verify clean test baseline

## Synergies (Command Integration)

- **+ `/brainstorm`**: Create worktree after design is approved for implementation
- **+ `/finish-branch`**: REQUIRED for cleanup after work complete
- **+ `/execute-plan`** or **`/subagent-dev`**: Work happens in this worktree

## Exit Protocol (Mandatory)

1. Worktree created and verified
2. Reconcile findings to `docs/logs/YYYY-MM-DD.md`
3. Update `task_plan.md`
4. Chain Next Step: Recommend `/write-plan` or `/execute-plan`

$ARGUMENTS
