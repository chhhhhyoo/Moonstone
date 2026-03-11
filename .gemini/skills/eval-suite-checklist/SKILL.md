---
name: eval-suite-checklist
description: Use when designing test suites or conformance checks. Ensures coverage of failure modes, security, and happy paths.
---
# Eval Suite Checklist

## Workflow

### 1. Test Strategy (The "Matrix")
Before writing JSON, define your coverage matrix. You MUST include:
*   **Happy Path:** The standard use case (e.g., "1+1=2").
*   **Edge Cases:** Boundaries (e.g., "0+0", "MAX_INT", "Empty Input").
*   **Security/Adversarial:** Malicious input (e.g., SQL injection attempts, shell injection).
*   **System Failure:** How should it behave if the backend is down?

### 2. Implementation
Draft tests in `tests/conformance/*.json` adhering to the matrix.
*   Ensure `shell=false` (exec as array, not string).
*   Ensure assertions are deterministic.

### 3. Verification
1.  **Lint:** `npm run conformance:lint`
2.  **Run:** `npm run conformance`
3.  **Review:** Did the "Adversarial" tests actually fail safely?

## Synergies (Skill Integration)

`eval-suite-checklist` ensures high-quality conformance testing:

- **+ `test-driven-development`**: Use TDD to implement the tests defined in the checklist.
- **+ `systematic-debugging`**: If the conformance suite reveals failures, use `systematic-debugging` to investigate.
- **+ `finishing-a-development-branch`**: This checklist MUST be satisfied before a branch can be considered "finished."

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
