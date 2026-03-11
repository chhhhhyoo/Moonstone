---
name: verify-complete
description: Use before claiming any task complete, tests passed, or verification done. Evidence before claims — prevents false success. Must run actual verification commands.
user-invocable: true
allowed-tools: Read, Bash, Glob, Grep
---

# Verification Before Completion

Use when about to claim work is complete, fixed, or passing — before committing or creating PRs. Evidence before assertions, always.

**Core principle:** Claiming work is complete without verification is dishonesty, not efficiency.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete) via Bash
3. LINT: Run `npm run lint:fix` to ensure code quality
4. READ: Full output, check exit code, count failures
5. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
6. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | Test passes once |
| Agent completed | VCS diff shows changes | Agent reports "success" |
| Requirements met | Line-by-line checklist | Tests passing |

## Red Flags — STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!")
- About to commit/push/PR without verification
- Trusting agent success reports without independent check
- Relying on partial verification
- Thinking "just this once"
- **ANY wording implying success without having run verification**

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "I'm confident" | Confidence ≠ evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter ≠ compiler |
| "Agent said success" | Verify independently |
| "Partial check is enough" | Partial proves nothing |

## Key Patterns

**Tests:**
```
CORRECT: [Run test command] [See: 34/34 pass] "All tests pass"
WRONG:   "Should pass now" / "Looks correct"
```

**Regression tests (TDD Red-Green):**
```
CORRECT: Write → Run (pass) → Revert fix → Run (MUST FAIL) → Restore → Run (pass)
WRONG:   "I've written a regression test" (without red-green verification)
```

**Build:**
```
CORRECT: [Run build] [See: exit 0] "Build passes"
WRONG:   "Linter passed" (linter doesn't check compilation)
```

**Agent delegation:**
```
CORRECT: Agent reports success → Check VCS diff → Verify changes → Report actual state
WRONG:   Trust agent report blindly
```

## When to Apply

**ALWAYS before:**
- ANY variation of success/completion claims
- ANY expression of satisfaction about work state
- Committing, PR creation, task completion
- Moving to next task
- Delegating to agents

## Synergies (Command Integration)

`/verify-complete` is the truth gate:

- **+ `/commit`**: Verification must pass before committing
- **+ `/finish-branch`**: Must verify before finishing a branch
- **+ `/tdd`**: Complements TDD's red-green cycle with broader verification
- **+ `/subagent-dev`**: Verify after each subagent completes
- **+ `/ultrawork`**: Mechanical verification after every task

## Exit Protocol (Mandatory)

1. All verification commands must have been run with evidence
2. Reconcile findings to `docs/logs/YYYY-MM-DD.md`
3. Crystallize insights to `docs/learnings.md`
4. Update `task_plan.md`
5. Chain Next Step: Recommend the next appropriate `/command`

$ARGUMENTS
