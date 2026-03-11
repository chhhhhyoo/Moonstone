# Reflexion Protocol

Extract session insights and persist to memory. Use when wrapping up, saving learnings, or reflecting on what was accomplished. Crystallizes tacit knowledge into explicit, persistent memory.

**Core Principle**: Crystallization over Accumulation. Distill structured insights; don't merely archive raw experience.

## Protocol

### Phase 1: Context Detection

Identify what happened this session:
- Check `git log` for recent commits
- Read `findings.md` for turn discoveries
- Read `task_plan.md` for completed work
- Read `progress.md` for session timeline

### Phase 2: Parallel Extraction

Launch 3 `Agent` (general-purpose) subagents **in parallel** using prompts from `.claude/prompts/reflect/`:

**Agent 1 - Insight Extractor**:
```
Review the session context and extract:
1. Key decisions made and their rationale
2. Surprising discoveries or "aha" moments
3. Patterns that could be reused
4. Mistakes made and lessons learned
Format as a numbered list with category tags.
```

**Agent 2 - Session Summarizer**:
```
Create a concise session summary:
1. What was the goal?
2. What was accomplished?
3. What remains?
4. What changed from the original plan?
```

**Agent 3 - Knowledge Finder**:
```
Identify reusable knowledge from this session:
1. Engineering patterns discovered
2. Tool/library insights
3. Debugging techniques that worked
4. Architectural decisions with broad applicability
```

### Phase 3: Guided Selection

Use `AskUserQuestion` (with `multiSelect: true`) to present extracted insights:

```
The following insights were extracted. Which should be persisted to memory?
Options:
1. [Insight 1 - brief description]
2. [Insight 2 - brief description]
3. [Insight 3 - brief description]
4. All of the above
```

### Phase 4: Integration

Persist selected insights to the appropriate targets:

1. **Learnings** -> Append to `docs/learnings.md`:
   ```markdown
   ## YYYY-MM-DD: [Title]
   - [Insight]
   - **Context**: [Why this matters]
   ```

2. **Decisions** -> Create ADR in `docs/decisions/YYYY-MM-DD-{topic}.md`

3. **Patterns** -> Update Claude memory files for cross-session persistence

4. **Daily Log** -> Append session summary to `docs/logs/YYYY-MM-DD.md`

### Phase 5: Verification

Confirm all selected insights were persisted. Report what was saved where.

## Rules

1. **Interactive Pause**: MUST use `AskUserQuestion` and wait for selection
2. **Crystallization**: Focus on the *why* (high-value insights), not the *what* (raw logs)
3. **Parallelism**: Use Agent tool for extraction to save time
4. **Convergence**: Mode active until all selected insights are integrated

## Synergies (Command Integration)

`/reflect` is the memory management layer:

- **+ `/wrap`**: Session wrap triggers reflexion as Phase 4
- **+ `/debug`**: After debugging, reflexion captures root cause as persistent learning
- **+ `/bridge`**: Integration targets are managed by `/bridge`
- **+ `/capture`**: If reflexion reveals a reusable workflow, invoke `/capture`

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: All findings.md content moved to `docs/logs/`
2. **Verify**: Confirm all selected insights were persisted
3. **Chain Next Step**: Recommend the next appropriate `/command`

$ARGUMENTS
