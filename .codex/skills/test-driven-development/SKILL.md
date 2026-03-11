---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code. Trigger when starting new features or bug fixes.
---
# test-driven-development

## Purpose
Guarantee implementation correctness and prevent regressions by writing automated verification logic before production code. It enforces the "Iron Law": NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.

## Protocol (Red-Green-Refactor)

### Step 1: RED (Write Failing Test)
Write one minimal test showing what *should* happen.
- **Requirements**: One behavior, clear name, real code (avoid mocks).
- **Verify**: Run `npm test`. Confirm it fails for the expected reason (feature missing).

### Step 2: GREEN (Minimal Code)
Write the simplest code possible to pass the test.
- **Rule**: Do not add features, refactor other code, or "improve" beyond the test.
- **Verify**: Run `npm run lint:fix` then `npm test`. Confirm it passes and breaks nothing else.

### Step 3: REFACTOR
Clean up the implementation while keeping tests green. Improve names, remove duplication, and ensure architectural boundaries (Durable Execution) are respected.

## Contract-First MSW Testing (Boundary Integrity)
For all external integrations (Hub-Spoke boundaries), use **Mock Service Worker (MSW)**:
1.  **Network Capture**: Intercept actual HTTP calls.
2.  **Contract Verification**: Verify outgoing requests match expected schema.
3.  **No Implementation Leaks**: Tests should not know *how* the service works internally.

## Rules
- **Delete means Delete**: If you wrote code before the test, delete it and start over.
- **Test-First forces Discovery**: Discover edge cases before implementation.
- **No Shortcuts**: Pragmatic means test-first; shortcuts lead to production debugging.

## Synergies (Skill Integration)
- **+ `systematic-debugging`**: Use if you cannot make a test pass after 2-3 attempts.
- **+ `eval-suite-checklist`**: Use to ensure the test suite is coverage-complete.

## Exit Protocol
1.  **Verify**: Ensure the new test is in the permanent suite.
2.  **Reconcile Memory**: Move findings to `docs/logs/YYYY-MM-DD.md`.
3.  **Crystallization**: Promote high-value testing patterns to `docs/learnings.md`.
4.  **Handoff**: Chain next step via `activate_skill`.
