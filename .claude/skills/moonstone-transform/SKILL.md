---
name: moonstone-transform
description: Use when given XState JSON or Moonstone specification to transform into TypeScript implementation with Zod schemas and tests using Handlebars templates.
user-invocable: true
allowed-tools: Read, Bash, Write, Edit, Glob
---

# Moonstone Transformer

Automates the transformation of Stately.ai (XState) JSON definitions into executable TypeScript code, Zod schemas, and model-driven tests.

## Workflow

### 1. Ingest

Read Moonstone JSON from `specs/models/`:
- Use `Glob` to find `specs/models/*.json`
- Use `Read` to parse the Moonstone definition
- Validate the JSON structure has required fields (states, transitions, events)

### 2. Scaffold

Generate the following files for each agent/Moonstone:

- **`[AgentName].machine.ts`** - XState Machine definition
  - State nodes from JSON states
  - Transition definitions with event types
  - Guard conditions and action references

- **`[AgentName].schema.ts`** - Zod validation schemas
  - One schema per transition event
  - Input/output validation for each state
  - Strict typing for all event data

- **`[AgentName].service.ts`** - Business logic placeholders
  - Action handler stubs for each transition
  - Guard function stubs
  - Service invocation stubs

### 3. Wire

Register the new Agent in the system:
- Add to `AgentFactory` registry
- Add to `CyanResolver` mapping
- Update any relevant index/barrel files

### 4. Test

Generate model-based tests:
- `simplePath` traversal tests via `fast-check`
- State reachability verification
- Transition coverage tests

```bash
npm test -- --grep "[AgentName]"
```

## Rules

- **No Overwrite**: Do NOT overwrite existing business logic in `.service.ts` files. Only generate stubs for new methods.
- **Strict Typing**: Every transition `event.data` MUST have a corresponding Zod schema
- **Traceability**: Link every generated file back to the source Moonstone ID via comments
- **Idempotent**: Running the transformer again should only add new elements, never remove existing ones

## Synergies (Command Integration)

`/moonstone-transform` bridges model and code:

- **+ `/write-plan`**: Scaffolded files become the starting point for implementation planning
- **+ `/tdd`**: Generated test stubs are filled using TDD workflow
- **+ `/eval-checklist`**: Ensure the Moonstone covers all necessary failure modes
- **+ `/verify`**: Run `npm run moonstone:ssot:check` to validate Moonstone consistency

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract insights to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command`

$ARGUMENTS
