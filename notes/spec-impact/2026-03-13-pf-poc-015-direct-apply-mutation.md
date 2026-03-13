---
status: accepted
changed_areas:
  - vision-ssot
  - poc-cli
  - workflow-mutation
  - runtime-conformance
  - operator-workflow
consulted_sources:
  - VISION.md
  - SPEC.md
  - docs/strategy/PF-POC-015.md
  - docs/workflows/PF-POC-PILOT-promptable-builder.md
decisions:
  - Replace product vision SSOT with lead-chef model adapted to Moonstone runtime terms.
  - Ship direct-apply prompt mutation as a single-operation, fail-closed contract for fast product signal.
  - Add deterministic `poc:mutate` output and default `*.mutated.json` artifact path to keep source artifacts immutable.
  - Enforce mutation safety invariants (unknown refs, trigger deletion, non-leaf deletion, cycle-introducing connect).
---

# 2026-03-13 PF-POC-015 Lead-Chef SSOT And Direct-Apply Mutation Impact

## Summary

PF-POC-015 converts lead-chef vision into executable product behavior by adding a prompt-driven artifact mutation lane (`poc:mutate`) that remains compatible with current run/inspect/replay guarantees.

## Contract Impact

1. Added `WorkflowMutationPlan` generation contract:
   - `src/core/poc/WorkflowMutationPlanner.mjs`
2. Added direct-apply mutation contract:
   - `src/core/poc/WorkflowMutationApplier.mjs`
3. Added new CLI command:
   - `npm run poc:mutate -- --artifact <path> --prompt "..." [--out <path>]`
4. Added governance requirement:
   - new PF-POC plan docs must include `Vision Alignment` section in `docs/governance/RULE.md`

## Test Impact

1. Added planner unit suite:
   - `test/unit/poc/WorkflowMutationPlanner.test.mjs`
2. Added applier unit suite:
   - `test/unit/poc/WorkflowMutationApplier.test.mjs`
3. Added mutation conformance matrix:
   - `test/integration/conformance/poc-mutate-qualification.conformance.test.mjs`
4. Added criteria fixture:
   - `test/fixtures/poc/poc-mutate-quality-criteria.json`

## Operational Impact

1. Pilot workflow doc now includes direct-apply mutation runbook:
   - `docs/workflows/PF-POC-PILOT-promptable-builder.md`
2. Mutation lane remains CLI-first and connector scope remains `Webhook + HTTP + OpenAI`.

## Known Limits (Intentional In This Slice)

1. Single operation per prompt only.
2. No autonomous in-run graph self-modification.
3. No iterative propose/review/revise mutation loop yet (deferred to PF-POC-016+).
