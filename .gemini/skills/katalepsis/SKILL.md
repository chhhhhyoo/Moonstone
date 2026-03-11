---
name: katalepsis
description: Achieve certain comprehension after AI work. Transforms unknown knowns into known knowns through structured verification of AI-generated changes. Trigger when user asks "what did you do", "help me understand", "walk me through this".
user-invocable: true
---

# Katalepsis Protocol (Gemini Edition)

Achieve certain comprehension of AI work through structured verification, enabling the user to follow along and reach firm understanding.

## Definition

**Katalepsis** (κατάληψις): A dialogical act of achieving firm comprehension—transforming AI-generated results into verified user understanding through categorized entry points and progressive verification.

```
── FLOW ──
R → C → Sₑ → Tᵣ → P → Δ → Q → A → Tᵤ → P' → (loop until katalepsis)

── TYPES ──
R  = AI's result
C  = Categories
Sₑ = User-selected entry points
Tᵣ = Task registration (task_plan.md)
Q  = Verification question (Interactive Pause)
A  = User's answer
Tᵤ = Task update
```

## Tool Mapping (Claude → Gemini)

| Claude Tool | Gemini CLI Equivalent |
|-------------|-----------------------|
| `AskUserQuestion` | **Interactive Pause Pattern**: Output the question text (with options) and stop. Wait for user input. |
| `TaskCreate/Update` | **`planning-with-files`**: Record categories and comprehension status in `task_plan.md` under a "## Comprehension (Katalepsis)" section. |

## Core Principle

**Comprehension over Explanation**: AI verifies user's understanding rather than lecturing. The goal is confirmed comprehension.

## Mode Activation

### Activation

Command invocation (e.g., `/katalepsis`) or user request for explanation (e.g., "walk me through this") activates mode.

### Priority

<system-reminder>
When Katalepsis is active:

**Supersedes**: Default explanation patterns. Verification questions replace unsolicited explanations.

**Retained**: Safety boundaries, tool restrictions, user explicit instructions.

**Action**: At Phase 1 and Phase 3, use the **Interactive Pause Pattern** to guide selection and verification.
</system-reminder>

## Protocol

### Phase 1: Entry Point Selection

Analyze changes, then use **Interactive Pause** to let user select where to start.

```
### 🧠 Katalepsis: Entry Point
What would you like to understand first?

**Options:**
1. **[Category A]**: [Brief description].
2. **[Category B]**: [Brief description].
3. **All of the above**.
```

### Phase 2: Task Registration (via `planning-with-files`)

Register selected categories in `task_plan.md`.

```markdown
## Comprehension (Katalepsis)
- [ ] [Katalepsis] Category name (Rationale: ...)
```

### Phase 3: Comprehension Loop (Socratic Verification)

For each category, use **Interactive Pause** with **Socratic verification**. Ask rather than tell.

```
### 🧠 Katalepsis: Verification ([Category])
[Brief Overview]

**Verification Question:**
[Specific question about the logic/impact]

**Options:**
1. **"I get it"**: Move to next part.
2. **"Not quite"**: Explains further, then re-verify.
3. **"Show me the code"**: Highlights relevant lines, then re-verify.
```

## Rules

1. **User-initiated only**: Activate only when user signals desire to understand.
2. **Interactive Pause**: You MUST stop after presenting options. No tool calls until response.
3. **Verify, don't lecture**: Confirm understanding through questions, not explanations.
4. **Socratic Style**: Ask "What do you think this does?" instead of "This does X."
5. **Code Grounding**: Reference specific files and line numbers.
6. **Convergence**: Mode remains active until all selected tasks in `task_plan.md` are resolved.

## Synergies (Skill Integration)

`katalepsis` is the "Comprehension Layer" that closes the loop:

- **+ `orchestrator`**: The Orchestrator mandates `katalepsis` at the end of execution to ensure the user owns the result.
- **+ `writing-plans`**: `katalepsis` tasks are tracked in the `task_plan.md` created by `writing-plans`.
- **+ `reflexion`**: While `reflexion` extracts insights for the *system/memory*, `katalepsis` ensures understanding for the *user*.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
