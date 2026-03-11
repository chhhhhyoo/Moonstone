---
name: writing-plans
description: Implementation specs. Trigger after brainstorming, Use when you have a spec or requirements for a multi-step task, before touching code. Uses Syneidesis for gap detection.
---

# Writing Plans (Epistemic Edition)

## Overview

Write comprehensive implementation plans that include granular tasks and rigorous verification steps.

## The Process

### Step 1: Draft the Plan
Follow the standard task structure:
- **Header**: Goal, Architecture, Tech Stack.
- **Decision Rationale**: Explicitly list outcomes from `tech-decision` (A vs B analysis) or `dev-scan` (community consensus) to justify the chosen path.
- **Tasks**: Bite-sized (2-5 minutes), TDD-focused, include exact file paths and commands. DRY. YAGNI.

### Step 2: Gap Detection (Syneidesis)
Before finalizing the plan and saving it to disk:
*   **Action:** Activate `syneidesis`.
*   **Method:** Scan the proposed tasks for Procedural, Consideration, Assumption, or Alternative gaps.
*   **Goal:** Surface cognitive blind spots (e.g., "Did we consider backward compatibility for this change?") via **Interactive Pause**.

### Step 3: Finalize & Save
*   Incorporate user feedback from the Syneidesis check.
*   Save the plan to `docs/plans/YYYY-MM-DD-<feature-name>.md`.

## Execution Handoff

Offer the user two choices:
1.  **Subagent-Driven**: Dispatch fresh sub-agents per task (uses `subagent-driven-development`).
2.  **Parallel Session**: Open a new session in the worktree using `executing-plans`.

## Rules
- **Epistemic Check**: No plan is considered "Final" without a Syneidesis gap check.
- **Interactive Pause**: Stop after presenting gaps or the final plan.
- **TDD First**: Every task MUST include a failing test step.

## Synergies (Skill Integration)

`writing-plans` relies on other skills for rigorous verification:

- **+ `syneidesis`**: MANDATORY. You cannot finalize a plan without running a `syneidesis` gap check.
- **+ `tech-decision`**: Provides the "Decision Rationale" for the plan. If a plan involves a major choice, cite the `tech-decision` report.
- **+ `subagent-driven-development`**: The preferred method for executing the tasks defined in the plan.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
