---
name: planning-with-files
version: "2.10.0"
description: Implements Manus-style file-based planning for complex tasks. Creates task_plan.md, findings.md, and progress.md. Use when starting complex multi-step tasks, research projects, or any task requiring >5 tool calls. Now with automatic session recovery after /clear.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - WebFetch
  - WebSearch
---

# Planning with Files

Work like Manus: Use persistent markdown files as your "working memory on disk."

## FIRST: Check for Previous Session (v2.2.0)

**Before starting work**, check for unsynced context from a previous session:

```bash
# Linux/macOS
python3 .gemini/skills/planning-with-files/scripts/session-catchup.py "$(pwd)"
```

If catchup report shows unsynced context:
1. Run `git diff --stat` to see actual code changes
2. Read current planning files
3. Update planning files based on catchup + git diff
4. Then proceed with task

## Important: Where Files Go

- **Templates** are in `.gemini/skills/planning-with-files/templates/`
- **Your planning files** go in **your project directory**

| Location | What Goes There |
|----------|-----------------|
| Skill directory (`.gemini/skills/planning-with-files/`) | Templates, scripts, reference docs |
| Your project directory | `task_plan.md`, `findings.md`, `progress.md` |

## Quick Start

Before ANY complex task:

1.  **Check for Existing Plans:**
    *   Run `ls *plan.md` or `find . -name "*plan.md"`.
    *   If found (e.g., `docs/migration_plan.md`), ask: "Use this?"
    *   If yes, `cp docs/migration_plan.md task_plan.md` (or symlink).
2.  **Create `task_plan.md`** (if none exists) — Use [templates/task_plan.md](templates/task_plan.md)
3.  **Create `findings.md`** — Use [templates/findings.md](templates/findings.md)
4.  **Create `progress.md`** — Use [templates/progress.md](templates/progress.md)
5.  **Re-read plan before decisions** — Refreshes goals in attention window
6.  **Update after each phase** — Mark complete, log errors

> **Note:** Planning files go in your project root, not the skill installation folder.

## The Core Pattern

```
Context Window = RAM (volatile, limited)
Filesystem = Disk (persistent, unlimited)

→ Anything important gets written to disk.
```

## File Purposes

| File | Purpose | When to Update |
|------|---------|----------------|
| `task_plan.md` | Phases, progress, decisions | After each phase |
| `findings.md` | **Transient** Research, turn discoveries | After ANY turn discovery |
| `progress.md` | Session log, test results | Throughout session |

## 🧠 Cumulative Memory Policy (Mandatory)
`findings.md` is for **fresh turn memory**. To prevent context loss across sessions:
1.  **Log Turn**: Record findings in `findings.md` immediately (2-Action Rule).
2.  **Reconcile**: Before switching tasks or finishing a session, move `findings.md` content to a permanent log at `docs/logs/YYYY-MM-DD.md`.
3.  **Crystallize**: Extract high-value "gems" (ADRs, pattern changes, bug root causes) and append to `docs/learnings.md`.

## Critical Rules

### 1. Create Plan First
Never start a complex task without `task_plan.md`. Non-negotiable.

### 2. The 2-Action Rule
> "After every 2 view/browser/search operations, IMMEDIATELY save key findings to text files."

This prevents visual/multimodal information from being lost.

### 3. Read Before Decide
Before major decisions, read the plan file. This keeps goals in your attention window.

### 4. Update After Act
After completing any phase:
- Mark phase status: `in_progress` → `complete`
- Log any errors encountered
- Note files created/modified

### 5. Log ALL Errors
Every error goes in the plan file. This builds knowledge and prevents repetition.

```markdown
## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| FileNotFoundError | 1 | Created default config |
| API timeout | 2 | Added retry logic |
```

### 6. Never Repeat Failures
```
if action_failed:
    next_action != same_action
```
Track what you tried. Mutate the approach.

## The 3-Strike Error Protocol

```
ATTEMPT 1: Diagnose & Fix
  → Read error carefully
  → Identify root cause
  → Apply targeted fix

ATTEMPT 2: Alternative Approach
  → Same error? Try different method
  → Different tool? Different library?
  → NEVER repeat exact same failing action

ATTEMPT 3: Broader Rethink
  → Question assumptions
  → Search for solutions
  → Consider updating the plan

AFTER 3 FAILURES: Escalate to User
  → Explain what you tried
  → Share the specific error
  → Ask for guidance
```

## Read vs Write Decision Matrix

| Situation | Action | Reason |
|-----------|--------|--------|
| Just wrote a file | DON'T read | Content still in context |
| Viewed image/PDF | Write findings NOW | Multimodal → text before lost |
| Browser returned data | Write to file | Screenshots don't persist |
| Starting new phase | Read plan/findings | Re-orient if context stale |
| Error occurred | Read relevant file | Need current state to fix |
| Resuming after gap | Read all planning files | Recover state |

## The 5-Question Reboot Test

If you can answer these, your context management is solid:

| Question | Answer Source |
|----------|---------------|
| Where am I? | Current phase in task_plan.md |
| Where am I going? | Remaining phases |
| What's the goal? | Goal statement in plan |
| What have I learned? | findings.md |
| What have I done? | progress.md |

## When to Use This Pattern

**Use for:**
- Multi-step tasks (3+ steps)
- Research tasks
- Building/creating projects
- Tasks spanning many tool calls
- Anything requiring organization

**Skip for:**
- Simple questions
- Single-file edits
- Quick lookups

## Templates

Copy these templates to start:

- [templates/task_plan.md](templates/task_plan.md) — Phase tracking
- [templates/findings.md](templates/findings.md) — Research storage
- [templates/progress.md](templates/progress.md) — Session logging

## Scripts

Helper scripts for automation:

- `scripts/init-session.sh` — Initialize all planning files
- `scripts/check-complete.sh` — Verify all phases complete
- `scripts/session-catchup.py` — Recover context from previous session (v2.2.0)

## Advanced Topics

- **Manus Principles:** See [assets/reference.md](assets/reference.md)
- **Real Examples:** See [assets/examples.md](assets/examples.md)

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Use TodoWrite for persistence | Create task_plan.md file |
| State goals once and forget | Re-read plan before decisions |
| Hide errors and retry silently | Log errors to plan file |
| Stuff everything in context | Store large content in files |
| Start executing immediately | Create plan file FIRST |
| Repeat failed actions | Track attempts, mutate approach |
| Create files in skill directory | Create files in your project |

## Exit Protocol (Mandatory)

1.  **Update Documentation**:
    *   **Task Plan**: Mark completed tasks (`task_plan.md`).
    *   **Progress Log**: Summarize achievements (`progress.md`).
    *   **Findings**: Record decisions/research (`findings.md`).

2.  **Chain Next Step**:
    *   If the task is not complete, hand off to the next appropriate expert.
    *   **PRIORITY 1: Activate a Skill** (Preferred). Use `activate_skill` to load a specialized workflow (e.g., `orchestrator`, `writing-plans`).
    *   **PRIORITY 2: Delegate to Sub-Agent** (Secondary). Use `delegate_to_agent` only if a specific sub-agent (e.g., `codebase_investigator`) is required for a focused task.
    *   Example: "Phase 1 complete. Activating `orchestrator` to plan Phase 2."
