# Knowledge Bridge

The project librarian. Use when you need to retrieve engineering patterns, log architectural decisions (ADRs), save daily work logs, or crystallize learnings.

**Philosophy**: Documentation is a **Graph**, not a pile of files.
- **Local Context**: Belongs to the Project (Plans, Decisions, Logs)
- **Global Context**: Belongs to the User (Workflows, Patterns, Prompts stored in memory)

## Commands

### 1. `retrieve` - Get Context Before Starting Work

**Usage**: User says "bridge retrieve [topic]" or "find docs about [topic]"

1. **Determine Search Scope**:
   - **Local (project)**: Search in `docs/` directory
   - **Global (user)**: Search in Claude memory files
2. **Search**:
   - Use `Grep` to find matching content across the scope
   - Use `Glob` to find matching filenames
3. **Display**:
   - If < 3 matches: Automatically read and present them
   - If > 3 matches: Use `AskUserQuestion` to let user choose which to read

### 2. `log_decision` - Record an Architectural Choice (ADR)

**Usage**: User says "log decision", "record ADR", or an architectural choice was made

1. **Format Filename**: `YYYY-MM-DD-{Title-Kebab-Case}.md`
2. **Format Content**:
   ```markdown
   # {Title}
   **Date**: {YYYY-MM-DD}
   **Status**: Accepted

   ## Context
   {Why was this decision needed?}

   ## Decision
   {What was decided?}

   ## Consequences
   {What are the trade-offs and implications?}
   ```
3. **Write**: Save to `docs/decisions/{Filename}`
4. **Confirm**: "Recorded ADR: docs/decisions/{Filename}"

### 3. `daily_log` - Append Progress to Today's Work Log

**Usage**: User says "log this", "daily log", or at natural checkpoints

1. **Determine Filename**: `docs/logs/{YYYY-MM-DD}.md`
2. **Format Entry**:
   ```markdown
   ## {HH:MM}
   - {Log Message}
   ```
3. **Check Existence**:
   - If file exists: **Append** the entry
   - If missing: Create with `# Work Log - {YYYY-MM-DD}` header, then append
4. **Confirm**: "Logged to docs/logs/{YYYY-MM-DD}.md"

### 4. `compound` - Crystallize a Learning

**Usage**: User says "save this learning", "crystallize", or a reusable pattern was discovered

1. **Determine Target**:
   - **Pattern/Workflow (global)**: Save to Claude memory files (`.claude/projects/.../memory/`)
   - **Project-specific**: Append to `docs/learnings.md`
2. **Execute Write**:
   - **Global**: Use `Write` to save to memory file
   - **Local**: Append to `docs/learnings.md` with format: `## {YYYY-MM-DD}: {Title}\n{Content}`
3. **Confirm**: Output the path where knowledge was saved

## Synergies (Command Integration)

`/bridge` builds the long-term knowledge base:

- **+ `/wrap`**: Session wrap triggers `bridge daily_log` and `bridge compound`
- **+ `/brainstorm`**: Log architectural decisions made during brainstorming via `bridge log_decision`
- **+ `/project-insight`**: Uses the references and decisions stored by `/bridge` for historical context
- **+ `/reflect`**: Reflexion outputs are persisted via `/bridge compound`

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract insights to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command`

$ARGUMENTS
