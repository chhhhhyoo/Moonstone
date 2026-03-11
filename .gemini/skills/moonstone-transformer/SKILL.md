---
name: moonstone-transformer
description: Automates the transformation of Stately.ai (XState) JSON definitions into executable TypeScript code, Zod schemas, and model-driven tests.
---

# Moonstone Transformer Skill (v1.0.0)

## Overview
Automates the transformation of Stately.ai (XState) JSON definitions into executable TypeScript code, Zod schemas, and model-driven tests.

## Workflow
1.  **Ingest**: Read Moonstone JSON from `specs/models/`.
2.  **Scaffold**:
    -   Generate `[AgentName].machine.ts` (XState Machine definition).
    -   Generate `[AgentName].schema.ts` (Zod validation for each transition).
    -   Generate `[AgentName].service.ts` (Business logic placeholders for actions).
3.  **Wire**: Register the new Agent to `AgentFactory` and `CyanResolver`.
4.  **Test**: Generate `simplePath` traversal tests via `fast-check`.

## Rules
-   **No Overwrite**: Do not overwrite existing business logic in `.service.ts` files.
-   **Strict Typing**: Every transition `event.data` MUST have a corresponding Zod schema.
-   **Traceability**: Link every generated file back to the Source Moonstone ID.

## Synergies (Skill Integration)

`moonstone-transformer` bridges the gap between model and code:

- **+ `writing-plans`**: The output of `moonstone-transformer` (scaffolded files) is often the starting point for a plan's implementation phase.
- **+ `test-driven-development`**: `moonstone-transformer` generates the initial test files; TDD fills them with logic.
- **+ `eval-suite-checklist`**: Use the checklist to ensure the generated Moonstone covers all necessary failure modes.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.