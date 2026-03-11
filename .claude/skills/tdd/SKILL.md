---
name: tdd
description: Use when implementing any new feature, bugfix, or behavior. Enforces Red-Green-Refactor with Iron Law: no production code without a failing test first.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# Test-Driven Development (TDD)

Use when implementing any feature or bugfix — before writing implementation code.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

**Violating the letter of the rules is violating the spirit of the rules.**

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over.

**No exceptions:**
- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Don't look at it
- Delete means delete

## Red-Green-Refactor

### RED — Write Failing Test

Write one minimal test showing what should happen.

**Requirements:**
- One behavior per test
- Clear name describing the behavior
- Real code (no mocks unless unavoidable)

```typescript
// GOOD: Clear name, tests real behavior, one thing
test('retries failed operations 3 times', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };
  const result = await retryOperation(operation);
  expect(result).toBe('success');
  expect(attempts).toBe(3);
});

// BAD: Vague name, tests mock not code
test('retry works', async () => {
  const mock = jest.fn()
    .mockRejectedValueOnce(new Error())
    .mockResolvedValueOnce('success');
  await retryOperation(mock);
  expect(mock).toHaveBeenCalledTimes(2);
});
```

### Verify RED — Watch It Fail

**MANDATORY. Never skip.**

```bash
npm test path/to/test.test.ts
```

Confirm:
- Test fails (not errors)
- Failure message is expected
- Fails because feature missing (not typos)

**Test passes?** You're testing existing behavior. Fix test.
**Test errors?** Fix error, re-run until it fails correctly.

### GREEN — Minimal Code

Write simplest code to pass the test. Don't add features, refactor other code, or "improve" beyond the test.

```typescript
// GOOD: Just enough to pass
async function retryOperation<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < 3; i++) {
    try { return await fn(); }
    catch (e) { if (i === 2) throw e; }
  }
  throw new Error('unreachable');
}

// BAD: Over-engineered (YAGNI)
async function retryOperation<T>(
  fn: () => Promise<T>,
  options?: { maxRetries?: number; backoff?: 'linear' | 'exponential'; }
): Promise<T> { /* ... */ }
```

### Verify GREEN — Watch It Pass

**MANDATORY.**

```bash
npm run lint:fix
npm test path/to/test.test.ts
```

Confirm: Test passes. Other tests still pass. Output pristine.

**Test fails?** Fix code, not test. **Other tests fail?** Fix now.

### REFACTOR — Clean Up

After green only: Remove duplication, improve names, extract helpers. Keep tests green. Don't add behavior.

### Repeat

Next failing test for next feature.

## Contract-First MSW Testing (Boundary Integrity)

For all external integrations, use **Mock Service Worker (MSW)**:

1. **Network-Level Capture**: Intercept actual HTTP calls, don't mock the service class
2. **Contract Verification**: Verify outgoing request (URL, Method, Body, Headers) matches expected contract
3. **Domain Organization**: Store mock handlers in `test/mocks/[domain]/`
4. **No implementation-leaking mocks**: Tests should not know HOW the service works internally

## Common Rationalizations

> **Reference**: See `.claude/assets/testing/anti-patterns.md` for an extended catalog of testing anti-patterns and how to avoid them.

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Tests after achieve same goals" | Tests-after = "what does this do?" Tests-first = "what should this do?" |
| "Keep as reference, write tests first" | You'll adapt it. That's testing after. Delete means delete. |
| "Need to explore first" | Fine. Throw away exploration, start with TDD. |
| "TDD will slow me down" | TDD faster than debugging. Pragmatic = test-first. |
| "Deleting X hours is wasteful" | Sunk cost fallacy. Keeping unverified code is technical debt. |

## Red Flags — STOP and Start Over

- Code before test
- Test after implementation
- Test passes immediately
- Can't explain why test failed
- Rationalizing "just this once"
- "Keep as reference" or "adapt existing code"
- "Already spent X hours, deleting is wasteful"

**All of these mean: Delete code. Start over with TDD.**

## Verification Checklist

Before marking work complete:

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output pristine (no errors, warnings)
- [ ] Tests use real code (mocks only if unavoidable)
- [ ] Edge cases and errors covered

## Troubleshooting

**If you cannot make the test pass after 2-3 attempts:**
1. Stop writing code
2. Invoke `/debug` (systematic debugging)
3. Once understood, return to TDD to fix it

**If the test passes but breaks other tests:**
1. Revert the last change
2. Invoke `/debug` to investigate the regression

## Synergies (Command Integration)

`/tdd` is the foundation of reliable code:

- **+ `/debug`**: If test can't pass after 2-3 attempts, switch to systematic debugging
- **+ `/verify-complete`**: After TDD cycle, verify all claims with fresh evidence
- **+ `/subagent-dev`**: Subagents should follow TDD for each task
- **+ `/execute-plan`**: TDD is required for each task in plan execution

## Exit Protocol (Mandatory)

1. Reconcile findings to `docs/logs/YYYY-MM-DD.md`
2. Crystallize insights to `docs/learnings.md`
3. Update `task_plan.md`
4. Chain Next Step: Recommend the next appropriate `/command`

$ARGUMENTS
