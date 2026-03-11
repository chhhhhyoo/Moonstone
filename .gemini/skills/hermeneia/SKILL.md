---
name: hermeneia
description: Clarify intent-expression gaps. Transforms known unknowns into known knowns when what you mean differs from what you said. Trigger when user says "what do I mean", "clarify", "not sure how to phrase", "help me articulate".
user-invocable: true
---

# Hermeneia Protocol (Gemini Edition)

Transform known unknowns into known knowns by clarifying intent-expression gaps through user-initiated dialogue, enabling precise articulation before action proceeds.

## Definition

**Hermeneia** (ἑρμηνεία): A dialogical act of clarifying the gap between what the user intends and what they expressed, transforming recognized ambiguity into precise articulation through structured questioning.

```
── FLOW ──
E → Eᵥ → Gₛ → Q → A → Î' → (loop until converge)

── TYPES ──
E  = User's expression (the prompt to clarify)
Eᵥ = Verified expression
Gₛ = User-selected gap type ∈ {Expression, Precision, Coherence, Context}
Q  = Clarification question (Interactive Pause)
A  = User's answer
Î  = Inferred intent
Î' = Updated intent after clarification

── PHASE TRANSITIONS ──
Phase 0:  E → recognize(E) → trigger?                    -- trigger recognition
Phase 1a: E → Q[InteractivePause](E) → Eᵥ                -- E confirmation
Phase 1b: Eᵥ → Q[InteractivePause](gap_types) → Gₛ       -- gap type selection
Phase 2:  Gₛ → Q[InteractivePause](Gₛ) → await → A       -- clarification
Phase 3:  A → integrate(A, Î) → Î'                       -- intent update
```

## Tool Mapping (Claude → Gemini)

| Claude Tool | Gemini CLI Equivalent |
|-------------|-----------------------|
| `AskUserQuestion` | **Interactive Pause Pattern**: Output the question text (with options) and stop. Wait for user input. |
| `TaskCreate/Update` | **`planning-with-files`**: If tracking complex clarifications, use `task_plan.md`. |

## Core Principle

**Articulation over Assumption**: AI helps user express what they already know but struggle to articulate.

## Mode Activation

### Activation

Command invocation (e.g., `/hermeneia`) or trigger phrase (e.g., "clarify what I mean") activates mode until clarification completes.

### Priority

<system-reminder>
When Hermeneia is active:

**Supersedes**: Direct action patterns. Clarification MUST complete before any tool execution (shell commands, file writes) or code changes.

**Retained**: Safety boundaries, tool restrictions, user explicit instructions.

**Action**: Use the **Interactive Pause Pattern** to present clarification options.
</system-reminder>

## Protocol

### Phase 1a: Expression Confirmation

Use **Interactive Pause** to confirm which expression to clarify.

```
### 🔍 Hermeneia: Expression Confirmation
Which expression would you like to clarify?

**Options:**
1. **"[Original Prompt]"** — Clarify my last message.
2. **Specify Different** — Let me describe what I want to clarify.
```

### Phase 1b: Gap Type Selection

Use **Interactive Pause** to let user select the gap type. **Do NOT auto-diagnose.**

```
### 🔍 Hermeneia: Gap Selection
What kind of difficulty are you experiencing with this expression?

**Options:**
1. **Expression** — I couldn't fully articulate what I meant.
2. **Precision** — The scope or degree is unclear.
3. **Coherence** — There may be internal contradictions.
4. **Context** — Background information is missing.
```

### Phase 2: Clarification (Socratic Style)

Use **Interactive Pause** with **consequential framing**. Show the downstream effects of each choice.

```
### 🔍 Hermeneia: Clarification
[Gap Description]

**Options:**
1. **[Option A]**: [Interpretation] — if this, then [implication for your goal].
2. **[Option B]**: [Interpretation] — if this, then [implication for your goal].
3. **"Let me reconsider"**: Take time to reflect on the underlying intent.
```

## Rules

1. **User-initiated only**: Activate only when user signals awareness of ambiguity.
2. **Interactive Pause**: You MUST stop after presenting options. No tool calls until response.
3. **Maieutic over Informational**: Frame questions to guide discovery, not merely gather data.
4. **Recognition over Recall**: Present options, don't ask open questions.
5. **User authority**: User's choice is final.
6. **Convergence**: Mode remains active until intent is fully clarified.

## Synergies (Skill Integration)

`hermeneia` is the "Intent Layer" of the epistemic stack:

- **+ `clarify`**: `hermeneia` is the theoretical protocol that `clarify` implements.
- **+ `orchestrator`**: The Orchestrator enforces `hermeneia` as the first step of any complex task.
- **+ `prothesis`**: Once intent is clear (Hermeneia), we move to perspective selection (Prothesis).

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
