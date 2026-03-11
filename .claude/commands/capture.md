# Capture Knowledge as Reusable Command

Capture learnings, patterns, or workflows from the current conversation into a new or existing Claude slash command. Use when the user wants to save what was learned, or after ANY significant task completion to preserve knowledge.

## When to Use

- **Explicitly**: User says "capture this", "save this", "make a command out of this"
- **Implicitly**: After resolving a complex bug, designing a system, or figuring out a tricky workflow. **Always check if the current session produced reusable knowledge.**

## Capture Process

### Phase 1: Identify What to Capture

Review the conversation for:

- **Workflows**: Steps that worked (discarding what didn't)
- **Domain knowledge**: Non-obvious facts, configurations, or constraints discovered
- **Insights**: "Aha!" moments or domain constraints
- **Patterns**: Code patterns, command sequences, or templates that worked well
- **Decision rationale**: Why certain approaches were chosen over alternatives

Summarize what you plan to capture and confirm with the user using `AskUserQuestion` before proceeding.

### Phase 2: Determine Scope & Destination

Use `AskUserQuestion` to determine where knowledge should live:

- **Slash Command** (`.claude/commands/<name>.md`): For reusable workflows invoked on-demand
- **CLAUDE.md Rule**: For single-line or short guidelines that should always be active
- **Memory File** (`.claude/projects/.../memory/<topic>.md`): For persistent context across sessions
- **Update Existing Command**: Check existing commands first with `ls .claude/commands/`

**Naming**: kebab-case, action-oriented (e.g., `debug-k8s-pods`, `scaffold-react-component`)

### Phase 3: Draft the Content ("Skillification")

Don't just copy-paste chat logs. Create a **clean, instructional guide**.

#### For New Slash Commands

Use this template structure:

```markdown
# Command Title

Brief introduction of what this command does and why it exists.

## When to Use

- Specific trigger condition 1
- Specific trigger condition 2

## Instructions

### Step 1: Action

Clear, imperative instruction.

1. Sub-step 1
2. Sub-step 2

### Step 2: Action

Code example if relevant:

\`\`\`bash
run_command --flag value
\`\`\`

## Common Issues / Troubleshooting

- **Problem**: Solution
- **Problem**: Solution

$ARGUMENTS
```

Key requirements:
1. Include `$ARGUMENTS` at the end so the command accepts user input
2. Write instructions in imperative mood directed at Claude
3. Include concrete examples drawn from the conversation
4. Add any utility scripts or commands that were used

#### For Updating Existing Commands

1. Read the existing command file
2. Identify where new learnings fit (new section, updated steps, additional examples)
3. Integrate without duplicating existing content
4. Preserve the existing structure and voice

#### For Memory Files

1. Check existing memory files first
2. Use semantic organization by topic
3. Keep entries concise and actionable

### Phase 4: Distillation Guidelines

Transform messy conversation into clean, reusable instructions.

**Do:**
- Extract the final working approach, not the failed attempts (unless gotchas are instructive)
- Generalize from the specific case (replace hardcoded values with placeholders)
- Include the "why" behind non-obvious steps
- Add context the agent wouldn't know without this conversation
- Keep it under 500 lines

**Don't:**
- Include conversation artifacts ("as we discussed", "you mentioned")
- Repeat information the agent already knows
- Include overly specific details that won't transfer
- Add verbose explanations where a code example suffices

### Phase 5: Write and Verify

1. Create/update the file(s) using `Write` or `Edit`
2. Verify the content is under 500 lines
3. Check that trigger descriptions are specific
4. Confirm with the user that the captured content is accurate

## Handling Edge Cases

- **Multiple topics in conversation**: Use `AskUserQuestion` to ask which learning to capture, or suggest creating separate commands
- **Learning too small for a command**: Suggest adding to `CLAUDE.md` rules or a memory file instead
- **Existing command needs major rewrite**: Confirm whether to restructure or create a superseding command

## Synergies (Command Integration)

`/capture` is the "evolution mechanism" for the agent's capabilities:

- **+ `/wrap`**: During session wrap, identify high-value patterns and invoke `/capture` to formalize them
- **+ `/brainstorm`**: If a brainstorming session yields a reusable design pattern, capture it
- **+ `/doubt`**: After a debugging session, capture the diagnostic workflow

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract ADRs, patterns, root causes to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Announce**: Tell the user the new command is available as `/<command-name>`

$ARGUMENTS
