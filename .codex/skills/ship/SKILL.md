---
name: ship
description: Prepare a change for shipping by running governance checks, summarizing spec parity, updating transparency logs, and proposing push/PR actions without executing them unless confirmed.
---

# ship

Codex-native migration of Gemini `/ship`.

## Purpose

Convert an implementation state into a ship-ready decision package with explicit verification evidence and governance alignment.

## Protocol

### Step 1: Working Tree And Scope Snapshot

1. Run `git status --porcelain` and summarize changed files.
2. Determine scope class from changed paths using `scripts/classify-verification-scope.mjs` (or equivalent file classification).
3. Fail closed: unknown paths are treated as `runtime`.

### Step 2: Verification Tier Selection

Select command by scope:

1. `runtime` scope: `npm run verify:strict`
2. `governance` or `docs_only` scope: `npm run verify` (or stricter if requested)

If selected command fails, stop ship flow and report blockers.

After selected command succeeds, run:

```bash
npm run check:verification-fresh
```

If freshness check fails, stop and re-run verification.

### Step 3: Transparency Log Update

1. Find active `notes/FACTORY_RUN_*.md` if present.
2. Append verification summary and ship recommendation.
3. If no active factory run log exists, state it explicitly and log in `docs/logs/YYYY-MM-DD.md`.

### Step 4: SPEC Parity & SSOT Summary

Compare delivered changes against:

1. `SPEC.md`
2. Relevant `specs/*.md` documents touched by this scope

Output:

1. Aligned requirements.
2. Deviations or unresolved deltas.
3. Required follow-up before merge (if any).
4. **SSOT Verification**: Confirm that `VISION.md` and `notes/07-Gemini-Capabilities-Catalog.md` accurately reflect any architectural shifts (e.g. Durable Execution, Outbox/Inbox) or newly added tools/skills introduced in this change. If out of sync, mandate updating them before shipping.

### Step 5: Ship Proposal (No Implicit Execution)

Provide exact proposed next commands but do not execute push/PR/merge without user confirmation.

Minimum proposal fields:

1. Current branch.
2. Target branch.
3. Verification command + result.
4. Recommended next command sequence.
5. Risks and rollback note.

## Rules

1. No ship recommendation without fresh verification evidence in current session.
2. No implicit `git push`, `gh pr create`, or merge.
3. Ship decision must mention branch/PR policy alignment (`docs/governance/pr-branch-policy.md`).

## Skill Synergy

1. With `run-local`: provide local evidence before ship gate.
2. With `verification-before-completion`: enforce evidence-before-assertion at release boundary.
3. With `doubt`: trigger when ship claims are challenged.

## Exit Protocol

1. Record ship-readiness status in `progress.md`.
2. Reconcile ship decisions and risks into `docs/logs/YYYY-MM-DD.md`.
3. Promote durable release-governance lessons to `docs/learnings.md`.
