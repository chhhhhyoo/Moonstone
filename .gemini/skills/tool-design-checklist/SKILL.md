---
name: tool-design-checklist
description: Use when designing or modifying tool definitions. Ensures tools are token-efficient, type-safe, and have explicit intents.
---
# Tool Design Checklist

## Workflow
1) Read: `assets/DESIGN_PRINCIPLES.md`
2) Draft tool JSON
3) Validate: `npm run tool:validate <path>`

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
