---
name: build-agent
description: Use when designing and scaffolding a new agent, service, or feature from scratch. Full flow from spec design interview through scaffolding and quality gates to implementation handoff.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, Edit, Agent, AskUserQuestion, TaskCreate
---

# Build Agent From Scratch

Use when the user wants to build a new agent, service, or feature from scratch. Orchestrates the full flow from Spec -> Scaffolding -> Quality Gates -> Implementation Handoff.

**Prerequisite**: `docs/TECHNICAL_HANDBOOK.md` must exist. If it doesn't, inform the user and help create one first.

## Workflow

### Phase 1: The Design Interview (Mandatory)

Do NOT just present the questionnaire. You must **actively interview** the user using `AskUserQuestion`.

#### Spec Planning Questionnaire (Internal Reference)

> **Source**: `.claude/references/build-agent/spec-questionnaire.md`

These are the required fields to gather. Use them to drive the conversation:

1. **Why**: What user pain changes after ship?
2. **Non-goals**: What is explicitly out of scope?
3. **Hard part**: Riskiest unknown (tests focus here)
4. **Critical journey**: Step-by-step including failure points
5. **Success metrics**: What numbers prove it works?
6. **Failure behavior**: Bad input, timeouts, partial failures

#### Interview Approach

Ask targeted questions using `AskUserQuestion`:

1. Start with the "Why": "What is the single most important metric for this agent's success?"
2. Probe Anti-Goals: "What should this agent explicitly NOT do?"
3. **Architectural Alignment**:
   - **Hub-Spoke Integrity**: "Does this agent need to interact with external systems?"
   - **Provider-Proxy Pattern**: If yes, ensure the design uses a domain interface (`Provider`) and a separate protocol-only `Proxy`
4. **Pre-Mortem**: "If this agent were to cause a disaster in the codebase, what would it look like?" (Populates the Safety Policy)
5. Probe failure modes: "What happens on bad input? Timeouts? Partial failures?"

### Phase 2: Scaffolding & Drafting

Once you have the interview answers:

1. **Run Scaffolder**:
   ```bash
   npm run spec:scaffold
   ```
   This creates:
   - `specs/01-architecture.md`
   - `specs/02-workflows.md`
   - `specs/03-tooling.md`
   - `specs/04-validation.md`
   - `tests/conformance/` directory

2. **Draft the Spec**: Fill `SPEC.md` and subspecs using the interview data. The spec must include:
   - YAML frontmatter with `specVersion: 1.0.0`
   - Required sections: `## Vision`, `## Goals`, `## Non-goals`, `## Success criteria`, `## Extended TOC`, `## Decision log`

3. **Self-Correction**: Before showing the user, evaluate the draft against the Quality Rubric at `.claude/references/build-agent/spec-rubric.md`:
   - [ ] **Concrete**: Metrics over vibes
   - [ ] **Bounded**: Non-goals exist and are specific
   - [ ] **Connected**: Subspecs reference each other
   - [ ] **Testable**: Success criteria map directly to tests
   - [ ] **Failure-aware**: Happy path + failure paths + security considered

### Phase 3: Quality Gates

Run automated checks to ensure the spec is machine-readable and complete:

1. **Lint** (checks formatting, missing sections, placeholder text — see `.claude/scripts/lint-spec.ts`):
   ```bash
   npm run spec:lint
   ```

2. **Validate** (checks structure, required sections, schema compliance — see `.claude/scripts/validate-spec.ts`):
   ```bash
   npm run spec:validate
   ```

3. **Fix & Iterate**: If errors occur, fix them immediately. Do NOT ask the user to fix JSON/formatting errors - that's your job.

### Phase 4: User Sign-off

Present the final `SPEC.md` to the user with a summary:

"I have drafted the specification for [Agent Name]. It includes [Safety Rule X] to prevent [Disaster Y]. Key design decisions: [list]. Does this align with your vision?"

Use `AskUserQuestion`:
- "Approve and proceed to implementation planning"
- "Revise specific sections" (then ask which)
- "Start over with different approach"

### Phase 5: Implementation Handoff

After approval:

1. **Log the Decision**: Create an ADR in `docs/decisions/YYYY-MM-DD-<agent-name>-design.md`
2. **Create Implementation Plan**: Use `EnterPlanMode` to design the implementation strategy
3. **Create Tasks**: Use `TaskCreate` for each implementation phase
4. **Recommend Next Steps**: Suggest `/verify` after implementation, `/council` for architecture review

## Synergies (Command Integration)

`/build-agent` is the "Factory" for new capabilities:

- **+ `/brainstorm`**: Use before `/build-agent` when the idea is still vague and needs design exploration
- **+ `/council`**: Summon during the Design Interview to get multi-perspective input on architecture choices
- **+ `/verify`**: Run after implementation to validate against the spec
- **+ `/clarify`**: If requirements are ambiguous during the interview, invoke the Hermeneia protocol

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract ADRs, patterns, root causes to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command` to invoke

$ARGUMENTS
