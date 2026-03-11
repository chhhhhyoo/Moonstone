# Receive Code Review

Use when receiving code review feedback. Requires technical rigor and verification - not performative agreement or blind implementation.

**Core principle**: Verify before implementing. Ask before assuming. Technical correctness over social comfort.

## The Response Pattern

### 1. Fetch & Parse

- If PR number given: `gh pr view <id> --comments` and `gh api repos/{owner}/{repo}/pulls/{id}/comments`
- If text pasted: Read carefully
- List all actionable items (Item 1, Item 2...)

### 2. Read Complete Feedback

Read ALL feedback without reacting.

### 3. Understand

Restate each requirement in your own words. If unclear on ANY item, stop and ask for clarification on ALL unclear items before implementing anything.

**Example**:
```
Understand items 1,2,3,6. Need clarification on 4 and 5 before implementing.
```

### 4. Verify Against Codebase

Check each suggestion against reality:
- Use `Grep` and `Read` to verify technical claims
- Use `Bash` to run relevant tests
- Check if suggestion would break existing functionality

### 5. Evaluate

Is the suggestion technically sound for THIS codebase?
- If choosing between approaches, recommend `/council` for multi-perspective analysis
- Check against existing architectural decisions in `docs/decisions/`

### 6. Respond Appropriately

**Forbidden responses** (NEVER use):
- "You're absolutely right!"
- "Great point!" / "Excellent feedback!"
- "Thanks for catching that!"
- ANY gratitude expression

**Correct responses**:
- Restate the technical requirement
- Ask clarifying questions if needed
- Push back with technical reasoning if wrong
- Just fix it and show the code (actions > words)

### 7. Implement

One item at a time, test each:
1. Blocking issues (breaks, security) first
2. Simple fixes (typos, imports)
3. Complex fixes (refactoring, logic)
4. Verify no regressions after each

## When to Push Back

Push back when:
- Suggestion breaks existing functionality
- Reviewer lacks full context
- Violates YAGNI (feature isn't used)
- Technically incorrect for this stack
- Conflicts with architectural decisions

**How**: Use technical reasoning, reference working tests/code, ask specific questions.

## YAGNI Check

```
IF reviewer suggests "implementing properly":
  Use Grep to check actual usage in codebase
  IF unused: "This endpoint isn't called. Remove it (YAGNI)?"
  IF used: Implement properly
```

## Acknowledging Correct Feedback

When feedback IS correct:
- "Fixed. [Brief description of what changed]"
- "Good catch - [specific issue]. Fixed in [location]."
- Or just fix it silently and show the result

## GitHub Thread Replies

When replying to inline review comments:
```bash
gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies -f body="[response]"
```

Reply in the thread, not as a top-level PR comment.

## Synergies (Command Integration)

`/review-pr` ensures technical rigor in code review:

- **+ `/doubt`**: After implementing feedback, verify the fix is correct
- **+ `/verify`**: Run full verification after applying changes
- **+ `/council`**: When feedback suggests a major architectural change

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract insights to `docs/learnings.md`
3. **Chain Next Step**: Recommend the next appropriate `/command`

$ARGUMENTS
