---
name: vault
description: Use before making architectural decisions to read authoritative project standards, playbooks, and specs. Standards over preferences — read before deciding.
user-invocable: true
allowed-tools: Read, Glob, Grep
---

# Vault Reader

Use to read authoritative project standards and playbooks from notes before making architectural decisions. For logging or global search, use `/bridge`.

## Knowledge Sources

> **Index**: See `.claude/references/vault-index.md` for the complete catalog of available references.

- Playbooks: `notes/01-Workflow-Playbook.md`
- Standards: `notes/02-Spec-Writing-Guide.md`, `notes/03-Context-Engineering.md`, `notes/06-Skill-Design-Guide.md`
- Artifacts: `specs/*.md`

## Workflow

1. **Read** the relevant guide from `notes/` using `Read` tool
2. **Apply** the "Rule of Clarity" (metrics over vague words)
3. **Log** the reference used to `docs/logs/YYYY-MM-DD.md`

## When to Use

- Before making architectural decisions — check standards first
- When writing specs — reference the Spec Writing Guide
- When designing workflows — reference the Workflow Playbook
- When uncertain about project conventions — read before guessing

## Rules

- **Read before deciding**: Never make architectural choices without checking standards
- **Cite your source**: Log which document informed your decision
- **Standards over preferences**: If a standard exists, follow it

## Synergies (Command Integration)

- **+ `/bridge`**: For logging, global search, and knowledge management (vault is read-only)
- **+ `/write-plan`**: Read standards before writing implementation plans
- **+ `/tech-decide`**: Consult standards as part of decision analysis

## Exit Protocol (Mandatory)

1. Reconcile findings to `docs/logs/YYYY-MM-DD.md`
2. Crystallize insights to `docs/learnings.md`
3. Update `task_plan.md`
4. Chain Next Step: Recommend the next appropriate `/command`

$ARGUMENTS
