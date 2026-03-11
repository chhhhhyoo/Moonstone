---
name: brainstorming
description: "Design & Intent discovery. Trigger when user says 'brainstorm', 'design a feature', or 'help me with an idea'. Uses Prothesis for multi-perspective design."
---
# brainstorming

## Purpose
Transform vague intents or complex problems into validated designs and specs through natural collaborative dialogue and multi-perspective analysis. It serves as the creative funnel that feeds into structured implementation.

## Protocol

### Step 1: Intent Clarification (Hermeneia)
If the user's idea is vague, activate `hermeneia` (via `clarify`). Use Socratic questioning to help the user articulate their true intent before any design work begins.

### Step 2: Multi-Perspective Research (Prothesis)
Before proposing a design, look at the problem from multiple angles grounded in evidence.
1.  **Action**: Activate `prothesis`.
2.  **Gather Context**: Files, docs, and web searches.
3.  **Perspectives**: Present 2-4 distinct epistemic perspectives (e.g., "Security First", "Enterprise Scalability").
4.  **Inquiry**: Delegate to isolated sub-agents via `dispatching-parallel-agents` to ensure epistemic integrity.
5.  **Synthesis**: Create a **Lens L** from findings.

### Step 3: Understanding & Refining
Ask questions **one at a time** based on the synthesized perspectives. Focus on purpose, constraints, and success criteria.

### Step 4: The "Strawman" Proposal
Propose a rough, imperfect concept based on the chosen perspectives to provoke a reaction and refine requirements.

### Step 5: Presenting the Design
Present the design in sections (200-300 words). After each section, pause to ask if it looks right so far.

## Rules
- **Interactive Pause**: You MUST stop generation after presenting perspective options or design sections.
- **Epistemic Integrity**: Never analyze perspectives yourself; always delegate to sub-agents.
- **Traceability**: All insights must be captured in `findings.md`.

## Synergies (Skill Integration)
- **+ `dev-scan`**: Provides a "Reality Check" on brainstormed ideas.
- **+ `tech-decision`**: Resolves "A vs B" conflicts during the design phase.
- **+ `writing-plans`**: The natural next step once a design is approved.

## Exit Protocol
1.  **Documentation**: Write the validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`.
2.  **ADR**: If an architectural choice was made, log it in `docs/decisions/`.
3.  **Implementation Prep**: Activate `writing-plans` to make the design actionable.
4.  **Durable Logs**: Update `docs/logs/YYYY-MM-DD.md` and `docs/learnings.md`.
