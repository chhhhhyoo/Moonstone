---
name: orchestrator
description: The Runtime Executive. Analyzes complex requests, designs execution strategies (Pitfalls vs Benefits), allocates tasks to specialized skills/agents, and manages the execution flow using Epistemic Protocols.
---
# orchestrator

## Purpose
To transform high-level user requests into actionable, verified, and well-understood results. It manages the "Known/Unknown" state of the session by enforcing a rigorous precedence chain of Epistemic Protocols (Hermeneia, Prothesis, Syneidesis, Katalepsis).

## Protocol (The Epistemic Precedence Chain)

### Step 1: Intent Clarification (Hermeneia)
If the request is ambiguous or underspecified:
- **Action**: Activate `hermeneia`.
- **Rule**: No planning or execution until intent is clarified via the **Interactive Pause Pattern**.

### Step 2: Strategy & Perspective Analysis (Prothesis)
- **Strategy Selection**: If choosing between technical directions, activate `tech-decision`.
- **Perspective Selection**: If the inquiry is "open-world," activate `prothesis`.
- **Synthesis**: Merge findings into a coherent "Big Picture". List **Pitfalls vs Benefits** for each proposed approach. Delegate perspective analysis to isolated sub-agents via `dispatching-parallel-agents`.

### Step 3: Task Allocation & Gap Detection (Syneidesis)
- **Planning**: Use `writing-plans` or `planning-with-files` to map strategy to `task_plan.md`.
- **Gap Scan**: Before execution, activate `syneidesis`. Log gaps (Procedural, Consideration, Assumption, Alternative) to `task_plan.md` and surface via **Interactive Pause**.

### Step 4: Execution Management
Oversee the task sequence:
- **Allocation**: Assign steps to specialized skills (e.g., `test-driven-development`).
- **Monitoring**: Check outputs and course-correct if agents get stuck.
- **Context Integrity**: Ensure findings and plans are preserved across agent boundaries.

### Step 5: Post-Execution Verification (Katalepsis)
After significant changes:
- **Action**: Activate `katalepsis`.
- **Goal**: Confirmed comprehension ("Grasping firmly") via a Socratic verification loop.

## Rules
- **Interactive Pause**: You MUST stop generation after presenting choices or gaps.
- **Recognition over Recall**: Always present options rather than asking open questions.
- **Epistemic Integrity**: Never perform multi-perspective analysis yourself; use sub-agents.
- **Cumulative Memory**: Strictly follow the flow: `findings.md` -> `docs/logs/` -> `docs/learnings.md`.

## Synergies (Skill Integration)
- **+ `writing-plans`**: Convert the strategy into a detailed `task_plan.md`.
- **+ `systematic-debugging`**: Deployed when the execution phase encounters failures.
- **+ `katalepsis`**: Mandatory verification of user comprehension at the end of a milestone.

## Exit Protocol
1.  **Memory**: Move findings to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallization**: Extract ADRs, patterns, and root causes to `docs/learnings.md`.
3.  **Update Documentation**: Mark tasks complete in `task_plan.md` and `progress.md`.
4.  **Handoff**: Chain next step via `activate_skill`.
