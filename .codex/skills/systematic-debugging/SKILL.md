---
name: systematic-debugging
description: Root-cause failures through evidence-based analysis. Trigger when encountering bugs, test failures, or unexpected behavior.
---
# systematic-debugging

## Purpose
Ensure that debugging is an evidence-driven process that identifies root causes rather than a trial-and-error "fix-and-hope" cycle. It enforces the "Iron Law": NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.

## Protocol (The Four Phases)

### Phase 1: Root Cause Investigation
1.  **Reveal the Invisible**: If no error message exists, add instrumentation (`console.log`, `DEBUG=*`) first.
2.  **Consistent Reproduction**: Establish exact steps to trigger the failure every time.
3.  **Check Changes**: Review `git diff` and recent config/dependency updates.
4.  **Boundary Instrumentation**: Log data entering/exiting components (CI, API, DB) to isolate WHERE it breaks.
5.  **Data Flow Tracing**: Trace "bad values" backward up the call stack to their source.

### Phase 2: Pattern Analysis
1.  **Working Examples**: Locate similar working code in the same codebase.
2.  **Reference Comparison**: Read reference implementations COMPLETELY.
3.  **Difference Mapping**: List every difference, however small, between working and broken code.

### Phase 3: Hypothesis and Testing
1.  **Single Hypothesis**: State "I think X is the root cause because Y."
2.  **Minimal Test**: Make the SMALLEST possible change to test the theory.
3.  **Verify**: If it fails, form a NEW hypothesis. Do not add fixes on top.

### Phase 4: Implementation
1.  **Failing Test**: Create a minimal reproduction test case (use `test-driven-development`).
2.  **Single Fix**: Address the identified root cause. ONE change at a time.
3.  **Verification**: Confirm fix resolved the issue and broke no other tests.
4.  **Architectural Check**: If 3+ fixes fail, STOP and question the fundamental architecture with the user.

## Rules
- **Stop Guessing**: If you don't understand, research more or ask for help.
- **No Fixes without Investigation**: Phase 1 is mandatory.
- **Symptom Fixes are Failure**: Address the source, not the manifestation.

## Synergies (Skill Integration)
- **+ `reflexion`**: Mandatory after complex fixes to extract the "Root Cause" lesson.
- **+ `test-driven-development`**: Essential for Phase 4 (Implementation).
- **+ `codebase-investigator`**: Use during Phase 1 to trace data flows across large systems.

## Exit Protocol
1.  **Reconcile Memory**: Move findings to `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallization**: Promote root-cause lessons to `docs/learnings.md`.
3.  **Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Handoff**: Chain next step via `activate_skill`.
