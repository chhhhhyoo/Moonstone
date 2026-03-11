---
name: clarify
description: This skill should be used when the user asks to "clarify requirements", "refine requirements", "specify requirements", "what do I mean", "make this clearer", or when the user's request is ambiguous and needs iterative questioning to become actionable. Also trigger when user says "clarify", "/clarify", or mentions unclear/vague requirements.
---

# Clarify (Hermeneia Edition)

Transform vague or ambiguous requirements into precise, actionable specifications through maieutic (Socratic) questioning.

## Purpose

When requirements are unclear, incomplete, or open to multiple interpretations, use structured questioning to help the user "give birth" to their true intent (Hermeneia).

## Protocol

### Phase 0: Trigger Recognition (Hermeneia)
Recognize user-initiated clarification request:
- **Explicit**: "Clarify what I mean", "Help me articulate".
- **Implicit**: User expresses doubt about their own phrasing.
- **Rule**: Do not activate for AI-perceived ambiguity alone unless the user signals a desire for clarification.

### Phase 1: Context Grounding
Before asking questions, search the codebase (e.g., `package.json`, `SPEC.md`, `findings.md`) to resolve as many ambiguities as possible yourself. Record your findings in `findings.md`.

### Phase 2: Maieutic Clarification (Socratic Style)
Use the **Interactive Pause Pattern** with **consequential framing** to help the user articulate their intent.

**Question Design Principles (Hermeneia):**
- **Consequential Options**: Show what each choice means for execution.
    - *Example*: "Option A: [Interpretation] — if this, then [implication for your goal]."
- **Recognition over Recall**: Provide 2-4 specific choices.
- **Reflective Pause**: Always include an option like "Let me reconsider" to encourage deeper thought.
- **Maieutic Framing**: Frame questions to guide discovery, not merely gather data.

**Loop Structure:**
1.  **Gap Selection**: Present the type of gap (Expression, Precision, Coherence, Context) and let the user select.
2.  **Interactive Pause**: Present 2-4 consequential options and STOP generation.
3.  **Wait** for user response.
4.  **Repeat** until intent is fully crystallized.

### Phase 3: Crystallization Summary
After clarification is complete, present the transformation:

```markdown
## 💎 Clarified Intent (Hermeneia)

### Before (Original Expression)
"{original request verbatim}"

### After (Crystallized Intent)
- **Goal**: [Precise description]
- **Scope**: [Included/Excluded]
- **Implications**: [Downstream effects agreed upon]

**Decisions Made**:
| Ambiguity | Chosen Interpretation | Rationale |
|-----------|-----------------------|-----------|
| [Gap 1]   | [Option X]            | [Implication] |
```

### Phase 4: Spec/Plan Generation
Offer to generate a formal `SPEC.md` or a `task_plan.md` based on the crystallized intent.

## Ambiguity Categories (Hermeneia)

| Category | Description | Question Form |
|----------|-------------|---------------|
| **Expression** | Incomplete articulation | "Did you mean X or Y? (Implication)" |
| **Precision** | Ambiguous scope/degree | "How specifically: [Options]? (Implication)" |
| **Coherence** | Internal contradiction | "X and Y are in tension. Which takes priority?" |
| **Context** | Missing background | "What's the context for this? [Options]" |

## Rules

1. **Articulation over Assumption**: Help the user express what they know; don't guess what they mean.
2. **Interactive Pause**: You MUST stop after presenting options. No tool calls until response.
3. **User Authority**: The user's choice is final.
4. **Minimal Intervention**: Only surface gaps that materially affect execution.
5. **Preserve Nuance**: Do not simplify complex trade-offs; present them as consequential choices.

## Synergies (Skill Integration)

`clarify` is the first step in the "Epistemic Chain":

- **+ `hermeneia`**: `clarify` IS the implementation of the Hermeneia protocol.
- **+ `orchestrator`**: The Orchestrator requires `clarify` to be completed before any planning begins.
- **+ `writing-plans`**: The output of `clarify` (Crystallized Intent) is the primary input for `writing-plans`.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
