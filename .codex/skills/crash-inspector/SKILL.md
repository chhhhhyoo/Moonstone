---
name: crash-inspector
description: First-responder incident capture for repeated failures, loops, or user-cancelled hangs, with explicit handoff to the right repair skill.
---

# crash-inspector

Codex-native migration of Gemini `crash-inspector`.

## Purpose

Document failure state with enough evidence to prevent blind retries, then route repair to the correct specialist skill.

## Activation Triggers

1. User says "stop" or cancels a long-running command/tool due to hang behavior.
2. The same command/tool fails 2+ times without a changed hypothesis.
3. The session is looping (repeating analysis without new evidence or concrete action).
4. User explicitly asks to document a failure or produce a crash report.

## Protocol

### Phase 1: Secure The Scene (Mandatory Documentation)

1. Write immediately to `findings.md` using this structure:

```markdown
## Crash Report: [YYYY-MM-DD HH:MM]
- Operation: [what was attempted]
- Failure: [error text / timeout / hang / user cancel]
- Context: [recent edits, env, command, affected files]
- Hypothesis: [most likely cause, confidence level]
- Impact: [what is blocked]
- Next Investigator: [systematic-debugging | orchestrator | brainstorming | other]
```

2. Capture concrete artifacts when available (exit codes, stack traces, relevant log paths, failing command).
3. Stop repeating the same failing command until a new hypothesis is formed.

### Phase 2: Analyze Flight Data (Focused Triage)

1. Inspect local evidence first (logs, source, recent diffs) with targeted file/command reads.
2. If failure may be process/environmental, collect minimal state evidence (`ps`, `lsof`, lock/status files) without destructive actions.
3. Classify failure type:
   - code or test defect
   - planning/sequence defect
   - missing capability/design gap
   - environment/permission/tooling issue

### Phase 3: Assign Investigator (Handoff, Not Heroics)

1. Choose the next skill by failure class:
   - code/test defect -> `systematic-debugging`
   - planning/sequence defect -> `orchestrator`
   - missing capability/design gap -> `brainstorming`
2. Write handoff contract in `task_plan.md` or `progress.md` (owner, target outcome, first validation command).
3. Emit explicit handoff line:
   - `Crash report saved to findings.md. Delegating to <skill-name> for repair.`

## Rules

1. Do not "fix while documenting" except small evidence-preserving actions.
2. Do not run identical retries after two failures without recording a new hypothesis.
3. Keep each incident report timestamped and scoped to one failed operation.
4. Escalate uncertainty explicitly; do not hide unknowns.

## Skill Synergy

1. With `systematic-debugging`: primary repair path for code and test failures.
2. With `orchestrator`: redirects failures caused by bad sequencing, scope, or plan structure.
3. With `reflexion`: promotes incident-level lessons into durable anti-repeat guidance.

## Exit Protocol

1. Reconcile incident findings into `docs/logs/YYYY-MM-DD.md`.
2. Promote durable root-cause prevention patterns into `docs/learnings.md`.
3. Update `task_plan.md` and `progress.md` with incident closure or next-step handoff.
