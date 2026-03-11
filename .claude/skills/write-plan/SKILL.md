---
name: write-plan
description: Use before implementing any multi-step feature or task with 3+ steps or multiple files. Creates structured implementation plan with mandatory syneidesis gap detection before finalization.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Agent, AskUserQuestion, TaskCreate, TaskUpdate, Write, Edit
---

# Writing Plans (Epistemic Edition)

Write comprehensive implementation plans that include granular tasks and rigorous verification steps. Uses `/syneidesis` for mandatory gap detection before finalization.

## When to Use

- After brainstorming, when you have a spec or requirements for a multi-step task
- Before touching code — plan first, implement second
- When a task has 3+ steps or affects multiple files

## The Process

### Step 1: Draft the Plan

Follow the standard task structure from `.claude/templates/task-plan.md`:

- **Header**: Goal, Architecture, Tech Stack
- **Decision Rationale**: Explicitly cite outcomes from `/tech-decide` (A vs B analysis) or `/dev-scan` (community consensus) to justify the chosen path
- **Tasks**: Bite-sized (2-5 minutes each), TDD-focused, include exact file paths and verification commands

Task format:
```markdown
### Task N: [Name]
- **Files**: `path/to/file.ts`
- **Test**: Write failing test for [behavior]
- **Implement**: [Specific implementation]
- **Verify**: `npm test path/to/test.ts`
- **Dependencies**: Task M (if any)
```

Principles: **DRY. YAGNI. One responsibility per task.**

### Step 2: Gap Detection (Syneidesis) — MANDATORY

Before finalizing the plan:

1. Scan the proposed tasks for Procedural, Consideration, Assumption, or Alternative gaps
2. Surface gaps via `AskUserQuestion`:
   - "Did we consider backward compatibility for this change?"
   - "Are we sure the API supports this pattern?"
   - "Have we considered using X instead?"
3. Incorporate user feedback from the gap check

### Step 3: Finalize & Save

- Incorporate feedback from the Syneidesis check
- Save the plan to `docs/plans/YYYY-MM-DD-<feature-name>.md`
- Create all tasks via `TaskCreate` with dependencies

## Execution Handoff

Use `AskUserQuestion` to offer the user two choices:

1. **Subagent-Driven** (`/subagent-dev`): Dispatch fresh `Agent` subagents per task with two-stage review
2. **Plan Execution** (`/execute-plan`): Batch execution with freshness checks

## Rules

- **Epistemic Check**: No plan is considered "Final" without a Syneidesis gap check
- **Interactive Pause**: Stop after presenting gaps or the final plan
- **TDD First**: Every task MUST include a failing test step
- **Verification Required**: Every task MUST include a verification command

## Synergies (Command Integration)

`/write-plan` relies on other commands for rigorous verification:

- **+ `/syneidesis`**: MANDATORY. Cannot finalize a plan without running a gap check.
- **+ `/tech-decide`**: Provides the "Decision Rationale" for the plan. If a plan involves a major choice, cite the tech-decide report.
- **+ `/subagent-dev`**: Preferred method for executing the tasks defined in the plan.
- **+ `/execute-plan`**: Alternative execution method for batched processing.
- **+ `/ultrawork`**: For highest-discipline execution with DAG plans and mechanical verification.

## Exit Protocol (Mandatory)

1. Plan saved to `docs/plans/YYYY-MM-DD-<feature-name>.md`
2. All tasks created via `TaskCreate`
3. Reconcile findings to `docs/logs/YYYY-MM-DD.md`
4. Crystallize insights to `docs/learnings.md`
5. Chain Next Step: Recommend `/subagent-dev` or `/execute-plan`

$ARGUMENTS
