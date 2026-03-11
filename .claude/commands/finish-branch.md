# Finish Development Branch

Guide completion of development work by presenting structured options for merge, PR, or cleanup. Use when implementation is complete and tests pass.

**Announce at start**: "Using the finish-branch workflow to complete this work."

## The Process

### Step 1: Verify Tests & Lint

Before presenting options, verify code quality:

```bash
npm run lint:fix
npm test
```

**If tests fail**: Report failures and STOP. Do not proceed to Step 2.

```
Tests failing (N failures). Must fix before completing:
[Show failures]
Cannot proceed with merge/PR until tests pass.
```

**If tests pass**: Continue to Step 2.

### Step 2: Determine Base Branch

```bash
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

Or use `AskUserQuestion`: "This branch split from main - is that correct?"

### Step 3: Present Options

Use `AskUserQuestion` with exactly 4 options:

1. **Merge back to [base-branch] locally** - Merge and delete the feature branch
2. **Push and create a Pull Request** - Push to remote and open a PR via `gh`
3. **Keep the branch as-is** - Leave it for manual handling later
4. **Discard this work** - Permanently delete the branch and changes

### Step 4: Execute Choice

#### Option 1: Merge Locally

1. Switch to base branch & pull latest
2. `git merge <feature-branch>`
3. **Conflict handling**: If merge fails, `git merge --abort` and report. Suggest PR instead.
4. If tests pass after merge: `git branch -d <feature-branch>`
5. Clean up worktree if applicable

#### Option 2: Push and Create PR

1. Extract ticket number from branch name for PR title: `[TICKET-NUM] <Title>`
2. Confirm title with user via `AskUserQuestion`
3. Execute:
   ```bash
   git push -u origin <feature-branch>
   gh pr create --title "<title>" --body "<body>"
   ```
4. Ask: "PR created. Keep worktree for addressing feedback? (Recommended)"

#### Option 3: Keep As-Is

Report: "Keeping branch [name]. Worktree preserved at [path]."

#### Option 4: Discard

**MUST confirm first** via `AskUserQuestion`:
- Show what will be permanently deleted (branch, commits, worktree)
- Require explicit "Discard" confirmation

If confirmed:
```bash
git checkout <base-branch>
git branch -D <feature-branch>
```

### Step 5: Cleanup Worktree

For Options 1, 2 (if user declines keep), and 4:
```bash
git worktree list | grep $(git branch --show-current)
git worktree remove <worktree-path>
```

For Option 3: Keep worktree.

## Quick Reference

| Option | Merge | Push | Keep Worktree | Cleanup Branch |
|--------|-------|------|---------------|----------------|
| 1. Merge locally | Yes | - | - | Yes |
| 2. Create PR | - | Yes | Ask | - |
| 3. Keep as-is | - | - | Yes | - |
| 4. Discard | - | - | - | Yes (force) |

## Red Flags

**Never:**
- Proceed with failing tests
- Merge without verifying tests on the result
- Delete work without explicit confirmation
- Force-push without explicit request

**Always:**
- Verify tests before offering options
- Present exactly 4 options
- Get explicit confirmation for discard
- Clean up worktree appropriately

## Synergies (Command Integration)

`/finish-branch` is the "Definition of Done" enforcer:

- **+ `/commit`**: Ensures all changes are committed cleanly before the branch is finalized
- **+ `/eval-checklist`**: Full conformance suite must pass before "Done"
- **+ `/wrap`**: After finishing, run `/wrap` to crystallize session insights
- **+ `/execute-plan`**: Automatically triggered at end of plan execution

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract insights to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command`

$ARGUMENTS
