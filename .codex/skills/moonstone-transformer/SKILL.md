---
name: moonstone-transformer
description: Transform Moonstone model definitions into local agent scaffolding (machine/schema/service/tests) with traceable wiring into the runtime registry and factory.
---

# moonstone-transformer

Codex-native migration of Gemini `moonstone-transformer`.

## Purpose

Convert model definitions into executable local agent artifacts while preserving transition traceability, validation coverage, and safe integration into the current runtime architecture.

## Protocol

### Phase 1: Ingest Model Definition

1. Load Moonstone model JSON from `specs/models/` (create folder/file if missing and requested).
2. Validate required model fields:
   - machine id,
   - states,
   - transitions/events,
   - source model identifier/version.
3. Record source Moonstone identifier in `findings.md` before code generation.

### Phase 2: Scaffold Agent Artifacts

Generate or update agent module files under `src/agent/<agent>/`:
1. `<Agent>.def.mjs`
2. `<Agent>.machine.mjs`
3. `<Agent>.schema.mjs`
4. `<Agent>.service.mjs` (when service separation is needed)
5. `<Agent>.mjs` (agent class wrapper)

Template source (migrated artifacts):
1. `.codex/skills/moonstone-transformer/templates/machine.ts.hbs`
2. `.codex/skills/moonstone-transformer/templates/schema.ts.hbs`
3. `.codex/skills/moonstone-transformer/templates/service.ts.hbs`

Adapt templates to local runtime conventions (`.mjs` modules and validator functions) when TypeScript/Zod assumptions are not present.

### Phase 3: Wire Into Runtime

Update integration points:
1. `src/agent/registry.mjs`
2. `src/agent/active-agents.json`
3. `src/service/AgentFactory.mjs`
4. `src/core/AgentIntent.mjs` and related contract constants when new intents are introduced.

Fail closed if wiring is incomplete.

### Phase 4: Test And Verify

1. Add/update deterministic transition tests for generated machine behavior.
2. Run:

```bash
npm run test:unit
```

3. For broader runtime-impacting changes, run:

```bash
npm run verify:strict
```

### Phase 5: Traceability Output

1. Include source Moonstone id/version references in generated files.
2. Report generated paths and wiring changes explicitly.

## Rules

1. No overwrite of existing business logic without explicit confirmation.
2. Every transition input must have corresponding validation logic.
3. Generated artifacts must be traceable to source Moonstone id/version.
4. Do not claim completion until runtime wiring and tests are both green.

## Skill Synergy

1. With `writing-plans`: use scaffold output as implementation starting point.
2. With `test-driven-development`: convert generated transition map into failing tests first.
3. With `eval-suite-checklist`: validate failure-mode and adversarial coverage after generation.

## Exit Protocol

1. Reconcile generation decisions and risks into `docs/logs/YYYY-MM-DD.md`.
2. Promote reusable model-to-code patterns into `docs/learnings.md`.
3. Update `task_plan.md` and `progress.md` with generated artifacts and verification evidence.
