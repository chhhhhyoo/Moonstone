---
name: subagent-dev
description: Use to execute plan tasks with fresh Agent subagents — each task gets its own isolated agent plus two-stage quality review (spec compliance, then code quality).
user-invocable: true
context: fork
allowed-tools: Read, Glob, Grep, Bash, Agent, Write, Edit, TaskCreate, TaskUpdate, TaskList
---

# Subagent-Driven Development

Execute a plan by dispatching a fresh Agent subagent per task, with two-stage review after each: spec compliance first, then code quality.

**Core principle**: Fresh subagent per task + two-stage review = high quality, fast iteration.

## When to Use

- Have an implementation plan with mostly independent tasks
- Want to execute in the current session (vs `/execute-plan` for batched review)
- Tasks can be worked on without shared state between them

## The Process

### 1. Controller Setup

1. Read the plan file once
2. Extract ALL tasks with full text and context
3. Create tasks via `TaskCreate` for all items

### 2. For Each Task - Implementation

Launch an `Agent` (general-purpose) subagent using the prompt template at `.claude/prompts/subagent-dev/implementer.md`:

```
You are the Implementer for Task N: [Task Name]

Context: [Full task text from plan + relevant file paths + architectural context]

Requirements:
1. Follow TDD - write tests first, then implementation
2. Self-verify: run tests before reporting done
3. Run npm run lint:fix after code changes
4. If you have questions, report them back - don't guess
5. Commit your changes with a descriptive message

Report: What you implemented, test results, any concerns.
```

**If the subagent asks questions**: Answer clearly and completely before letting them proceed.

### 3. For Each Task - Spec Review

After implementation, review against the spec using `.claude/prompts/subagent-dev/spec-reviewer.md`:

1. Read `SPEC.md` or the plan requirements for this task
2. Read the new/changed code
3. Check:
   - All requirements met? (nothing missing)
   - Nothing extra added? (no scope creep)
   - Matches the spec exactly?
4. Verdict: Pass or list issues

**If issues found**: Have the same subagent fix them, then re-review.

### 4. For Each Task - Code Quality Review

After spec compliance passes, review using `.claude/prompts/subagent-dev/code-quality-reviewer.md`:

```bash
git diff HEAD~1 HEAD --stat
npm run lint:fix
npm test
```

Check for:
- Code smells, magic numbers
- Missing error handling
- Unclear variable names
- Test coverage gaps

**If issues found**: Fix, then re-review until approved.

### 5. Completion

After all tasks:
1. Run full verification: `npm run verify`
2. Invoke `/finish-branch` to complete the work
3. Invoke `/wrap` to crystallize session insights

## Rules

**Never:**
- Skip either review (spec compliance OR code quality)
- Start code quality review before spec compliance passes
- Dispatch multiple implementation subagents in parallel (risk of conflicts)
- Move to next task while either review has open issues

**Always:**
- Provide full task context to subagents (don't make them read files)
- Answer subagent questions before implementation proceeds
- Re-review after every fix (reviewer found issues = fix = review again)

## Synergies (Command Integration)

- **+ `/write-plan`**: Creates the plan this skill executes
- **+ `/tdd`**: Subagents should follow TDD for each task
- **+ `/self-review`**: Quality review template
- **+ `/finish-branch`**: Complete development after all tasks

$ARGUMENTS
