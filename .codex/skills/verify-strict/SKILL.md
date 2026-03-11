---
name: verify-strict
description: Execute strict verification gate (`npm run verify:strict`) and stop on red with root-cause-first remediation guidance. Trigger on "verify strict" or "/verify_strict".
---

# verify-strict

Codex-native migration of Gemini `/verify_strict`.

## Purpose

Run full strict verification for runtime-grade confidence and fail closed on any drift in parity/index/scope/conformance gates.

## Protocol

### Step 1: Execute Strict Gate

Run:

```bash
npm run verify:strict
```

### Step 2: Fail-Fast Root Cause Discipline

If failure occurs:

1. Stop immediately.
2. Identify the first failing strict sub-gate.
3. Perform root-cause analysis before proposing fixes.
4. Recommend smallest remediation that restores policy compliance.

### Step 3: Report With Evidence

Include:

1. Command executed.
2. Pass/fail result.
3. Failing sub-gate and likely root cause (if failed).
4. Next required action.

No strict-pass claim without current-session evidence.

## Compatibility Mapping

Source strict command referenced legacy scripts:

1. `spec:guard`
2. `module:parity`
3. `moonstone:ssot:check`
4. `test:model`

Repo-native strict gate:

1. canonical `npm run verify:strict`
2. includes parity/index/scope/branch/strategy/conformance checks via maintained scripts

## Skill Synergy

1. With `ship`: use for runtime-scope ship readiness.
2. With `verification-before-completion`: strict evidence for high-stakes completion claims.
3. With `systematic-debugging`: required handoff after strict-gate failures.

## Exit Protocol

1. Record strict-gate evidence in `progress.md`.
2. Log strict failure risks and remediation in `docs/logs/YYYY-MM-DD.md`.
3. Promote durable strict-gate lessons to `docs/learnings.md`.
