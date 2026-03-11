# Code Quality Reviewer Prompt Template

Use this template when dispatching a code quality reviewer `Agent` (general-purpose) subagent.

**Used by:** `/subagent-dev` (Phase 4 — quality gate #2)
**Purpose:** Verify implementation is well-built (clean, tested, maintainable)
**Prerequisite:** Only dispatch AFTER spec compliance review passes.

## Template

Dispatch an Agent with the shared code reviewer prompt from `.claude/prompts/shared/code-reviewer.md`, providing these parameters:

- **WHAT_WAS_IMPLEMENTED**: [from implementer's report]
- **PLAN_OR_REQUIREMENTS**: Task N from [plan-file]
- **BASE_SHA**: [commit before task]
- **HEAD_SHA**: [current commit]
- **DESCRIPTION**: [task summary]

The code reviewer will return: Strengths, Issues (Critical/Important/Minor), Assessment.

## When to Use

- After spec compliance review passes (never before)
- The code reviewer checks quality, not spec compliance (that's already verified)
- Focus shifts to: architecture, testing quality, production readiness
