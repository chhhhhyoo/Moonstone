---
name: doubt
description: Emergency re-validation mode for suspected errors. Trigger when user says "!rv", "!verify", "are you sure?", or challenges factual correctness.
---

# doubt

Codex-native migration of Gemini `/doubt` and `!rv` protocol.

## Purpose

Force a hard reality check on prior claims before continuing execution.

## Activation Triggers

1. User explicitly invokes `!rv`, `!verify`, `doubt`, or `/doubt`.
2. User challenges factual accuracy (`are you sure`, `that file does not exist`, `show proof`).
3. Assistant detects a high-risk claim made without direct evidence.

## Protocol

### Step 1: Pause And Enter Verification Mode

State that you are stopping forward progress and re-validating prior claims.

### Step 2: Enumerate Claims

List the concrete claims that must be checked:

1. File existence or paths.
2. Config/dependency assumptions.
3. API/behavior claims.
4. Test or verification status claims.

### Step 3: Re-Verify Each Claim With Fresh Evidence

1. Use tool-backed checks for every claim (`rg`, `ls`, `cat`, targeted test commands).
2. Do not rely on memory from previous messages.
3. If evidence cannot be obtained, label the claim as unverified.

### Step 4: Publish Verification Verdict

Use this output format:

```markdown
## Verification Results

- Confirmed: [claim + evidence]
- False: [claim + correction]
- Unverified: [claim + why still unknown]
```

### Step 5: Correct And Rebound

1. Replace invalid assumptions with verified facts.
2. Update plan/implementation steps accordingly.
3. Resume only after the corrected path is explicit.

## Rules

1. Evidence over confidence.
2. Every disputed claim gets a concrete check.
3. Admit uncertainty explicitly; never mask it with speculation.
4. If verification fails, roll back to the last confirmed state.

## Skill Synergy

1. With `orchestrator`: use when orchestration depends on questionable assumptions.
2. With `syneidesis`: `syneidesis` finds missing considerations; `doubt` verifies stated claims.
3. With `verification-before-completion`: run `doubt` on any completion statement challenged by user or evidence gaps.

## Exit Protocol

1. Reconcile material findings into `docs/logs/YYYY-MM-DD.md`.
2. Add durable anti-hallucination lessons to `docs/learnings.md`.
3. Update `task_plan.md` and `progress.md` when corrections change scope.
