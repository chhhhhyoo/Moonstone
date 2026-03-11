---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints
---

# Executing Plans

## Overview

Load plan, review critically, execute tasks in batches, report for review between batches.

**Core principle:** Batch execution with checkpoints for architect review.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

## The Process

### Step 1: Load and Review Plan (With Freshness Check)
1.  Read the plan file.
2.  **Freshness Check (Mandatory):**
    *   **Verify Files:** Do the files mentioned in Step 1 actually exist? (Run `ls`).
    *   **Check Drift:** Have the target files changed since the plan was written? (Run `git log -n 1 <file>`).
3.  **Review critically:** Identify questions/concerns.
4.  **Go/No-Go:** If files are missing or drift is high, stop and ask the user to update the plan.
5.  If green: Create TodoWrite and proceed.

### Step 2: Execute Batch
**Default: First 3 tasks**

For each task:
1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. **Run `npm run lint:fix` if code was modified**
4. Run verifications as specified
5. Mark as completed

### Step 3: Report
When batch complete:
- Show what was implemented
- Show verification output
- Say: "Ready for feedback."

### Step 4: Continue
Based on feedback:
- Apply changes if needed
- Execute next batch
- Repeat until complete

### Step 5: Complete Development

After all tasks complete and verified:
- Announce: "I'm using the finishing-a-development-branch skill to complete this work."
- **REQUIRED SUB-SKILL:** Use superpowers:finishing-a-development-branch
- Follow that skill to verify tests, present options, execute choice

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker mid-batch (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking

**Don't force through blockers** - stop and ask.

## Remember
- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when plan says to
- Between batches: just report and wait
- Stop when blocked, don't guess

## Synergies (Skill Integration)

`executing-plans` is the "Runtime Engine" for `task_plan.md`:

- **+ `writing-plans`**: The plan created by `writing-plans` is the direct input for `executing-plans`.
- **+ `systematic-debugging`**: If a batch execution fails, pause and switch to `systematic-debugging` to resolve the blocker.
- **+ `finishing-a-development-branch`**: Automatically triggered at the end of the execution to wrap up the work.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
