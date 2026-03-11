---
name: verify
description: Execute the standard project verification gate (`npm run verify`) and report fail-fast diagnostics with minimal-fix guidance. Trigger on "verify" or "/verify".
---

# verify

Codex-native migration of Gemini `/verify`.

## Purpose

Run the canonical non-strict verification gate and stop immediately on failures with focused remediation guidance.

## Protocol

### Step 1: Run Standard Verification Gate

Execute:

```bash
npm run verify
```

### Step 2: Fail-Fast Handling

If any sub-check fails:

1. Stop execution immediately.
2. Identify the first failing command.
3. Propose minimal fix options mapped to relevant canonical docs (`SPEC.md`, `specs/*.md`, governance docs).

### Step 3: Evidence-Backed Result

Report:

1. Command executed.
2. Pass/fail outcome.
3. First failing gate (if any).
4. Recommended next action.

No success claim without current-session command evidence.

## Compatibility Mapping

Source command expected old scripts:

1. `spec:lint`
2. `spec:validate`
3. `conformance:lint`
4. `conformance`
5. `moonstone:ssot:check`

Repo-native equivalent:

1. unified stage-0 gate via `npm run verify`
2. targeted follow-up checks via scripts included in that pipeline

## Skill Synergy

1. With `verification-before-completion`: use as concrete command execution step.
2. With `doubt`: rerun when verification claims are challenged.
3. With `systematic-debugging`: hand off after recurring gate failures.

## Exit Protocol

1. Record verification evidence in `progress.md`.
2. Log material failures/risks in `docs/logs/YYYY-MM-DD.md`.
3. Promote durable gate-failure patterns into `docs/learnings.md`.
