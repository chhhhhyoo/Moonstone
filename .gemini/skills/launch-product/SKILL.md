---
name: launch-product
description: End-to-end factory workflow. Takes a high-level vision and orchestrates the entire Epistemic Protocol suite.
---

# Product Launch Factory (Epistemic Edition)

## Purpose
To turn a raw high-level vision into a fully implemented, tested, and verified product/feature. This skill orchestrates the entire factory pipeline using the Epistemic Protocol precedence chain.

## The Pipeline

### Phase 1: Refinement (Hermeneia & Prothesis)
**Goal:** Turn "Idea" into "Blueprint" with multi-perspective validation.
1.  **Activate `brainstorming` (integrated with Hermeneia & Prothesis).**
    *   Clarify intent through Socratic questioning.
    *   Select and analyze 2-4 epistemic lenses.
    *   Synthesize findings into a "Product Vision" or "Feature Spec".
2.  **Create Artifacts.**
    *   Create/Update `VISION.md` or `specs/XX-feature-name.md`.
    *   Log any architectural decisions via `knowledge-bridge`.

### Phase 2: Planning (Syneidesis)
**Goal:** Turn "Blueprint" into a "Gap-Proof Task List".
1.  **Scaffold Planning Files**: Use `/factory_init` to create `task_plan.md`, etc.
2-1.  **Activate `planning-with-files` skill.**
    *   Populate `task_plan.md` with a granular breakdown of the Spec from Phase 1.
    *   Ensure the plan includes:
        *   Setup/Scaffold tasks.
        *   Implementation tasks (grouped by slice).
        *   Verification tasks (TDD + Conformance).
        *   Final "Ship" gate.
        
2-2.  **Activate `writing-plans` (integrated with Syneidesis).**
    *   Break down the Spec into granular tasks.
    *   **CRITICAL:** Perform a Syneidesis gap check before finalizing the task list.

### Phase 3: Execution & Verification (Katalepsis & Reflexion)
**Goal:** Turn "Task List" into "Shipped Code & Crystallized Knowledge".
1.  **Activate `orchestrator`.**
    *   Execute the plan item-by-item.
    *   **Verify Completion**: Run `npm run verify` after every major slice.
2.  **Verify Comprehension**: Activate `katalepsis` after implementation to ensure the user understands the changes.
3.  **Crystallize Knowledge**: Activate `reflexion` (via `/wrap`) to extract and save insights to `docs/learnings.md`.

## Rules
- **Full Chain Enforcement**: Never skip a protocol stage.
- **Interactive Pause**: Always stop for user judgment at decision points.
- **Traceability**: Every phase must update `progress.md` and `findings.md`.

## Usage Guide
*   **Trigger:** "I have a new idea...", "Launch a new product...", "Build X from scratch..."
*   **Input:** A high-level vision string (e.g., "A CLI tool to track stock prices").
*   **Output:** A completed, verified feature in the codebase.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
