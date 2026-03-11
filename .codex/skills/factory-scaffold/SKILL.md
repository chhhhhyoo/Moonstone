---
name: factory-scaffold
description: Scaffold a new local artifact spec and transparency run log before implementation. Trigger on "factory scaffold", "/factory_scaffold", or when creating a new tool/skill/agent.
---

# factory-scaffold

Codex-native migration of Gemini `/factory_scaffold`.

## Purpose

Create a bounded, failure-aware blueprint package for a new artifact before writing production code.

## Inputs

1. `artifact_name` (required): target artifact identifier.
2. `type` (required): `tool`, `skill`, or `agent`.

If either input is missing, stop and ask for it.

## Protocol

### Step 1: Read Local Standards (Remapped)

Source command referenced non-existent Obsidian files. Use these repo-native equivalents:

1. Workflow loop: `specs/02-workflows.md`
2. Spec requirements and validation: `specs/04-validation.md`
3. Tooling/skill boundaries: `specs/03-tooling-and-skills.md`
4. Memory and traceability rules: `specs/05-memory-and-documentation.md`

### Step 2: Create Artifact Spec Draft

Create `specs/<artifact_name>.md` (if absent) with at least:

```markdown
# <artifact_name>

## Type
- tool|skill|agent

## Problem
- [what gap this solves]

## Scope
- In:
- Out:

## Success Criteria
1. [measurable criterion]
2. [measurable criterion]

## Failure Modes
1. [failure]
2. [failure]

## Architecture Constraints (SSOT Compliance)
- [How this complies with Durable Execution (Pure Moonstone logic)?]
- [How this complies with Outbox/Inbox (Command/Receipt) pattern?]
- [performance/security/governance limits]

## Verification
- [required checks/commands]
```

If file exists, append a new dated section rather than overwriting.

### Step 3: Initialize Transparency Log

Create `notes/FACTORY_RUN_<id>.md` where `<id>` is next sequential 3-digit number.

Minimum template:

```markdown
# FACTORY RUN <id>

## Artifact
- Name: <artifact_name>
- Type: <type>

## Blueprint Summary
- [proposed structure]

## Boundedness Check
- Scope in/out documented: yes/no

## Failure-Awareness Check
- Failure modes captured: yes/no

## Open Questions
1. [question]
```

### Step 4: Blueprint Review Gate (Before Code)

Before any implementation:

1. Confirm scope is bounded (clear In/Out).
2. Confirm failure modes are explicit and testable.
3. Present blueprint summary to user and request acceptance.

Do not proceed to coding until blueprint is acknowledged.

## Enhancements Over Source Command

1. Replaces broken source references with existing repo documents.
2. Adds overwrite-safe behavior for existing spec files.
3. Enforces sequential transparency log IDs and explicit pre-code review gate.

## Skill Synergy

1. With `factory-init`: initialize planning files first when absent.
2. With `writing-plans`: translate approved blueprint into execution phases.
3. With `eval-suite-checklist`: validate that failure modes have test coverage.

## Exit Protocol

1. Record scaffold actions in `progress.md`.
2. Log material decisions in `docs/logs/YYYY-MM-DD.md`.
3. Promote durable artifact-factory lessons to `docs/learnings.md`.
