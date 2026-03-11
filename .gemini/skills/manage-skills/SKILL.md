---
name: manage-skills
description: The Librarian. Use this to audit existing skills, improve them based on quality checklists, or create new skills. Does NOT handle task execution or planning (use 'orchestrator' for that).
---

# Manage Skills

The Librarian for Gemini CLI.

## Purpose
To ensure the skill library (`.gemini/skills/`) is healthy, up-to-date, and high-quality. This skill manages the *artifacts*, not the *execution*.

## Workflow

### 1. Supervision (Quality Assurance)
**Use when:** "Audit skills", "Check skill quality", "Verify compliance".

1.  **Load the Rubric**:
    Read [references/skill-quality-checklist.md](references/skill-quality-checklist.md).
2.  **Inspect**:
    -   Read `SKILL.md`.
    -   Check directory structure.
3.  **Report**:
    -   Pass/Fail for each category.
    -   Recommendations for improvement.

### 2. Maintenance (The Fixer)
**Use when:** "Fix this skill", "Update dependencies", "Migrate legacy skill".

1.  **Scan**: Run `scripts/scan_skills.cjs` to see what's installed.
2.  **Edit**: Safely modify `SKILL.md` or scripts.
3.  **Validate**: Ensure syntax is correct.

### 3. Creation (The Builder)
**Use when:** "Create a new skill" (Delegate to `skill-creator`).

1.  **Delegate**: Call `skill-creator` to handle the scaffolding and initial implementation.
2.  **Review**: Once created, use the Supervision workflow to audit the new skill.

## Tools
- `scripts/scan_skills.cjs`: List all available skills and their locations.

## When to Use
- User asks: "What skills do I have?"
- User asks: "Audit my skills."
- User asks: "Update the TDD skill."
- User asks: "Create a skill for X" (Use in tandem with `skill-creator`).

## Synergies (Skill Integration)

`manage-skills` maintains the toolbelt:

- **+ `capture-skill`**: `capture-skill` creates the raw material; `manage-skills` polishes and organizes it.
- **+ `orchestrator`**: The Orchestrator relies on a healthy skill library to execute complex plans. `manage-skills` ensures that library is ready.
- **+ `skill-creator`**: The sub-agent specialized in writing the actual `SKILL.md` code.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
