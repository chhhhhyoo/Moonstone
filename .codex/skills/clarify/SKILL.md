---
name: clarify
description: Convert vague requirements into precise execution intent through structured, user-confirmed clarification loops. Trigger when user says "clarify", "/clarify", "refine requirements", or signals unclear intent.
---

# clarify

Codex-native replacement for Gemini `/clarify`. Use this as the entrypoint skill for requirement crystallization before planning or code changes.

## Purpose

Transform ambiguous requests into explicit intent with agreed scope, tradeoffs, and execution implications.

## Activation Triggers

1. User explicitly asks for clarification (`clarify`, `/clarify`, `refine requirements`, `make this clearer`).
2. User signals intent-expression mismatch (`I know what I want but cannot phrase it`, `this feels vague`).
3. High-stakes scope decisions are unresolved and could invalidate execution if guessed.
4. Do not trigger purely on assistant-perceived ambiguity for low-impact asks unless the user opts in.

## Protocol

### Phase 0: Original Capture

1. Quote the original requirement verbatim in session notes.
2. State why clarification is required (scope ambiguity, missing constraints, conflicting priorities).

### Phase 1: Context Grounding (Assistant-Owned)

1. Inspect repository context first (`SPEC.md`, relevant docs, related code) to eliminate avoidable questions.
2. Record concrete findings in `findings.md` when clarification materially changes implementation direction.
3. Do not ask the user for information already available in the repo.

### Phase 2: Clarification Loop (User-Confirmed)

1. Present a single ambiguity at a time.
2. Provide 2-4 consequential options (recognition over recall).
3. Include one reflective option (`Let me reconsider`) to avoid forced false precision.
4. Stop and wait for user answer before proceeding.
5. Repeat until scope, constraints, and acceptance criteria converge.

Question template:

```markdown
## Clarification Check
Ambiguity: [what is unclear]

1. [Option A] - implication on design/effort/risk
2. [Option B] - implication on design/effort/risk
3. Let me reconsider - pause to reframe intent
```

### Phase 3: Crystallization Output

Publish final intent in this structure:

```markdown
## Clarified Intent

### Before
"[original expression]"

### After
- Goal: [precise outcome]
- Scope In: [included]
- Scope Out: [excluded]
- Constraints: [non-negotiables]
- Acceptance: [objective completion signals]

### Decisions
| Ambiguity | Chosen Interpretation | Rationale |
|---|---|---|
| ... | ... | ... |
```

### Phase 4: Handoff

1. Offer immediate handoff to `writing-plans` or `orchestrator`.
2. If coding follows, ensure clarified acceptance criteria are reflected in plan/spec files.

## Ambiguity Categories

| Category | Description | Question Form |
|---|---|---|
| Expression | Incomplete articulation | "Did you mean X or Y? What should win?" |
| Precision | Ambiguous scope/degree | "How specific should this be: A/B/C?" |
| Coherence | Internal contradiction | "X and Y conflict. Which has priority?" |
| Context | Missing background assumptions | "Which context applies here?" |

## Rules

1. Articulation over assumption: never invent intent to accelerate execution.
2. Minimal questioning: ask only ambiguities that change implementation or risk.
3. Consequence transparency: every option must include downstream impact.
4. Interactive pause is mandatory after option presentation; wait for user response before tools or next step.
5. No execution before convergence on high-impact ambiguities.

## Skill Synergy

1. With `hermeneia`: use Hermeneia framing for intent-expression gap diagnosis.
2. With `orchestrator`: clarifies intent before multi-slice decomposition.
3. With `writing-plans`: crystallized intent becomes plan input contract.

## Exit Protocol

1. Reconcile material clarification outcomes from `findings.md` into `docs/logs/YYYY-MM-DD.md`.
2. Promote durable patterns to `docs/learnings.md`.
3. Update `task_plan.md` and `progress.md` when clarification changed active execution scope.
