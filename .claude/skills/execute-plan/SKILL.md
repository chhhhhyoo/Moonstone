---
name: execute-plan
description: Use when an implementation plan already exists in docs/plans/ and is ready to be executed in batches. Requires plan files — run write-plan first if none exist.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Agent, Write, Edit, TaskCreate, TaskUpdate, TaskList
---

# Execute Plan

Load a written implementation plan, review it critically, execute tasks in batches with checkpoints for review. Use when you have a plan to execute in a structured, verified manner.

**Announce at start**: "Using the execute-plan workflow to implement this plan."

## The Process

### Step 1: Load and Review Plan (With Freshness Check)

1. Read the plan file (`task_plan.md` or specified plan in `docs/plans/`)
2. **Freshness Check (MANDATORY)**:
   - **Verify Files**: Do the files mentioned in the plan actually exist? Use `Glob`/`Bash` to check
   - **Check Drift**: Have target files changed since the plan was written? Run `git log -n 1 <file>` for key files
3. **Review critically**: Identify questions/concerns about the plan
4. **Go/No-Go**: If files are missing or drift is high, STOP and inform the user to update the plan
5. If green: Create tasks with `TaskCreate` and proceed

### Step 2: Execute Batch (Default: First 3 Tasks)

For each task:
1. Mark as `in_progress` via `TaskUpdate`
2. Follow each step exactly (plan has bite-sized steps)
3. **Run `npm run lint:fix` if code was modified**
4. Run verifications as specified in the plan
5. Mark as `completed` via `TaskUpdate`

### Step 3: Report

When batch is complete:
- Show what was implemented (files changed, tests added)
- Show verification output (test results, lint status)
- Say: "Batch complete. Ready for feedback."

### Step 4: Continue

Based on user feedback:
- Apply requested changes
- Execute next batch of 3 tasks
- Repeat until all tasks complete

### Step 5: Complete Development

After all tasks are complete and verified:
- Run full verification: `npm run verify`
- Present options via `AskUserQuestion`:
  - "Merge back to base branch locally"
  - "Push and create a Pull Request"
  - "Keep the branch as-is"
  - "Review changes before deciding"

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker mid-batch (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing progress
- You don't understand an instruction
- Verification fails repeatedly (3-Strike Rule: diagnose, alternative, rethink, then escalate)

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- User updates the plan based on your feedback
- Fundamental approach needs rethinking

**Don't force through blockers** - stop and ask.

## Rules

- Review plan critically first - don't blindly execute
- Follow plan steps exactly as written
- Don't skip verifications
- Between batches: just report and wait for feedback
- Stop when blocked, don't guess
- Run `npm run lint:fix` after any code modification

## Synergies (Command Integration)

`/execute-plan` is the "Runtime Engine":

- **+ `/write-plan`**: The plan created by `/write-plan` is the direct input
- **+ `/debug`**: If a batch fails, switch to systematic debugging
- **+ `/finish-branch`**: Automatically triggered at the end to wrap up
- **+ `/verify`**: Run between batches to catch regressions early

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract insights to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command`

$ARGUMENTS
