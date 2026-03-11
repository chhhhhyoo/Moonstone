# Ship

Verify, summarize vs SPEC, update logs, and propose ship.

## Workflow

### 1. Check Git Status
```bash
git status --porcelain
```

### 2. Run Verification
```bash
npm run verify
```
If verification fails, STOP and fix before proceeding.

### 3. Update Transparency Log
Finalize the active log in `docs/logs/` with verification results.

### 4. Summarize vs SPEC
Compare changes against master `SPEC.md` and relevant `specs/*.md`:
- Read the spec requirements
- Read the diff (`git diff main...HEAD`)
- Line-by-line checklist: does every spec requirement have a corresponding implementation?

### 5. Propose Ship
Use `AskUserQuestion` to present:
- Summary of what's shipping
- Verification status (all green?)
- Spec compliance (all requirements met?)
- Exact branch and target to push to

**Do NOT push without explicit user confirmation.**

## Rules

- **No shipping without green verification**
- **No shipping without spec comparison**
- **No pushing without user confirmation**

## Synergies (Command Integration)

- **+ `/verify-complete`**: Verification must pass first
- **+ `/finish-branch`**: Use after ship is approved
- **+ `/commit`**: Ensure all changes are committed before ship
- **+ `/self-review`**: Review before shipping

## Exit Protocol (Mandatory)

1. Verification results logged
2. Spec comparison documented
3. Reconcile findings to `docs/logs/YYYY-MM-DD.md`
4. Chain Next Step: `/finish-branch` if approved

$ARGUMENTS
