---
name: factory-init
description: Initialize planning memory files (`task_plan.md`, `findings.md`, `progress.md`) for complex work. Trigger when user asks for "factory init", "/factory_init", or to bootstrap external memory.
---

# factory-init

Codex-native migration of Gemini `/factory_init`.

## Purpose

Bootstrap external working memory before complex execution begins.

## Activation Triggers

1. User invokes `/factory_init`, `factory init`, or asks to initialize planning files.
2. Task scope is complex enough to require persistent plan/findings/progress tracking.

## Protocol

### Step 1: Preflight Safety

1. Check whether `task_plan.md`, `findings.md`, `progress.md` already exist.
2. If files exist and contain meaningful content, do not overwrite blindly.
3. If overwrite is required, require explicit user confirmation or append-preserving merge.

### Step 2: Initialize Planning Files

Create missing files at project root with these minimum sections.

`task_plan.md`

```markdown
# Task Plan

## Goal
- [one-sentence target outcome]

## Scope
- In: [explicitly included]
- Out: [explicitly excluded]

## Steps
1. [step]
2. [step]

## Risks
- [risk + mitigation]
```

`findings.md`

```markdown
# Findings

## YYYY-MM-DD
1. [evidence-backed discovery]
2. [assumption or open question]
```

`progress.md`

```markdown
# Progress

## YYYY-MM-DD
1. [action completed]
2. [verification run + result]
```

### Step 3: Memory Preflight Reminder (Mandatory)

Always remind the user to review:

1. `docs/learnings.md`
2. `docs/decisions/`

If either path is missing, report it and continue with explicit risk note.

### Step 4: Activation Confirmation

End with this exact sentence for compatibility:

`Factory initialized. External memory is active.`

## Enhancements Over Source Command

1. Adds overwrite safety guard for existing planning files.
2. Enforces explicit scope and risk capture in initialized plan template.
3. Handles missing `docs/decisions/` or `docs/learnings.md` with clear diagnostics.

## Skill Synergy

1. With `planning-with-files`: use immediately after initialization for ongoing updates.
2. With `writing-plans`: convert initialized skeleton into decision-complete execution plan.
3. With `orchestrator`: use initialized files as execution-control surface.

## Exit Protocol

1. Record initialization action in `progress.md`.
2. Reconcile material setup findings into `docs/logs/YYYY-MM-DD.md`.
3. Promote durable setup lessons into `docs/learnings.md` when new patterns emerge.
