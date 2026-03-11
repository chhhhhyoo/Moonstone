---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints. Trigger after an implementation plan is approved.
---
# executing-plans

## Purpose
Ensure that implementation plans are followed strictly and sequentially, with each step verified against its acceptance criteria before moving to the next. It enforces batch execution with checkpoints for architect review to minimize architectural drift.

## Protocol

### Step 1: Load and Review Plan (With Freshness Check)
1.  Read the plan file (usually in `docs/plans/` or `task_plan.md`).
2.  **Verify Files**: Confirm files mentioned in the first phase actually exist (`ls`).
3.  **Check Drift**: Check if target files have changed since the plan was written (`git log -n 1 <file>`).
4.  **Go/No-Go**: If files are missing or drift is high, stop and ask the user to update the plan. If green, mark the first batch as `in_progress`.

### Step 2: Execute Batch (Default: 3 tasks)
For each task in the batch:
1.  Mark status as `in_progress`.
2.  Follow each step exactly (bite-sized steps).
3.  **Run `npm run lint:fix`** if code was modified.
4.  Run verifications as specified in the task.
5.  Mark as `completed` only after verification passes.

### Step 3: Report & Feedback
When the batch is complete:
1.  Show what was implemented and the verification output.
2.  Explicitly state: "Ready for feedback."
3.  Apply changes based on user feedback, then execute the next batch.

### Step 4: Complete Development
After all tasks are verified:
1.  Announce: "I'm using the `ship` skill to complete this work." (Fallback for `finishing-a-development-branch`).
2.  Verify tests, present options, and execute choice.

## Rules
- **STOP immediately** if a blocker is hit (missing dependency, test failure, unclear instruction).
- **Ask for clarification** rather than guessing.
- **Don't force through blockers** - stop and ask.

## Synergies (Skill Integration)
- **+ `writing-plans`**: The plan created by `writing-plans` is the direct input.
- **+ `systematic-debugging`**: Deploy if a batch execution fails.
- **+ `ship`**: Automatically triggered at the end of the execution to wrap up.

## Exit Protocol
1.  **Memory**: Move findings to `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallization**: Append insights to `docs/learnings.md`.
3.  **Documentation**: Mark tasks complete in `task_plan.md` and `progress.md`.
4.  **Handoff**: Chain next step via `activate_skill`.
