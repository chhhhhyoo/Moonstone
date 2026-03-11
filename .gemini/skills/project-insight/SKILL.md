---
name: project-insight
description: Use when you need to understand project context, recent changes, or evolution from Git history and planning files.
---

# Project Insight

Extract insights from the project's persistent history (Git & Markdown).

## Workflow

### 1. Analyze Git History
*   **Command:** `git log --pretty=format:"%h - %an, %ar : %s" --stat -n 10`
*   **Goal:** Understand *what* changed recently.

### 2. Analyze Planning Context
*   **Files:** Read `task_plan.md`, `findings.md`, `progress.md` (if they exist).
*   **Goal:** Understand *why* things changed.

### 3. Analyze Documentation & Decisions
*   **Learnings:** Read `docs/learnings.md` (last 10 entries).
*   **Decisions:** List files in `docs/decisions/` (`ls -t docs/decisions/ | head -n 5`) and read the most recent relevant one.
*   **Goal:** Understand *learned* knowledge and architectural constraints to avoid repeating mistakes.

### 4. Synthesize
*   **Persona:** "I am the Historian."
*   **Output:**
    *   **Recent Velocity:** High/Low?
    *   **Focus Area:** (e.g., "Refactoring Auth System")
    *   **Key Constraints:** (from Decisions)
    *   **Risks:** (e.g., "Frequent changes to `utils.ts` suggest instability")

## Synergies (Skill Integration)

`project-insight` provides the historical context for decision making:

- **+ `orchestrator`**: The Orchestrator uses `project-insight` at the start of a session to "load context" and understand the project's trajectory.
- **+ `reflexion`**: `project-insight` reads the logs that `reflexion` writes. They form a cycle of history (writing) and insight (reading).
- **+ `tech-decision`**: When making a new technical choice, `project-insight` checks `docs/decisions/` to ensure we don't repeat past mistakes or violate architectural constraints.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
