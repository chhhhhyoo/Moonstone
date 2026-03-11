---
name: launch
description: Use when a product or feature is ready for launch. 3-phase launch pipeline with verification, stakeholder communication, and deployment coordination.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Agent, Write, AskUserQuestion
---

# Product Launch Factory

End-to-end factory workflow. Takes a high-level vision and orchestrates the entire Epistemic Protocol suite from idea to shipped, verified product.

**Trigger**: "I have a new idea...", "Launch a new product...", "Build X from scratch..."

## The Pipeline

### Phase 1: Refinement (Hermeneia & Prothesis)

**Goal**: Turn "Idea" into "Blueprint" with multi-perspective validation.

1. **Invoke `/brainstorm`** (integrates Hermeneia & Prothesis protocols):
   - Clarify intent through Socratic questioning
   - Select and analyze 2-4 epistemic lenses via parallel Agent subagents
   - Synthesize findings into a "Product Vision" or "Feature Spec"

2. **Create Artifacts**:
   - Create/Update `VISION.md` or `specs/XX-feature-name.md`
   - Log architectural decisions via `/bridge log_decision`

### Phase 2: Planning (Syneidesis)

**Goal**: Turn "Blueprint" into a "Gap-Proof Task List".

1. **Initialize Planning Files**: Create `task_plan.md`, `findings.md`, `progress.md`
2. **Design the Plan**: Use `EnterPlanMode` to create a detailed implementation plan:
   - Setup/Scaffold tasks
   - Implementation tasks (grouped by vertical slice)
   - Verification tasks (TDD + Conformance)
   - Final "Ship" gate
3. **Gap Check (CRITICAL)**: Before finalizing, perform Syneidesis scan:
   - Check for Procedural, Consideration, Assumption, and Alternative gaps
   - Use `AskUserQuestion` to surface gaps for user judgment
   - Log gaps to `task_plan.md` under "## Epistemic Gaps"

### Phase 3: Execution & Verification (Katalepsis & Reflexion)

**Goal**: Turn "Task List" into "Shipped Code & Crystallized Knowledge".

1. **Execute the Plan**:
   - Use `/execute-plan` workflow to implement task by task
   - Run `npm run verify` after every major slice
   - Use `TaskCreate`/`TaskUpdate` for tracking

2. **Verify Comprehension**: After implementation, invoke `/katalepsis`:
   - Ensure the user understands all changes
   - Socratic verification of key decisions

3. **Crystallize Knowledge**: Invoke `/reflect`:
   - Extract insights via parallel Agent subagents
   - Persist to `docs/learnings.md` and `docs/decisions/`

## Rules

- **Full Chain Enforcement**: Never skip a protocol stage
- **Interactive Pause**: Always stop for user judgment at decision points (use `AskUserQuestion`)
- **Traceability**: Every phase must update `progress.md` and `findings.md`
- **Quality Gates**: `npm run verify` between major phases

## Synergies (Command Integration)

`/launch` orchestrates the full command ecosystem:

- **Phase 1**: `/brainstorm` + `/clarify` + `/council`
- **Phase 2**: `/write-plan` + `/factory-init`
- **Phase 3**: `/execute-plan` + `/verify` + `/katalepsis` + `/reflect`
- **Finish**: `/finish-branch` + `/wrap`

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract ADRs, patterns to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command`

$ARGUMENTS
