---
name: verify-strict
description: Use for the strictest verification gate with zero tolerance. Full suite plus additional checks for high-stakes operations like merges or releases.
user-invocable: true
allowed-tools: Read, Bash, Glob, Grep
---

# Verify Strict

Run full strict verification gate (verify + guard + parity + ssot + model). Stop on red.

## Workflow

Run each step sequentially. **Stop on first failure.**

### 1. Basic Verify
```bash
npm run verify
```

### 2. Spec Guard
```bash
npm run spec:guard
```

### 3. Module Parity
```bash
npm run module:parity
```

### 4. Moonstone SSOT Check
```bash
npm run moonstone:ssot:check
```

### 5. Model Tests
```bash
npm run test:model
```

## On Failure

If anything fails:
1. **STOP** — do not continue to next step
2. Read the error output carefully
3. Perform **root cause analysis** before proposing fixes (use `/debug` if needed)
4. No guessing — understand the failure first

## Report Format

```
Strict Verification Report:
- Basic Verify:     [PASS/FAIL]
- Spec Guard:       [PASS/FAIL]
- Module Parity:    [PASS/FAIL]
- Moonstone SSOT Check:   [PASS/FAIL]
- Model Tests:      [PASS/FAIL]

Overall: [ALL GREEN / BLOCKED at step N]
```

## Synergies (Command Integration)

- **+ `/verify`**: Basic verification subset
- **+ `/ship`**: Strict verify before shipping critical changes
- **+ `/debug`**: Root cause analysis on failures

$ARGUMENTS
