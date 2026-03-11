---
name: brainstorming
description: "Design & Intent discovery. Trigger when user says 'brainstorm', 'design a feature', or 'help me with an idea'. Uses Prothesis for multi-perspective design."
---

# Brainstorming Ideas Into Designs (Epistemic Edition)

## Overview

Help turn ideas into fully formed designs and specs through natural collaborative dialogue and multi-perspective analysis.

## The Process

### Step 1: Intent Clarification (Hermeneia)
If the user's idea is vague ("I want to build a tool"):
*   **Action:** Activate `hermeneia` (integrated in `clarify`).
*   **Goal:** Use Socratic questioning to help the user articulate their true intent before any design work.

### Step 2: Multi-Perspective Research (Prothesis)
Before proposing a design, you **MUST** look at the problem from multiple angles and ground it in evidence.
*   **Action:** Activate `prothesis`.
*   **Support Skills:**
    1.  **Tech Comparison**: If choosing between libraries or patterns, activate `tech-decision`.
    2.  **Community Pulse**: If user sentiment or "best of breed" is needed, activate `dev-scan`.
*   **Method:**
    1.  Gather context (files, docs, web search).
    2.  Present 2-4 distinct epistemic perspectives (e.g., "Security First", "Developer Experience", "Enterprise Scalability").
    3.  Delegate inquiry to isolated sub-agents via `dispatching-parallel-agents`.
    4.  Synthesize findings into a **Lens L**.

### Step 3: Understanding & Refining
*   Ask questions **one at a time** based on the synthesized perspectives.
*   Focus on purpose, constraints, and success criteria.

### Step 4: The "Strawman" Proposal
Propose a **"Strawman"** (a rough, imperfect concept) based on the chosen perspectives to provoke a reaction.

### Step 5: Presenting the Design
*   Present the design in sections (200-300 words).
*   Ask after each section whether it looks right so far.

## After the Design

**Documentation:**
- Write the validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`.
- **CRITICAL:** If an architectural choice was made, activate `knowledge-bridge` to `log_decision`.

**Implementation:**
- **MANDATORY:** Activate `using-git-worktrees` for isolation.
- Activate `writing-plans` to create a detailed implementation plan.

## Rules
- **Interactive Pause**: You MUST stop generation after presenting perspective options or design sections.
- **Epistemic Integrity**: Never analyze perspectives yourself; always delegate to sub-agents.
- **Traceability**: All insights must be captured in `findings.md`.

## Synergies (Skill Integration)

`brainstorming` acts as the creative funnel that feeds into structured skills:

- **+ `dev-scan`**: Provides the "Reality Check". Use it to validate if a brainstormed idea has community backing or known pitfalls.
- **+ `tech-decision`**: Resolves "A vs B" conflicts that arise during design (e.g., "Should we use Redis or Postgres for this?").
- **+ `writing-plans`**: The natural next step. Once a design is approved, use `writing-plans` to make it actionable.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
