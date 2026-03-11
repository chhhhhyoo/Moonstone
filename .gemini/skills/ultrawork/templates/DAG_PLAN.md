# [Feature Name] Implementation Plan

> **Status**: [DRAFT | APPROVED | EXECUTING | COMPLETED]
> **Drift Control**: Strict. Do not deviate from the DAG.

## 1. Objectives & Boundaries

**Goal:** [One sentence goal]

**Must NOT Do:**
- [ ] Break existing feature X
- [ ] Add new dependency without approval

**Definition of Done:**
- [ ] All mechanical verifications pass
- [ ] No manual steps required for deployment

---

## 2. Dependency Graph (DAG)

> **Rule:** Task B cannot start until Task A's outputs are verified.

| Task ID | Description | Depends On | Outputs |
|:-------:|:------------|:-----------|:--------|
| TODO-1 | Setup Interface | - | `src/types.ts` |
| TODO-2 | Implement Logic | TODO-1 | `src/logic.ts` |
| TODO-3 | E2E Verification | TODO-2 | (Verification Report) |

---

## 3. Execution Tasks (The Factory Line)

### TODO-1: [Task Name]
**Type:** Implementation
**Context:**
- Reference: `src/existing_pattern.ts` (Follow this style)

**Steps:**
- [ ] Write failing test in `tests/feature.test.ts`
- [ ] Implement interface in `src/types.ts`
- [ ] Verify test failure (Command: `npm test tests/feature.test.ts`)
- [ ] Implement minimal code to pass
- [ ] Verify test success

**Mechanical Verification (The Lie Detector):**
```json
{
  "acceptance_criteria": [
    {
      "id": "file_exists",
      "command": "test -f src/types.ts",
      "description": "File must exist"
    },
    {
      "id": "type_check",
      "command": "tsc --noEmit src/types.ts",
      "description": "Must compile without errors"
    }
  ]
}
```

---

### TODO-2: [Task Name]
**Type:** Implementation
**Context:**
- Input: `src/types.ts` (From TODO-1)

**Steps:**
- [ ] ...

**Mechanical Verification:**
```json
{
  "acceptance_criteria": [
    {
      "id": "unit_test",
      "command": "npm test tests/logic.test.ts",
      "description": "Unit tests must pass"
    }
  ]
}
```
