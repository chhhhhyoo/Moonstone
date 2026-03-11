---
name: session-check
description: Use to verify completed tasks actually match the plan. Compares claimed completions against actual artifacts to prevent false completion claims.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash
---

# Session Check

Validate that session artifacts match the plan. Verify that completed tasks actually produced their expected outputs.

## Workflow

### 1. Load Plan

Read `task_plan.md` and identify items marked as `[x]` (Completed).

### 2. Verify Artifacts

For each completed item, **verify evidence exists**:

| Plan Item | Verification |
|-----------|-------------|
| "Create Component X" | Use `Glob` to check `src/ComponentX.ts` exists |
| "Fix Bug Y" | Use `Grep` to check test case for Y exists |
| "Add config Z" | Use `Read` to verify config is present and correct |
| "Update docs" | Use `Read` to verify documentation matches code |

### 3. Report Deviations

Output a structured report:

```
Session Verification Report:
- VERIFIED: Task 1 (src/ComponentX.ts exists, tests pass)
- VERIFIED: Task 2 (Bug fix confirmed, test added)
- MISSING: Task 3 marked complete, but no test file found
- DRIFT: Task 4 output differs from spec (expected X, found Y)
```

### 4. Recommend Actions

For any missing or drifting items:
- Create tasks via `TaskCreate` for remediation
- Recommend `/debug` for unexpected failures
- Recommend un-marking incomplete items in `task_plan.md`

## Synergies (Command Integration)

- **+ `/execute-plan`**: Run session-check between batches
- **+ `/wrap`**: Verify artifacts before wrapping up
- **+ `/verify`**: Complement with full test/lint verification

$ARGUMENTS
