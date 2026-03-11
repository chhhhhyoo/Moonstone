---
name: vault-reader
description: Use to strictly *read* Factory rules and Playbooks from Obsidian. For logging or global search, use `knowledge-bridge`.
---
# Vault Reader

Use this skill to fetch authoritative standards from the project notes before making architectural decisions.

## Knowledge Sources
- Playbooks: `notes/01-Workflow-Playbook.md`
- Standards: `notes/02-Spec-Writing-Guide.md`, `notes/03-Context-Engineering.md`, `notes/06-Skill-Design-Guide.md`
- Artifacts: `specs/*.md`

## Usage
1. Read the relevant guide from `notes/`.
2. Apply the "Rule of Clarity" (metrics over vague words).
3. Update the Transparency Log (`docs/logs/YYYY-MM-DD.md`) with the reference used.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
