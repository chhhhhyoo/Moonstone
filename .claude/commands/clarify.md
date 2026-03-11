# Clarify Requirements (Hermeneia Protocol)

Transform vague or ambiguous requirements into precise, actionable specifications through maieutic (Socratic) questioning. Use when the user asks to "clarify requirements", "refine requirements", or when a request is ambiguous and needs iterative questioning.

**Hermeneia** (ἑρμηνεία): A dialogical act of clarifying the gap between what the user intends and what they expressed, transforming recognized ambiguity into precise articulation.

## Protocol

### Phase 0: Trigger Recognition

Recognize user-initiated clarification requests:
- **Explicit**: "Clarify what I mean", "Help me articulate", "What do I mean"
- **Implicit**: User expresses doubt about their own phrasing
- **Rule**: Do NOT activate for AI-perceived ambiguity alone unless the user signals a desire for clarification

### Phase 1: Context Grounding

Before asking questions, search the codebase to resolve as many ambiguities as possible:
- Read `SPEC.md`, `package.json`, `findings.md`, relevant docs
- Use `Grep` and `Glob` to find related code and configuration
- Record findings in `findings.md`

### Phase 2: Maieutic Clarification (Socratic Style)

Use `AskUserQuestion` with **consequential framing** to help the user articulate their intent.

**Question Design Principles:**
- **Consequential Options**: Show what each choice means for execution
  - Each option: "[Interpretation] - if this, then [implication for your goal]"
- **Recognition over Recall**: Provide 2-4 specific choices (never open-ended)
- **Reflective Pause**: Always include a "Let me reconsider" option
- **Maieutic Framing**: Frame questions to guide discovery, not merely gather data

**Loop Structure:**

1. **Gap Selection**: Use `AskUserQuestion` to present the type of gap:

   | Category | Description | Question Form |
   |----------|-------------|---------------|
   | **Expression** | Incomplete articulation | "Did you mean X or Y? (Implication)" |
   | **Precision** | Ambiguous scope/degree | "How specifically: [Options]? (Implication)" |
   | **Coherence** | Internal contradiction | "X and Y are in tension. Which takes priority?" |
   | **Context** | Missing background | "What's the context for this? [Options]" |

2. **Present Options**: Use `AskUserQuestion` with 2-4 consequential options and STOP.
3. **Wait** for user response.
4. **Repeat** until intent is fully crystallized.

### Phase 3: Crystallization Summary

After clarification is complete, present the transformation:

```markdown
## Clarified Intent

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

Use `AskUserQuestion` to offer next steps:
- "Generate a formal SPEC.md from the clarified requirements"
- "Create a task_plan.md for implementation"
- "Proceed directly with implementation"
- "Need more clarification first"

If generating a spec, write to `specs/` or update existing `SPEC.md`. If creating a plan, use `EnterPlanMode`.

## Rules

1. **Articulation over Assumption**: Help the user express what they know; don't guess what they mean
2. **Interactive Pause**: You MUST use `AskUserQuestion` and wait for response. No tool calls until response.
3. **User Authority**: The user's choice is final
4. **Minimal Intervention**: Only surface gaps that materially affect execution
5. **Preserve Nuance**: Do not simplify complex trade-offs; present them as consequential choices

## Synergies (Command Integration)

`/clarify` is the first step in the "Epistemic Chain":

- **+ `/brainstorm`**: After clarification, brainstorming can explore the clarified design space
- **+ `/build-agent`**: Clarified requirements feed directly into the Design Interview
- **+ `/council`**: When clarification reveals a deep architectural question, summon the council

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract ADRs, patterns, root causes to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command` to invoke

$ARGUMENTS
