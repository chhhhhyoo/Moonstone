---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output.
---
# verification-before-completion

## Purpose
Eliminate the risk of "hallucinated success" by mandating empirical evidence (command output, test results) before any claim of completion is accepted. It enforces the "Iron Law": NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.

## Protocol (The Gate Function)

### Step 1: Identify Command
Determine which command (`npm test`, `npm run verify`, etc.) proves the claim.

### Step 2: Execute & Lint
1.  **Run**: Execute the FULL, fresh command.
2.  **Lint**: Run `npm run lint:fix` to ensure code quality.

### Step 3: Read & Verify
Read full output, check exit codes, and count failures.
- **Fail**: State actual status with evidence.
- **Pass**: State claim WITH evidence.

### Step 4: Freshness Check
Run `npm run check:verification-fresh` to ensure checks were performed on the current HEAD.

## Red Flags
- Using "should", "probably", "seems to".
- Expressing satisfaction before verification ("Done!", "Perfect!").
- Trusting agent success reports without independent verification.

## Synergies (Skill Integration)
- **+ `run-local`**: Provide local evidence before the ship gate.
- **+ `doubt`**: Trigger when claims are challenged or uncertainty is high.

## Exit Protocol
1.  **Evidence**: Record verification results in `progress.md`.
2.  **Log**: Update completion milestone in `docs/logs/YYYY-MM-DD.md`.
3.  **Learn**: Promote durable gate-failure patterns to `docs/learnings.md`.
4.  **Handoff**: Chain next step via `activate_skill`.
