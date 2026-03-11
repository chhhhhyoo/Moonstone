---
name: build-agent-from-scratch
description: Orchestrate the end-to-end creation of a new agent, service, or feature. Trigger when building a new capability from scratch.
---
# build-agent-from-scratch

## Purpose
Guide the systematic creation of a new artifact (agent, service, tool) from conceptual vision to production-ready implementation. It enforces architectural consistency (Provider-Proxy, Hub-Spoke) and strict quality gate compliance.

## Protocol

### Phase 1: The Design Interview (Mandatory)
Do not just prompt for a questionnaire; interview the user.
1.  **Metric**: Identify the single most important metric for success.
2.  **Anti-Goals**: Explicitly define what the agent should NOT do.
3.  **Architectural Alignment**: Use the **Provider-Proxy Pattern** for external interactions (domain interface + protocol proxy).
4.  **Pre-Mortem**: Populate the Safety Policy by asking "If this caused a disaster, what would it look like?"

### Phase 2: Scaffolding & Drafting
1.  **Run Scaffolder**: `npm run spec:scaffold` (or use `factory-scaffold`).
2.  **Draft the Spec**: Fill `SPEC.md` and subspecs using interview data.
3.  **Self-Correction**: Compare draft against `assets/SPEC_RUBRIC.md` before user sign-off.

### Phase 3: Quality Gates
1.  **Lint**: `npm run spec:lint` (formatting, missing sections).
2.  **Validate**: `npm run spec:validate` (logic, schema compliance).
3.  **Fix**: Address errors immediately without asking the user to fix JSON/structure errors.

### Phase 4: User Sign-off
Present the final `SPEC.md` and confirm alignment with the user's vision and safety requirements.

## Synergies (Skill Integration)
- **+ `writing-plans`**: Convert the approved spec into tasks.
- **+ `tech-decision`**: Select the right libraries during the design interview.
- **+ `eval-suite-checklist`**: Mandatory for defining the agent's quality gates.

## Exit Protocol
1.  **Memory**: Move findings to `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallization**: Promote ADRs and architectural lessons to `docs/learnings.md`.
3.  **Documentation**: Mark tasks complete in `task_plan.md` and `progress.md`.
4.  **Handoff**: Chain to the next appropriate expert via `activate_skill`.
