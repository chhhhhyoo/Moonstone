---
name: session-check
description: Validate session artifacts against the plan (replaces Claude's session-analyzer).
---

# Session Check

Verify that the work done in this session matches the plan.

## Workflow

### 1. Load Plan
*   Read `task_plan.md`.
*   Identify items marked as `[x]` (Completed).

### 2. Verify Artifacts
*   For each completed item, **Verify Evidence**:
    *   If "Create Component X", does `src/ComponentX.ts` exist?
    *   If "Fix Bug Y", is there a test case for Y?

### 3. Report Deviations
*   **Output:**
    *   "✅ **Verified**: Task 1 (File exists)"
    *   "❌ **Missing**: Task 2 marked complete, but no test found."

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
