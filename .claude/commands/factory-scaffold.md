# Factory Scaffold

Scaffold a new Factory artifact (Tool/Skill/Agent) using project templates and standards.

## Workflow

### Step 1: Identify Artifact
Use `AskUserQuestion` to clarify:
- **Name**: What is the artifact called?
- **Type**: Tool, Skill, or Agent?

### Step 2: Read Standards
1. Read `notes/01-Workflow-Playbook.md` for the creation loop
2. Read `notes/02-Spec-Writing-Guide.md` for spec requirements

### Step 3: Create Spec
Create `specs/<artifact-name>.md` with:
- Concrete success criteria (measurable, not vague)
- Input/output contract
- Failure modes and edge cases
- Dependencies

### Step 4: Standards Check
Verify the spec against:
- **Bounded?** (reference `notes/03-Context-Engineering.md`)
- **Has failure modes?** (reference `notes/05-Evals-and-Conformance.md`)

### Step 5: Initialize Log
Create `docs/logs/YYYY-MM-DD-<artifact-name>.md` as the transparency log for this factory run.

### Step 6: Propose Blueprint

> **Templates**: For Moonstone-based artifacts, use the Handlebars templates at `.claude/templates/moonstone-*.ts.hbs` (moonstone-machine, moonstone-schema, moonstone-service).

Present the blueprint via `AskUserQuestion` before writing any code:
- Summary of what will be built
- File structure
- Key interfaces
- Verification plan

**Do NOT write code until blueprint is approved.**

## Rules

- **Spec before code**: Always write the spec first
- **Standards compliance**: Every artifact must pass the standards check
- **Blueprint approval**: User must approve before implementation begins
- **Transparency**: Every factory run is logged

## Synergies (Command Integration)

- **+ `/vault`**: Read standards before scaffolding
- **+ `/write-plan`**: Create implementation plan after scaffold
- **+ `/tdd`**: Implement the artifact using TDD
- **+ `/build-agent`**: Use this for agent-type artifacts

## Exit Protocol (Mandatory)

1. Spec created in `specs/`
2. Log initialized in `docs/logs/`
3. Blueprint approved by user
4. Reconcile findings to `docs/logs/YYYY-MM-DD.md`
5. Chain Next Step: Recommend `/write-plan` or `/tdd`

$ARGUMENTS
