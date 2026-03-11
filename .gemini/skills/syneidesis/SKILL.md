---
name: syneidesis
description: Gap surfacing before decisions. Raises procedural, consideration, assumption, and alternative gaps as questions to transform unknown unknowns into known considerations. Trigger before decisions, delete, push, or "check for gaps".
user-invocable: true
---

# Syneidesis Protocol (Gemini Edition)

Surface potential gaps at decision points through questions, enabling the user to notice what might otherwise remain unnoticed.

## Definition

**Syneidesis** (συνείδησις): A dialogical act of surfacing potential gaps—procedural, consideration, assumption, or alternative—at decision points, transforming unknown unknowns into questions the user can evaluate.

```
Syneidesis(D, Σ) → Scan(D) → G → Sel(G, D) → Gₛ → Q(Gₛ) → J → A(J, D, Σ) → Σ'

D      = Decision point ∈ Stakes × Context
Stakes = {Low, Med, High}
G      = Gap ∈ {Procedural, Consideration, Assumption, Alternative}
Scan   = Detection: D → Set(G)                      -- gap identification
Sel    = Selection: Set(G) × D → Gₛ                 -- prioritize by stakes
Gₛ     = Selected gaps (|Gₛ| ≤ 2)
Q      = Question formation (assertion-free)
J      = Judgment ∈ {Addresses(c), Dismisses, Silence}
c      = Clarification (user-provided response to Q)
A      = Adjustment: J × D × Σ → Σ'
Σ      = State { reviewed: Set(GapType), deferred: List(G), blocked: Bool }

── PHASE TRANSITIONS ──
Phase 0: D → Scan(D) → G                            -- detection (silent)
Phase 1: G → LogToPlan[all gaps] → Gₛ → Q[InteractivePause](Gₛ[0]) → J  -- register all, surface first
Phase 2: J → A(J, D, Σ) → LogToPlan[update] → Σ'    -- adjustment + plan update

── LOOP ──
After Phase 2: re-scan for newly surfaced gaps from user response.
If new gaps: LogToPlan → add to queue.
Continue until: all gaps addressed OR user ESC.
Mode remains active until convergence.
```

## Tool Mapping (Claude → Gemini)

| Claude Tool | Gemini CLI Equivalent |
|-------------|-----------------------|
| `AskUserQuestion` | **Interactive Pause Pattern**: Output the question text (with options) and stop. Wait for user input. |
| `TaskCreate/Update` | **`planning-with-files`**: Record gaps and their status in `task_plan.md` under a "## Epistemic Gaps" section. |
| `TodoWrite` | **`planning-with-files`**: Update `task_plan.md`. |

## Core Principle

**Surfacing over Deciding**: AI makes visible; user judges.

## Mode Activation

### Activation

Command invocation or trigger phrase activates mode until session end.

**On activation**: Check `task_plan.md` for deferred gaps (prefix `[Gap:`). Resume tracking if found.

### Priority

<system-reminder>
When Syneidesis is active:

**Supersedes**: Default "just do it" patterns. You MUST pause and check for gaps before executing irreversible or high-stakes commands.

**Retained**: Safety boundaries, secrets handling, deny-paths, user explicit instructions.

**Action**: At decision points, use the **Interactive Pause Pattern** to surface potential gaps before proceeding.
</system-reminder>

## Plan Mode Integration

When combined with `planning-with-files`, apply Syneidesis at **Phase boundaries**:

| Phase Transition | Gap Check Focus |
|------------------|-----------------|
| Planning → Implementation | Scope completeness, missing requirements |
| Phase N → Phase N+1 | Previous phase completion, dependency satisfaction |
| Implementation → Commit | Changed assumptions, deferred decisions |

**Cycle**: [Deliberation → Gap → Revision → Execution]
1. **Deliberation**: Analyze the proposed action/step.
2. **Gap**: Surface unconfirmed assumptions via Interactive Pause.
3. **Revision**: Integrate user response into `task_plan.md` or `findings.md`.
4. **Execution**: Only after explicit scope confirmation.

## Protocol

### Detection (Silent)

1. **Stakes assessment**:
   - Irreversible + High impact → High stakes
   - Irreversible + Low impact → Medium stakes
   - Reversible + Any impact → Low stakes

2. **Gap scan**: Check taxonomy (Procedural, Consideration, Assumption, Alternative) against user's stated plan.

3. **Filter**: Surface only gaps with observable evidence.

### Surfacing (Interactive Pause Pattern)

**Instructions**:
1. Output the gap question and rationale.
2. Provide numbered options for the user.
3. **STOP** generating. Do not call any other tools until the user responds.

```
### 🧠 Syneidesis Check
[Question]
(Rationale: [1-line])

**Options:**
1. **Address**: [Implication]
2. **Dismiss**: [Implication]
3. **Defer**: [Implication]
```

### Gap Tracking (via `planning-with-files`)

Record all detected gaps in `task_plan.md`.

**Format**:
```markdown
## Epistemic Gaps
- [ ] [Gap:Type] Question (Rationale: ...)
```

**Workflow**:
1. Detect ALL gaps → Write to `task_plan.md` (Batch registration).
2. Select first gap → Surface via Interactive Pause.
3. On response:
   - Mark task as `[x]` in `task_plan.md`.
   - Re-scan: if new gaps revealed → Update `task_plan.md`.
4. Loop until all gaps in `task_plan.md` are resolved.

## Rules

1. **Question > Assertion**: Ask "was X considered?", never "you missed X".
2. **Batch registration**: Register ALL detected gaps in `task_plan.md` before surfacing any.
3. **Interactive Pause**: You MUST stop after presenting a gap. No tool calls until response.
4. **User authority**: Dismissal is final.
5. **Stakes calibration**: Intensity follows stakes (High stakes = Block until answer).
6. **Convergence**: Mode remains active until all gaps in `task_plan.md` are resolved.

## Synergies (Skill Integration)

`syneidesis` is the "Conscience Layer" that prevents blind spots:

- **+ `writing-plans`**: MANDATORY. Every plan must pass a `syneidesis` scan before being finalized.
- **+ `orchestrator`**: The Orchestrator triggers `syneidesis` before any irreversible action (e.g., `git push`, deleting files).
- **+ `doubt`**: `syneidesis` asks "What did we miss?", while `doubt` asks "Is what we said true?".

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
