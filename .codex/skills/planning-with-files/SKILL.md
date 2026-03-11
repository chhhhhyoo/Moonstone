---
name: planning-with-files
version: "2.10.0"
description: Implements Manus-style file-based planning for complex tasks. Creates task_plan.md, findings.md, and progress.md. Use when starting complex multi-step tasks, research projects, or any task requiring >5 tool calls.
user-invocable: true
---
# planning-with-files

## Purpose
Provide a durable, crash-safe execution memory for complex tasks that survives session restarts and enables perfect handoff between agents. It serves as your "working memory on disk."

## Protocol

### Step 1: Check for Previous Session (Session Catchup)
**Before starting work**, check for unsynced context:
```bash
# Linux/macOS
python3 .gemini/skills/planning-with-files/scripts/session-catchup.py "$(pwd)"
```
1. Run `git diff --stat`.
2. Read current planning files.
3. Update plans based on catchup + git diff.

### Step 2: Initialize Planning Files
If none exist, create them in the project root (not the skill folder):
1.  **`task_plan.md`**: Phases, status (`todo`, `in_progress`, `completed`), and decisions.
2.  **`findings.md`**: **Transient** research, turn discoveries, and "Aha!" moments.
3.  **`progress.md`**: Session log, command results, and test outputs.

### Step 3: The 2-Action Rule (Cumulative Memory)
> "After every 2 view/browser/search operations, IMMEDIATELY save key findings to text files."
This prevents multimodal/visual info loss.

### Step 4: Execution Rules
- **Read Before Decide**: Refreshes goals in the attention window.
- **Update After Act**: Mark status, log errors, and note modified files after each phase.
- **Log ALL Errors**: Build knowledge and prevent repetition.
- **Never Repeat Failures**: If an action fails, mutate the approach.

### Step 5: The 3-Strike Error Protocol
1.  **Diagnose & Fix**: Identify root cause and apply targeted fix.
2.  **Alternative**: Try different method/tool/library.
3.  **Rethink**: Question assumptions and update the plan.
4.  **Escalate**: If 3 failures occur, shared the error and ask the user for guidance.

## Rules
- **Create Plan FIRST**: Non-negotiable for complex tasks.
- **No TodoWrite for persistence**: Use the actual markdown files.
- **Small Context**: Store large content in files rather than context.

## Exit Protocol
1.  **Update Documentation**: Mark tasks complete in `task_plan.md`, summarize in `progress.md`, and record research in `findings.md`.
2.  **Reconcile Memory**: Move findings to `docs/logs/YYYY-MM-DD.md`.
3.  **Crystallize Gems**: Extract ADRs, patterns, and root causes to `docs/learnings.md`.
4.  **Handoff**: Chain to the next expert via `activate_skill`.
