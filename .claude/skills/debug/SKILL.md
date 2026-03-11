---
name: debug
description: Use whenever encountering a bug, test failure, unexpected behavior, error message, or performance problem. 4-phase root cause investigation — find root cause before fixing.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Agent, Write, Edit, AskUserQuestion
---

# Systematic Debugging

Use when encountering any bug, test failure, or unexpected behavior — before proposing fixes.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## When to Use

Use for ANY technical issue:
- Test failures, bugs, unexpected behavior
- Performance problems, build failures, integration issues

**Use ESPECIALLY when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work

## The Four Phases

You MUST complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Reveal the Invisible (Silent Failures)**
   - If there is no error message, **STOP**. You cannot debug silence.
   - **Action:** Add `console.log`, enable `DEBUG=*`, or check logs. Make the error visible first.

2. **Read Error Messages Carefully**
   - Don't skip past errors or warnings — they often contain the exact solution
   - Read stack traces completely
   - Note line numbers, file paths, error codes

3. **Reproduce Consistently**
   - Can you trigger it reliably? What are the exact steps?
   - If not reproducible → gather more data, don't guess

4. **Check Recent Changes**
   - Run `git diff`, check recent commits
   - New dependencies, config changes, environmental differences?

5. **Gather Evidence in Multi-Component Systems**

   WHEN system has multiple components (CI → build → signing, API → service → database):

   Use `Agent` (general-purpose) subagents to instrument each component boundary:
   ```
   For EACH component boundary:
     - Log what data enters component
     - Log what data exits component
     - Verify environment/config propagation
     - Check state at each layer

   Run once to gather evidence showing WHERE it breaks
   THEN analyze evidence to identify failing component
   THEN investigate that specific component
   ```

6. **Trace Data Flow**
   - Where does the bad value originate?
   - What called this with the bad value?
   - Keep tracing up until you find the source
   - Fix at source, not at symptom

### Phase 2: Pattern Analysis

**Find the pattern before fixing:**

> **Reference**: Read `.claude/assets/debugging/` for root-cause tracing, defense-in-depth patterns, condition-based waiting, and pressure-test scenarios.

1. **Find Working Examples** — Locate similar working code in same codebase
2. **Compare Against References** — Read reference implementations COMPLETELY, don't skim
3. **Identify Differences** — List every difference between working and broken, however small
4. **Understand Dependencies** — What other components, settings, config, environment does this need?

### Phase 3: Hypothesis and Testing

**Scientific method:**

1. **Form Single Hypothesis** — State clearly: "I think X is the root cause because Y"
2. **Test Minimally** — Make the SMALLEST possible change to test hypothesis. One variable at a time.
3. **Verify Before Continuing**
   - Did it work? Yes → Phase 4
   - Didn't work? Form NEW hypothesis. DON'T add more fixes on top.
4. **When You Don't Know** — Say "I don't understand X". Don't pretend.

### Phase 4: Implementation

**Fix the root cause, not the symptom:**

1. **Create Failing Test Case** — Use `/tdd` for writing proper failing tests
2. **Implement Single Fix** — ONE change at a time. No "while I'm here" improvements.
3. **Verify Fix** — Test passes? No other tests broken? Issue actually resolved?
4. **If Fix Doesn't Work** — STOP. Count how many fixes you've tried:
   - If < 3: Return to Phase 1, re-analyze with new information
   - **If >= 3: STOP and question the architecture (step 5)**

5. **If 3+ Fixes Failed: Question Architecture**

   Pattern indicating architectural problem:
   - Each fix reveals new shared state/coupling/problem in different place
   - Fixes require "massive refactoring" to implement
   - Each fix creates new symptoms elsewhere

   **STOP and question fundamentals.** Use `AskUserQuestion`:
   - Is this pattern fundamentally sound?
   - Are we "sticking with it through sheer inertia"?
   - Should we refactor architecture vs. continue fixing symptoms?

## Red Flags — STOP and Follow Process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- Proposing solutions before tracing data flow
- **"One more fix attempt" (when already tried 2+)**
- **Each fix reveals new problem in different place**

**ALL of these mean: STOP. Return to Phase 1.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "I'll write test after confirming fix works" | Untested fixes don't stick. Test first proves it. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs. |

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix, verify | Bug resolved, tests pass |

## Synergies (Command Integration)

`/debug` works best when paired with:

- **+ `/reflect`**: Mandatory after fixing a complex bug. Extract "Root Cause" and "Pattern" into `docs/learnings.md` to prevent recurrence.
- **+ `/tdd`**: Essential for Phase 4 (Implementation). You MUST create a failing test case before fixing the bug.
- **+ `/verify-complete`**: Verify fix with fresh evidence before claiming success.

## Exit Protocol (Mandatory)

1. Reconcile findings to `docs/logs/YYYY-MM-DD.md`
2. Crystallize root cause insights to `docs/learnings.md`
3. Update `task_plan.md` with completed items
4. Chain Next Step: Recommend the next appropriate `/command`

$ARGUMENTS
