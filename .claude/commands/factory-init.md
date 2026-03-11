# Factory Init

Initialize Manus-style planning files for a new complex task. Creates the persistent working memory on disk.

## Workflow

### 1. Create Planning Files

Create the following files in the project root:

**`task_plan.md`** - Phase tracking and task breakdown:
```markdown
# Task Plan
**Goal**: [Goal from user]
**Created**: [YYYY-MM-DD]

## Phases
### Phase 1: [Name]
- [ ] Task 1.1
- [ ] Task 1.2

## Epistemic Gaps
(None yet)

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
```

**`findings.md`** - Transient turn discoveries:
```markdown
# Findings
**Session**: [YYYY-MM-DD]

## Turn Findings
(Record discoveries here immediately - reconcile to docs/logs/ before session end)
```

**`progress.md`** - Session log and test results:
```markdown
# Progress Log
**Session**: [YYYY-MM-DD]

## Timeline
- [HH:MM] Session started
```

### 2. Check for Existing Context

Before creating new files:
- Check if `task_plan.md` already exists (ask user if they want to overwrite or resume)
- Check `docs/learnings.md` and `docs/decisions/` for relevant prior context
- Read recent git log for context on current work

### 3. Remind User

**CRITICAL**: Remind the user:
- Review `docs/learnings.md` for relevant past insights
- Review `docs/decisions/` for architectural constraints
- These files are your "external memory" - update them as you work

### 4. Announce

"Factory initialized. External memory is active. Planning files created at project root."

## The Core Pattern

```
Context Window = RAM (volatile, limited)
Filesystem = Disk (persistent, unlimited)

-> Anything important gets written to disk immediately.
```

## Critical Rules

1. **Create Plan First**: Never start complex work without `task_plan.md`
2. **The 2-Action Rule**: After every 2 search/read operations, save key findings to `findings.md`
3. **Read Before Decide**: Re-read `task_plan.md` before major decisions
4. **Update After Act**: Mark phases complete, log errors, note files created
5. **Log ALL Errors**: Every error goes in the plan file
6. **Never Repeat Failures**: Track attempts, mutate approach

## 3-Strike Error Protocol

```
ATTEMPT 1: Diagnose & Fix (targeted)
ATTEMPT 2: Alternative Approach (different method)
ATTEMPT 3: Broader Rethink (question assumptions)
AFTER 3 FAILURES: Escalate to User
```

## Synergies (Command Integration)

`/factory-init` sets up the workspace for structured work:

- **+ `/write-plan`**: After init, use `/write-plan` to populate the task plan
- **+ `/execute-plan`**: Executes the initialized plan
- **+ `/launch`**: `/launch` calls `/factory-init` as its setup step
- **+ `/wrap`**: Session wrap reconciles the planning files

$ARGUMENTS
