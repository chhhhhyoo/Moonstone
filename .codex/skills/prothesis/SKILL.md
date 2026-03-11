---
name: prothesis
description: Lens for multi-perspective analysis. Select viewpoints before analysis to transform unknown unknowns into known unknowns. Trigger for comparison, deep analysis, expert opinion, or "which perspective".
user-invocable: true
---
# prothesis

## Purpose
Transform unknown unknowns into known unknowns by explicitly placing available epistemic perspectives before the user. This ensures lens selection occurs prior to any analysis, enabling a more objective and comprehensive inquiry.

## Protocol

### Phase 1: Prothesis (Perspective Placement)
Gather context (files, docs, web searches), then use **Interactive Pause** to present perspectives. **Do NOT analyze yet.**
- **Output Format**: List 3-5 perspectives with a 1-line analytical contribution for each. Ask: "Which lens(es) would you like to use?"

### Phase 2: Inquiry (Isolated Sub-agents)
For each selected perspective, activate **`dispatching-parallel-agents`**.
- **Requirement**: You MUST NOT analyze the perspectives yourself in the main conversation. Delegate to isolated sub-agents to ensure epistemic integrity and prevent context contamination.
- **Prompt for Sub-agent**:verbatim original question + requests for Epistemic Contribution, Framework Analysis, Horizon Limits, and Assessment.

### Phase 3: Synthesis (Horizon Integration)
After sub-agents return results, synthesize into:
1.  **Perspective Summaries**: Direct assessment from each lens.
2.  **Convergence**: Shared horizon items.
3.  **Divergence**: Horizon conflicts.
4.  **Integrated Assessment**: Attributed synthesis.

### Phase 4: Sufficiency Check
Use **Interactive Pause** to confirm analysis sufficiency. Options: 1. Sufficient, 2. Add Perspective, 3. Refine Existing.

## Rules
- **Interactive Pause**: Stop after presenting options. No tool calls until response.
- **Epistemic Integrity**: Delegation to isolated sub-agents is mandatory. Self-analysis is a violation.
- **Synthesis Constraint**: Integration only combines what perspectives provided; no new analysis.

## Synergies (Skill Integration)
- **+ `dispatching-parallel-agents`**: MANDATORY for Phase 2 cross-contamination prevention.
- **+ `brainstorming`**: Provides the diverse viewpoints that fuel the brainstorming process.
- **+ `tech-decision`**: Compares philosophies (e.g., "Pragmatism" vs "Purity") rather than just technologies.

## Exit Protocol
1.  **Memory**: Move findings to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallization**: Extract ADRs and insights to `docs/learnings.md`.
3.  **Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Handoff**: Chain next step via `activate_skill`.
