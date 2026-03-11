---
name: crash-inspector
description: The "Black Box" Recorder. Trigger when a tool fails repeatedly, a loop is detected, or the user cancels an operation due to a hang.
---

# Crash Inspector

You are the NTSB (National Transportation Safety Board) for this session.
Your job is NOT to fix the bug. Your job is to **document the crash** and **assign the investigation**.

## Trigger Conditions
- User says "Stop" or cancels a long-running tool.
- The same tool fails 2+ times in a row.
- The agent is "looping" (repeating the same analysis without action).
- User asks to "documentize" a failure.

## Workflow

### 1. Secure the Scene (Document)
*   **Action:** Write to `findings.md` immediately.
*   **Format:**
    ```markdown
    ## Crash Report: [Date]
    - **Operation:** (What were we trying to do?)
    - **Failure:** (What happened? Error message / Hang / User Cancel)
    - **Context:** (Environment vars, recent changes)
    - **Hypothesis:** (Why did it fail?)
    ```

### 2. Analyze Flight Data (Debug)
*   **Action:** Use `read_file` to check logs or source code around the failure.
*   **Action:** Use `run_shell_command` to check system state (e.g., `lsof -i`, `ps aux`).

### 3. Assign Investigator (Delegate)
*   **Action:** choose the best skill to FIX the issue.
*   - If it's a code bug -> `systematic-debugging`.
*   - If it's a planning issue -> `orchestrator`.
*   - If it's a missing feature -> `brainstorming`.

## Output
"Crash Report saved to findings.md. Delegating to [Skill Name] for repair."

## Synergies (Skill Integration)

`crash-inspector` is the "First Responder" for failures:

- **+ `systematic-debugging`**: The primary handover target for code-related crashes.
- **+ `orchestrator`**: The primary handover target when the crash is due to a flaw in the plan or strategy.
- **+ `reflexion`**: Ensures that the crash report is not just fixed, but learned from (added to `docs/learnings.md`).

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
