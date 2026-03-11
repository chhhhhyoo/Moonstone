---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---

# Requesting Code Review

Dispatch superpowers:code-reviewer subagent to catch issues before they cascade.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**
- After each task in subagent-driven development
- After completing major feature
- Before merge to main

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Perform a Review

**Since no dedicated 'code-reviewer' sub-agent exists, YOU are the reviewer.**

**1. Generate the Diff:**
```bash
# Get the changes to review
git diff HEAD~1 HEAD --stat  # High level
git diff HEAD~1 HEAD         # Detailed
```

**2. Run Automated Checks:**
```bash
npm run lint  # or equivalent
npm test      # Verify correctness
```

**3. Analyze (The Checklist):**
Critique the code in the diff against these pillars:
*   **Correctness:** Does it match the requirement?
*   **Safety:** Are there null checks? Error handling?
*   **Clarity:** Are variable names descriptive? (No `x`, `data`, `temp`).
*   **Tests:** Do tests exist for the new logic?

**4. Generate Report:**
Output a structured review:
```markdown
## Self-Review Report
**Summary**: [What changed]
** automated_checks**: [Pass/Fail]

### Critical Issues (Must Fix)
- [ ] [Issue 1]

### Suggestions (Nice to Have)
- [ ] [Suggestion 1]

**Verdict**: [Ready to Merge / Needs Work]
```

## Example

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch superpowers:code-reviewer subagent]
  WHAT_WAS_IMPLEMENTED: Verification and repair functions for conversation index
  PLAN_OR_REQUIREMENTS: Task 2 from docs/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types

[Subagent returns]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [Fix progress indicators]
[Continue to Task 3]
```

## Integration with Workflows

**Subagent-Driven Development:**
- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

**Executing Plans:**
- Review after each batch (3 tasks)
- Get feedback, apply, continue

**Ad-Hoc Development:**
- Review before merge
- Review when stuck

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

See template at: requesting-code-review/assets/code-reviewer.md

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
