# Crash Inspector

The "Black Box" Recorder. Trigger when a tool fails repeatedly, a loop is detected, or the user cancels an operation due to a hang.

You are the NTSB (National Transportation Safety Board) for this session. Your job is NOT to fix the bug. Your job is to **document the crash** and **assign the investigation**.

## Trigger Conditions

- User says "Stop" or cancels a long-running tool
- The same tool/command fails 2+ times in a row
- The agent is "looping" (repeating the same analysis without action)
- User asks to document or investigate a failure

## Workflow

### 1. Secure the Scene (Document)

Immediately write a crash report to `findings.md`:

```markdown
## Crash Report: [YYYY-MM-DD HH:MM]
- **Operation:** (What were we trying to do?)
- **Failure:** (What happened? Error message / Hang / User Cancel)
- **Context:** (Environment vars, recent changes, branch, last commands)
- **Hypothesis:** (Why did it fail? Initial theory)
- **Evidence:** (Error output, stack traces, relevant file paths)
```

### 2. Analyze Flight Data (Debug)

- Use `Read` to check logs, source code, and config files around the failure
- Use `Bash` to check system state:
  ```bash
  lsof -i          # Check open ports/connections
  ps aux | grep node  # Check running processes
  git status        # Check working tree state
  git log --oneline -5  # Recent commits
  ```
- Use `Grep` to search for error patterns across the codebase
- Use `Agent` (Explore) for deeper codebase investigation if the failure is complex

### 3. Assign Investigator (Delegate)

Based on the crash analysis, recommend the appropriate next step:

- **Code bug** -> Recommend systematic debugging approach (read error, trace root cause, fix)
- **Planning issue** -> Recommend revisiting the plan with `EnterPlanMode`
- **Missing feature** -> Recommend `/brainstorm` for design exploration
- **Test failure** -> Run the specific failing test with verbose output
- **Environment issue** -> Document the fix and add to CLAUDE.md rules

Use `AskUserQuestion` to confirm the delegation:
- "Proceed with debugging the root cause"
- "Revise the plan/approach first"
- "Investigate further before deciding"
- "Document and move on"

### 4. Create Tracking Task

Use `TaskCreate` to create a task for the investigation/fix so it doesn't get lost.

## Output Format

"Crash Report saved to findings.md. Investigation assigned: [approach]. Tracking task created."

## Synergies (Command Integration)

`/crash-inspect` is the "First Responder" for failures:

- **+ `/doubt`**: After fixing, use `/doubt` to re-validate the fix wasn't a band-aid
- **+ `/verify`**: Run verification suite after the fix to ensure no regressions
- **+ `/wrap`**: Ensure the crash report is captured in session wrap for future learning
- **+ `/capture`**: If the crash reveals a reusable diagnostic pattern, capture it

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move crash report from `findings.md` to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: If the crash reveals a pattern, append to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command` to invoke

$ARGUMENTS
