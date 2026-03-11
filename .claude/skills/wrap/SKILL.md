---
name: wrap
description: Use to close a work session properly. 6-phase session closure including reflection, commits, documentation updates, and knowledge crystallization.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Agent, Write, Edit, TaskCreate, TaskUpdate, TaskList, AskUserQuestion
---

# Session Wrap (Epistemic Edition)

Comprehensive session wrap-up. Simulates a 4-agent team to rigorously close a session with zero context loss. Integrated with the Reflexion protocol.

**Mandate**: No session ends with stale documentation or lost insights.

## Phase 1: Context Gathering (The "Git Status" Agent)

"Gathering context..."

1. Run: `git status`
2. Run: `git diff --stat` (summary of changes)
3. Run: `git diff HEAD~1 HEAD` (if recent commit) or `git diff` (if uncommitted)
4. Read: `CLAUDE.md`, `task_plan.md` (if exists)

## Phase 1.5: The Janitor (Code Quality)

"Running code quality checks..."

1. Run: `npm run lint:fix`
2. Report: "Linting complete."

## Phase 2: The Doc Updater (MANDATORY)

"Updating documentation to match reality..."

- **Reconcile findings.md**: Move turn findings to `docs/logs/YYYY-MM-DD.md` or `docs/logs/YYYY-MM-DD-topic.md`
- **Crystallize learnings**: Persist high-value insights ("gems") to `docs/learnings.md`
- **Analyze diff and update docs**:
  - New environment variable? -> Update `.env.example` or CLAUDE.md
  - Changed workflow? -> Update CLAUDE.md or relevant playbooks
  - New tool/command? -> Update CLAUDE.md commands list
  - New documents? -> Ensure they are linked properly
- **Action**: Perform updates NOW, don't just suggest them

## Phase 3: The Automation Scout

"Checking for automation opportunities..."

Analyze the session for toil:
- Same long command run 3+ times? -> Propose a new slash command
- Manual edits in a repeated pattern? -> Propose a script
- Recurring verification steps? -> Propose a hook

Output either:
- "No toil detected" OR
- "Automation Opportunity: [specific proposal]"

## Phase 4: The Learning Extractor (Reflexion)

"Extracting and crystallizing insights..."

Invoke the Reflexion protocol:
1. Launch 3 parallel `Agent` subagents for extraction (insights, summary, knowledge)
2. Present extracted insights via `AskUserQuestion` for user selection
3. Persist selected insights to `docs/learnings.md` and/or `docs/decisions/`
4. Update Claude memory files for cross-session persistence

## Phase 5: The Follow-up Planner

"Planning next session..."

1. Check `task_plan.md` vs `git status`:
   - Uncommitted changes?
   - Current phase complete?
2. Update `task_plan.md` (mark items `[x]`)
3. Generate **Next Session Goal** - a clear, actionable statement of what to do next
4. If new commands were identified by the Automation Scout, invoke `/capture`

## Phase 6: Final Handoff (The Lead)

"Verifying wrap-up completeness..."

Summary checklist:
- Linting: [Pass/Fail]
- Docs: [Updated/No changes needed]
- Reflexion: [N insights crystallized]
- Plan: [Updated/Created]

**Final Message**: Concise handoff for the next session:
```
Next session goal: [specific, actionable goal]
Key context: [1-2 critical things to remember]
Open items: [any unresolved issues]
```

## Rules

- **Mandatory**: This protocol MUST be run before ending any significant session
- **No shortcuts**: Every phase must execute, even if "nothing to do"
- **Action > Suggestion**: Perform documentation updates, don't just propose them
- **Memory Persistence**: Ensure insights survive across sessions via docs/ and memory files

## Synergies (Command Integration)

`/wrap` is the session closure protocol:

- **+ `/reflect`**: Core of Phase 4 (Learning Extractor)
- **+ `/capture`**: If automation opportunities found, capture them
- **+ `/session-check`**: Verify artifacts before wrapping
- **+ `/commit`**: Ensure all changes are committed before wrap
- **+ `/bridge`**: Reconcile and crystallize via knowledge bridge

## Exit Protocol

1. All findings.md content reconciled to `docs/logs/`
2. All insights crystallized to `docs/learnings.md`
3. All tasks updated in `task_plan.md`
4. Next session goal documented
5. Memory files updated

$ARGUMENTS
