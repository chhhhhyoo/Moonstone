# Manage Commands

The Librarian for Claude Code. Audit, improve, and organize the slash command library (`.claude/commands/`).

## Purpose

Ensure the command library is healthy, up-to-date, and high-quality. This manages the *artifacts*, not execution.

## Workflow

### 1. Audit (Quality Assurance)

**Use when**: "Audit commands", "Check command quality", "List my commands"

1. **Scan**: List all commands:
   ```bash
   ls -la .claude/commands/
   ```
2. **Inspect each**: Read the command file and check:
   - [ ] Has clear trigger description
   - [ ] Instructions are in imperative mood
   - [ ] Includes `$ARGUMENTS` for user input
   - [ ] References correct tool names (Read, Write, Bash, etc.)
   - [ ] Synergies section references existing commands
   - [ ] Exit protocol is present
   - [ ] Under 500 lines
3. **Report**: Pass/Fail for each, with recommendations

### 2. Maintenance (The Fixer)

**Use when**: "Fix this command", "Update dependencies", "Modernize"

1. Read the existing command
2. Identify issues against the quality checklist
3. Apply fixes while preserving structure and voice
4. Verify the command is syntactically correct

### 3. Creation (The Builder)

**Use when**: "Create a new command"

Delegate to `/capture` which handles the full creation workflow with templates.

## Quality Checklist

- [ ] **Purposeful**: Clear, specific description of when to use
- [ ] **Instructional**: Step-by-step in imperative mood
- [ ] **Tooled**: References correct Claude tools (not Gemini tools)
- [ ] **Connected**: Synergies reference real, existing commands
- [ ] **Bounded**: Under 500 lines
- [ ] **Templated**: Includes `$ARGUMENTS` at the end
- [ ] **Exited**: Has Exit Protocol section

## Synergies (Command Integration)

`/manage-commands` maintains the toolbelt:

- **+ `/capture`**: Creates raw material; `/manage-commands` polishes and organizes
- **+ `/wrap`**: During session wrap, audit if any new commands should be created

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract insights to `docs/learnings.md`
3. **Chain Next Step**: Recommend the next appropriate `/command`

$ARGUMENTS
