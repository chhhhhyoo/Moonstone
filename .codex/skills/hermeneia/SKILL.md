---
name: hermeneia
description: Clarify intent-expression gaps. Transforms known unknowns into known knowns when what you mean differs from what you said. Trigger when user says "what do I mean", "clarify", "not sure how to phrase", "help me articulate".
user-invocable: true
---
# hermeneia

## Purpose
Resolve intent-expression gaps before implementation by forcing structured, user-driven clarification loops.

## Protocol

### Phase 1a: Expression Confirmation

Use interactive pause to confirm exactly what expression should be clarified.

Template:

```markdown
## Hermeneia: Expression Confirmation
Which expression should we clarify?

1. "[Original Prompt]"
2. Specify a different expression
```

### Phase 1b: Gap Type Selection

User must choose ambiguity category. Do not auto-diagnose.

Categories:
1. Expression: user could not fully articulate intent.
2. Precision: scope/degree is unclear.
3. Coherence: internal contradiction exists.
4. Context: missing background or assumptions.

### Phase 2: Clarification (Consequential Framing)

Use interactive pause with consequential options.

Template:

```markdown
## Hermeneia: Clarification
[Gap description]

1. [Option A] - If chosen, implication is [...]
2. [Option B] - If chosen, implication is [...]
3. Let me reconsider
```

Stop after options. Wait for user response before any tool call.

### Phase 3: Formalize Intent

Once converged, publish refined intent and handoff target (`clarify`, `writing-plans`, or `orchestrator`).

Minimum output:
1. Original expression.
2. Clarified intent.
3. Chosen interpretation rationale.
4. Next skill handoff.

## Rules

1. User-initiated only: activate when user signals ambiguity awareness.
2. Articulation over assumption: do not invent intent.
3. Interactive pause is mandatory: no tool calls until response.
4. Recognition over recall: provide options instead of broad open-ended prompts.
5. User authority: chosen interpretation is final unless user revises it.
6. Convergence required: do not transition to implementation while core ambiguity remains.

## Synergies (Skill Integration)

1. With `clarify`: hermeneia provides the intent-theory layer.
2. With `orchestrator`: use before slicing complex work.
3. With `prothesis`: use after intent is clear to compare strategic options.

## Exit Protocol

1. Record clarified intent outcomes in `findings.md`.
2. Reconcile durable clarification decisions into `docs/logs/YYYY-MM-DD.md`.
3. Promote reusable clarification patterns to `docs/learnings.md`.
4. Update `task_plan.md` and `progress.md` when clarification changes execution scope.
