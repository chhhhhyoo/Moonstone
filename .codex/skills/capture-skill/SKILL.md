---
name: capture-skill
description: Capture learnings, patterns, or workflows from the current conversation into a new or existing skill. Use when the user wants to save what was learned or after significant task completion.
---
# capture-skill

## Purpose
Evolve the agent's intelligence by extracting knowledge, successful patterns, and workflows from conversation and codifying them into durable, instructional guides.

## Protocol

### Phase 1: Identify Content
Review conversation for **Workflows** (steps that worked), **Domain Knowledge** (discovered facts), **Insights** ("Aha!" moments), **Patterns** (code/commands), and **Decision Rationale**. Summarize and confirm with user.

### Phase 2: Determine Scope & Name
- **Location**: Store in `.codex/skills/<skill-name>/`.
- **Naming**: kebab-case, action-oriented (e.g., `debug-k8s-pods`).
- **Check Existing**: Use `ls .codex/skills/` to see if an update is preferred over creation.

### Phase 3: Draft (The "Skillification")
Don't copy logs; create a clean guide.
1.  **Frontmatter**: `name` and `description` (triggers).
2.  **Instructions**: Step-by-step, imperative mood.
3.  **Examples**: Concrete code/command examples.
4.  **Templates**: Use `templates/SKILL_TEMPLATE.md` for ideal structure.
5.  **Batches**: Distill messy conversation into reuseable instructions (guidelines: extraction over failures, generalize, include "why", keep < 500 lines).

### Phase 4: Existing Skills
If updating, integrate new learnings without duplicating and preserve the existing voice/structure.

### Phase 5: Write and Verify
1. Create directory and write `SKILL.md`.
2. Run `npm run check:skills` to ensure the new skill is valid.

## Synergies (Skill Integration)
- **+ `reflexion`**: Identify patterns during reflexion, then use `capture-skill` to formalize.
- **+ `manage-skills`**: Audit and maintain the skill once captured.
- **+ `systematic-debugging`**: Capture diagnostic workflows immediately after a complex fix.

## Exit Protocol
1.  **Log**: Update `docs/logs/YYYY-MM-DD.md` with new skill details.
2.  **Learn**: Append insights to `docs/learnings.md`.
3.  **Catalog**: Update `notes/07-Gemini-Capabilities-Catalog.md` if a top-level capability was added.
4.  **Handoff**: Chain next step via `activate_skill`.
