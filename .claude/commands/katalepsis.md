# Katalepsis (Comprehension Verification)

Achieve certain comprehension of AI-generated changes through structured Socratic verification. Use when user asks "what did you do", "help me understand", "walk me through this", or after any significant implementation.

**Katalepsis** (κατάληψις): Transforming AI-generated results into verified user understanding through categorized entry points and progressive verification.

**Core Principle**: Comprehension over Explanation. Verify the user's understanding through questions rather than lecturing.

## Protocol

### Phase 1: Entry Point Selection

Analyze the changes made, categorize them, then use `AskUserQuestion` to let the user choose where to start:

```
What would you like to understand first?
Options:
1. [Category A]: [Brief description]
2. [Category B]: [Brief description]
3. All of the above
```

Categories might include: Architecture changes, Business logic, Test coverage, Configuration, API changes, etc.

### Phase 2: Task Registration

Create tasks via `TaskCreate` for each selected category:
- Track comprehension status per category
- Mark complete when user confirms understanding

### Phase 3: Comprehension Loop (Socratic Verification)

For each category, use `AskUserQuestion` with **Socratic verification** - ask rather than tell:

```
Verification: [Category]
[Brief overview of what changed]

Verification Question:
[Specific question about the logic/impact - e.g., "What do you think happens when X receives a null input now?"]

Options:
1. "I get it" - Move to next part
2. "Not quite" - Explain further, then re-verify
3. "Show me the code" - Highlight relevant lines, then re-verify
```

**Rules for questions:**
- Reference specific files and line numbers
- Ask "What do you think this does?" instead of "This does X"
- Focus on the *why* behind changes, not just the *what*
- Verify understanding of edge cases and failure modes

### Phase 4: Convergence

Loop until all selected categories are marked complete:
- If user says "I get it" -> Mark task complete, move to next
- If user says "Not quite" -> Provide targeted explanation, then re-ask
- If user says "Show me the code" -> Use `Read` to show relevant code with context, then re-ask

## Rules

1. **User-initiated only**: Activate only when user signals desire to understand
2. **Interactive Pause**: MUST use `AskUserQuestion` and wait. No tool calls until response.
3. **Verify, don't lecture**: Confirm understanding through questions, not explanations
4. **Socratic Style**: Guide discovery, don't dump information
5. **Code Grounding**: Always reference specific files and line numbers
6. **Convergence**: Mode remains active until all selected tasks are resolved

## Synergies (Command Integration)

`/katalepsis` closes the comprehension loop:

- **+ `/execute-plan`**: Run after plan execution to ensure the user owns the result
- **+ `/wrap`**: Part of the session wrap process
- **+ `/brainstorm`**: After a design is implemented, verify the user grasps it fully

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract insights to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command`

$ARGUMENTS
