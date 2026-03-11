---
name: prothesis
description: Lens for multi-perspective analysis. Select viewpoints before analysis to transform unknown unknowns into known unknowns. Trigger for comparison, deep analysis, expert opinion, or "which perspective".
user-invocable: true
---

# Prothesis Protocol (Gemini Edition)

Transform unknown unknowns into known unknowns by placing available epistemic perspectives before the user, enabling lens selection prior to any perspective-requiring cognition.

## Definition

**Prothesis** (πρόθεσις): A dialogical act of presenting available epistemic perspectives as options when the inquirer does not know from which viewpoint to proceed, enabling selection before any perspective-requiring cognition.

```
Prothesis(U) → G(U) → C → {P₁...Pₙ}(C) → S → Pₛ → ∥I(Pₛ) → R → Syn(R) → L

U      = Underspecified request
G      = Gather: Context acquisition
C      = Context
{P₁...Pₙ}(C) = Perspectives (n ≥ 2)
S      = Selection: Interactive Pause
Pₛ     = Selected perspectives
∥I     = Parallel inquiry: dispatching-parallel-agents
R      = Set(Result)
Syn    = Synthesis: Internal operation
L      = Lens { convergence, divergence, assessment }
```

## Tool Mapping (Claude → Gemini)

| Claude Tool | Gemini CLI Equivalent |
|-------------|-----------------------|
| `AskUserQuestion` | **Interactive Pause Pattern**: Output the question text (with options) and stop. Wait for user input. |
| `Task` (Sub-agent) | **`dispatching-parallel-agents`**: You MUST use this skill to spawn isolated agents for each selected perspective. |
| `TaskCreate/Update` | **`planning-with-files`**: Use `task_plan.md` to track perspective inquiry progress. |

## Core Principle

**Recognition over Recall**: Choosing from options (recognition) is easier than filling in blanks (recall).

## Mode Activation

### Activation

Command invocation (e.g., `/prothesis`) or detection of open-world inquiry (e.g., "What should I do?") activates mode.

### Priority

<system-reminder>
When Prothesis is active:

**Supersedes**: Immediate analysis patterns. Perspective Selection MUST complete before analysis begins.

**Retained**: Safety boundaries, tool restrictions, user explicit instructions.

**Action**: Before analysis, use the **Interactive Pause Pattern** to present perspective options.
</system-reminder>

## Protocol

### Phase 1: Prothesis (Perspective Placement)

Gather context, then use **Interactive Pause** to present perspectives. **Do NOT analyze yet.**

```
### 🔭 Prothesis: Perspective Selection
Available epistemic perspectives for this inquiry:

1. **[Perspective A]**: [Analytical Contribution - 1 line].
2. **[Perspective B]**: [Analytical Contribution - 1 line].
3. **[Perspective C]**: [Analytical Contribution - 1 line].

**Which lens(es) would you like to use?**
(Select by number or name)
```

### Phase 2: Inquiry (Isolated Sub-agents)

For each selected perspective, activate **`dispatching-parallel-agents`**. 

**Isolated Context Requirement**: You MUST NOT analyze the perspectives yourself in the main conversation. You MUST delegate to sub-agents to ensure epistemic integrity and prevent context contamination.

**Prompt for Sub-agent**:
```
You are a **[Perspective] Expert**.
Analyze from this epistemic standpoint:
**Question**: [Original question verbatim]

Provide:
1. **Epistemic Contribution**: What this lens uniquely reveals.
2. **Framework Analysis**: Domain-specific concepts and reasoning.
3. **Horizon Limits**: What this perspective cannot see.
4. **Assessment**: Direct answer from this viewpoint.
```

### Phase 3: Synthesis (Horizon Integration)

After sub-agents return results, synthesize the findings:

```markdown
## 🔬 Prothesis Synthesis

### Perspective Summaries
[Summary of each sub-agent's assessment]

### Convergence (Shared Horizon)
[Where they agree]

### Divergence (Horizon Conflicts)
[Where they disagree]

### Integrated Assessment
[Synthesized answer with attribution]
```

### Phase 4: Sufficiency Check

Use **Interactive Pause** to confirm analysis sufficiency.

```
### 🔬 Prothesis: Sufficiency Check
Is this analysis sufficient for your inquiry?

**Options:**
1. **Sufficient** — Proceed with this understanding.
2. **Add Perspective** — Explore additional viewpoints.
3. **Refine Existing** — Revisit one of the analyzed perspectives.
```

## Rules

1. **Interactive Pause**: You MUST stop after presenting options. No tool calls until response.
2. **Epistemic Integrity**: You MUST delegate perspective analysis to isolated sub-agents via `dispatching-parallel-agents`. Self-analysis is a protocol violation.
3. **Synthesis Constraint**: Integration only combines what perspectives provided; no new analysis.
4. **Verbatim Transmission**: Pass the original question unchanged to each sub-agent.
5. **Convergence**: Mode loops until user confirms sufficiency or ESC.

## Synergies (Skill Integration)

`prothesis` is the "Perspective Layer" for multi-lens analysis:

- **+ `dispatching-parallel-agents`**: MANDATORY. `prothesis` relies on this skill to simulate multiple perspectives concurrently without cross-contamination.
- **+ `brainstorming`**: `prothesis` provides the diverse viewpoints that fuel the brainstorming process.
- **+ `tech-decision`**: While `tech-decision` compares *technologies*, `prothesis` compares *philosophies* (e.g., "Move Fast" vs "Be Secure").

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
