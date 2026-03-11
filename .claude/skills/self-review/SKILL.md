---
name: self-review
description: Use after completing a task or feature, before merging. Diff analysis with 6-pillar checklist (correctness, safety, clarity, tests, security, performance) to catch issues early.
user-invocable: true
allowed-tools: Read, Bash, Glob, Grep, Write
---

# Self Code Review

Dispatch a self-review to catch issues before they cascade. Use after completing tasks, implementing features, or before merging.

**Core principle**: Review early, review often.

## When to Request Review

**Mandatory:**
- After completing a major feature
- Before merge to main
- After each batch in plan execution

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing a complex bug

## How to Perform the Review

### 1. Generate the Diff

```bash
git diff HEAD~1 HEAD --stat   # High level summary
git diff HEAD~1 HEAD           # Detailed changes
```

### 2. Run Automated Checks

```bash
npm run lint:fix
npm test
```

### 3. Analyze (The Checklist)

> **Reference**: Load review criteria from `.claude/prompts/shared/code-reviewer.md`.

Critique the diff against these pillars:

| Pillar | Check |
|--------|-------|
| **Correctness** | Does it match the requirement/spec? |
| **Safety** | Null checks? Error handling? Input validation? |
| **Clarity** | Descriptive variable names? No `x`, `data`, `temp`? |
| **Tests** | Tests exist for new logic? Edge cases covered? |
| **Security** | No injection vectors? No hardcoded secrets? |
| **Performance** | No N+1 queries? No unnecessary loops? |

### 4. Generate Report

```markdown
## Self-Review Report
**Summary**: [What changed]
**Automated Checks**: [Pass/Fail]

### Critical Issues (Must Fix)
- [ ] [Issue 1]

### Important Issues (Should Fix)
- [ ] [Issue 1]

### Suggestions (Nice to Have)
- [ ] [Suggestion 1]

**Verdict**: [Ready to Merge / Needs Work]
```

### 5. Fix Issues

If issues found:
1. Fix critical issues immediately
2. Fix important issues
3. Re-run automated checks
4. Re-review the fixes

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues

## Synergies (Command Integration)

`/self-review` catches issues early:

- **+ `/commit`**: Review before committing
- **+ `/finish-branch`**: Review before finishing a branch
- **+ `/execute-plan`**: Review after each batch
- **+ `/verify`**: Run verification as part of the review

$ARGUMENTS
