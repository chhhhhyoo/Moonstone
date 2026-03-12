# PF-POC-005 TDD And Qualification Criteria

## Purpose

Define fail-closed, executable quality criteria for compiler feature work and enforce a recursive TDD workflow until milestone exit criteria are met.

## Qualification Gates (Must All Pass)

| gate_id | criterion | enforcement |
|---|---|---|
| QG-001 | Fixture corpus count and required scenario IDs satisfy quality minimum | `test/fixtures/poc/prompt-compile-quality-criteria.json` + `PromptCompiler.qualification.test.mjs` |
| QG-002 | Compile output is deterministic for fixed prompt/time across repeated runs | `PromptCompiler.qualification.test.mjs` |
| QG-003 | Branch mode coverage includes `default`, `exists`, `comparator` | `PromptCompiler.qualification.test.mjs` |
| QG-004 | Failure-branch and fallback-warning scenarios are represented | `PromptCompiler.qualification.test.mjs` |
| QG-005 | Required comparator pair coverage is present (`gt/lte`, `eq/ne`) | `PromptCompiler.qualification.test.mjs` |
| QG-006 | Full strict route is green with freshness guarantee | `npm run verify:strict` + `npm run check:verification-fresh` |

## TDD Entry Criteria (Before Code Change)

1. Add or update fixture(s) representing the target behavior gap.
2. Add/adjust tests so target behavior fails first (RED).
3. Confirm RED with targeted test command output.

## TDD Exit Criteria (Per Iteration)

1. Targeted tests GREEN.
2. Fixture qualification test GREEN.
3. Full strict verification GREEN.
4. Strategy/log/spec-impact evidence updated in same change set.

## Recursive Delivery Loop (Mandatory)

1. Pick highest-risk uncovered behavior from `POC-009` prompts.
2. Encode it as fixture + expectation (RED).
3. Implement minimal behavior change to pass (GREEN).
4. Refactor only after invariants stay green.
5. Run strict verification and freshness checks.
6. Update risk/action/plan logs.
7. Repeat until no uncovered behavior remains for current supported prompt contract.

## Stop Condition (Milestone Closure)

Close `PF-POC-005` only when:

1. `ACT-010` is `done`.
2. `POC-009` is `done`.
3. All qualification gates `QG-001..QG-006` pass on current HEAD.
