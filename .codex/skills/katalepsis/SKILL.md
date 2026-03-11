---
name: katalepsis
description: Verify user comprehension of AI-generated work through structured entry-point selection and Socratic confirmation loops.
user-invocable: true
---

# katalepsis

Codex-native migration of Gemini `katalepsis`.

## Purpose

Convert "I saw the changes" into verified user understanding through interactive, category-based comprehension checks.

## Protocol

### Phase 1: Entry-Point Selection

1. Analyze changed scope at a high level (architecture, behavior, tests, docs).
2. Present category options via interactive pause.

Template:

```markdown
## Katalepsis: Entry Point
What would you like to understand first?

1. [Category A] - [brief description]
2. [Category B] - [brief description]
3. All of the above
```

### Phase 2: Comprehension Task Registration

1. Register selected categories in `task_plan.md` under:

```markdown
## Comprehension (Katalepsis)
- [ ] [Katalepsis] <Category> (Rationale: ...)
```

2. Keep each category as an explicit checkbox until comprehension is confirmed.

### Phase 3: Socratic Verification Loop

For each selected category:
1. Give concise context.
2. Ask a verification question instead of giving full lecture first.
3. Offer explicit options:
   - I get it
   - Not quite
   - Show me the code
4. If "show me the code," ground explanation in concrete file references.
5. Repeat until user confirms understanding.

### Phase 4: Convergence

1. Mark category complete only after user-confirmed understanding.
2. Summarize what the user now understands and any open follow-ups.

## Rules

1. User-initiated only (explain/walk-through/comprehension requests).
2. Interactive pause is mandatory after option prompts.
3. Verify understanding; do not monologue by default.
4. Use concrete code references for grounding when requested.
5. Keep mode active until selected comprehension tasks converge.

## Skill Synergy

1. With `orchestrator`: post-execution comprehension closure for complex changes.
2. With `writing-plans`: tracks comprehension tasks in the same plan surface.
3. With `reflexion`: complements system learning by ensuring user-side understanding.
4. With `wrap`: run katalepsis before final wrap when user comprehension is uncertain.

## Exit Protocol

1. Record resolved comprehension categories in `task_plan.md` and `progress.md`.
2. Reconcile material comprehension insights to `docs/logs/YYYY-MM-DD.md`.
3. Promote durable explanation/verification patterns to `docs/learnings.md`.
