---
name: writing-plans
description: Implementation specs. Trigger after brainstorming, Use when you have a spec or requirements for a multi-step task, before touching code. Uses Syneidesis for gap detection.
---
# writing-plans

## Purpose
Produce high-integrity, actionable implementation plans that minimize architectural drift and ensure alignment with the SSOT (`VISION.md`/`SPEC.md`). It converts high-level intent into bite-sized, verifiable execution slices.

## Protocol

### Phase 1: Requirement Anchoring
1.  Read `VISION.md` and `SPEC.md` to establish architectural boundaries.
2.  Consult `docs/decisions/` to avoid re-litigating past choices.
3.  **Decision Rationale**: Explicitly list outcomes from `tech-decision` or `dev-scan` to justify the path.

### Phase 2: Plan Drafting
1.  **Standard Structure**: Header (Goal, Architecture, Tech Stack) + Tasks.
2.  **Tasks**: Bite-sized (2-5 mins), TDD-focused, include exact file paths and commands.
3.  **Verification**: Define exact commands for each slice.

### Phase 3: Gap Detection (Syneidesis)
Before finalization:
1.  **Action**: Activate `syneidesis`.
2.  **Method**: Scan tasks for Procedural, Consideration, Assumption, or Alternative gaps.
3.  **Interactive Pause**: Surface cognitive blind spots to the user.

### Phase 4: Risk Assessment
Identify failure modes (e.g., Dual-Write risks) and propose concrete mitigations.

## Execution Handoff
Offer two choices:
1.  **Subagent-Driven**: Fresh sub-agents per task (via `subagent-driven-development`).
2.  **Parallel Session**: New session in worktree using `executing-plans`.

## Rules
- **TDD First**: Every task MUST include a failing test step.
- **Interactive Pause**: Stop after presenting gaps or the final plan.

## Synergies (Skill Integration)
- **+ `syneidesis`**: MANDATORY gap check before finalization.
- **+ `tech-decision`**: Provides the rationale for major technical choices.
- **+ `executing-plans`**: The consumer of the resulting plan.

## Exit Protocol
1.  **Save**: Save to `docs/plans/YYYY-MM-DD-<feature-name>.md`.
2.  **Log**: Update `docs/logs/YYYY-MM-DD.md`.
3.  **Learn**: Promote planning lessons to `docs/learnings.md`.
4.  **Handoff**: Chain next step via `activate_skill`.
