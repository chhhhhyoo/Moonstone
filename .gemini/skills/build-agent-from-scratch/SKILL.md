---
name: build-agent-from-scratch
description: Use when the user wants to build a new agent, service, or feature from scratch. Orchestrates the flow from Spec -> Scaffolding -> Quality Gates.
---
# Build Agent From Scratch

## Workflow

### Phase 1: The Design Interview (Mandatory)
Do not just tell the user to "fill out the questionnaire." **You must interview them.**
1.  **Read** `assets/SPEC_QUESTIONNAIRE.md` to understand the required fields.
2.  **Ask** targeted questions to gather the content:
    *   "What is the single most important metric for this agent's success?"
    *   "What are the 'Anti-Goals'? (What should it explicitly NOT do?)"
3.  **Architectural Alignment**:
    *   **Hub-Spoke Integrity**: Ask "Does this agent need to interact with external systems?"
    *   **Provider-Proxy Pattern**: If yes, ensure the design uses a domain interface (`Provider`) and a separate protocol-only `Proxy`.
4.  **Conduct a Pre-Mortem:** Ask, "If this agent were to cause a disaster in the codebase, what would it look like?" (Use this to populate the Safety Policy).

### Phase 2: Scaffolding & Drafting
Once you have the answers:
1.  **Run Scaffolder:** `npm run spec:scaffold`
2.  **Draft the Spec:** Fill `SPEC.md` and subspecs using the interview data.
3.  **Self-Correction:** Before showing the user, compare your draft against `assets/SPEC_RUBRIC.md`.

### Phase 3: Quality Gates
Run the automated checks to ensure the spec is machine-readable and complete.
1.  **Lint:** `npm run spec:lint` (Checks for formatting, missing sections)
2.  **Validate:** `npm run spec:validate` (Checks for logic, schema compliance)
3.  **Fix & Iterate:** If errors occur, fix them immediately. Do not ask the user to fix JSON errors.

### Phase 4: User Sign-off
Present the final `SPEC.md` to the user.
*   "I have drafted the specification for [Agent Name]. It includes [Safety Rule X] to prevent [Disaster Y]. Does this align with your vision?"

## Synergies (Skill Integration)

`build-agent-from-scratch` is the "Factory" for new capabilities:

- **+ `writing-plans`**: Once the spec is approved, use `writing-plans` to break down the build into tasks.
- **+ `tech-decision`**: Use `tech-decision` during the Design Interview to select the right libraries for the new agent.
- **+ `eval-suite-checklist`**: Mandatory for defining the quality gates of the new agent.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
