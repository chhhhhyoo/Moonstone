# Verify

Run spec lint/validate + conformance lint/run + Moonstone SSOT check. Stop on red.

## Workflow

Run each step sequentially. **Stop on first failure.**

### 1. Spec Lint
```bash
npm run spec:lint
```

### 2. Spec Validate
```bash
npm run spec:validate
```

### 3. Conformance Lint
```bash
npm run conformance:lint
```

### 4. Conformance Run
```bash
npm run conformance
```

### 5. Moonstone SSOT Check
```bash
npm run moonstone:ssot:check
```

## On Failure

If anything fails:
1. **STOP** — do not continue to next step
2. Read the error output carefully
3. Propose the **minimal fix** mapped to the relevant SPEC section
4. Use `/debug` if root cause is unclear

## Report Format

```
Verification Report:
- Spec Lint:        [PASS/FAIL]
- Spec Validate:    [PASS/FAIL]
- Conformance Lint: [PASS/FAIL]
- Conformance Run:  [PASS/FAIL]
- Moonstone SSOT Check:   [PASS/FAIL]

Overall: [ALL GREEN / BLOCKED at step N]
```

## Synergies (Command Integration)

- **+ `/verify-strict`**: For full strict verification gate
- **+ `/ship`**: Verify before shipping
- **+ `/commit`**: Verify before committing
- **+ `/self-review`**: Include verification in review

$ARGUMENTS
