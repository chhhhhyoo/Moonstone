---
name: eval-checklist
description: Use when designing test suites or conformance checks. Ensures coverage of all four required categories: happy path, edge cases, security/adversarial, and system failure.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, Edit, AskUserQuestion
---

# Eval Suite Checklist

Use when designing test suites or conformance checks. Ensures coverage of failure modes, security, adversarial inputs, and happy paths.

## Workflow

### 1. Test Strategy (The "Matrix")

> **Reference**: See `.claude/assets/testing/test-strategy.md` for required test categories and format.

Before writing any test JSON, define a coverage matrix. You MUST include all four categories:

| Category | Description | Examples |
|----------|-------------|----------|
| **Happy Path** | Standard use case | "1+1=2", valid input |
| **Edge Cases** | Boundaries | "0+0", MAX_INT, empty input, single character |
| **Security/Adversarial** | Malicious input | SQL injection, shell injection, XSS, path traversal |
| **System Failure** | Infrastructure issues | Backend down, timeout, partial response, disk full |

### 2. Implementation

Draft tests in `tests/conformance/*.json` adhering to the matrix:
- Ensure `shell=false` (exec as array, not string) to prevent injection
- Ensure assertions are deterministic (no timing-dependent checks)
- Each test must have a clear name describing what it verifies

### 3. Verification

Run the suite and validate:

```bash
# Lint conformance tests (see .claude/scripts/lint-conformance.ts)
npm run conformance:lint

# Run conformance suite (see .claude/scripts/run-conformance.ts)
npm run conformance
```

Review results critically:
- Did the "Adversarial" tests actually fail safely (rejected malicious input)?
- Did "System Failure" tests degrade gracefully?
- Are there any categories with zero tests?

### 4. Coverage Gap Analysis

After running, check for gaps:
- Use `AskUserQuestion` to present any uncovered categories
- Propose additional tests for missing scenarios
- Ensure at least 2 tests per category

## Synergies (Command Integration)

`/eval-checklist` ensures high-quality conformance testing:

- **+ `/verify`**: Run the full verification suite after tests are in place
- **+ `/debug`**: If conformance reveals failures, use systematic debugging
- **+ `/finish-branch`**: This checklist MUST be satisfied before a branch is "done"
- **+ `/build-agent`**: New agents need conformance tests defined during spec phase

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract insights to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command`

$ARGUMENTS
