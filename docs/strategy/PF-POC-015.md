# PF-POC-015: Lead-Chef SSOT And Direct-Apply Prompt Mutation Loop

**Milestone**: `PF-POC-015`
**Execution Branch**: `codex/pf-runtime-029-direct-apply-mutation`
**Owner**: `core`
**Status**: `done`
**Last Updated**: `2026-03-13`

## Objective

Move from prompt-to-static-compile only into prompt-driven graph evolution by shipping a direct-apply mutation loop (`poc:mutate`) that applies a single deterministic workflow mutation and preserves replay/inspect runtime guarantees.

## Vision Alignment

This slice advances the lead-chef model in `VISION.md` by:

1. treating user prompts as direction for workflow restructuring (not manual JSON authoring),
2. making system-selected graph changes explicit and reviewable via deterministic mutation summaries,
3. preserving durable execution boundaries (command/receipt/journal/replay) after mutation.

## Scope Lock

1. Vision SSOT update:
   - replace root `VISION.md` with lead-chef north star and roadmap orientation using Moonstone-native runtime terms
   - update governance rule to require `Vision Alignment` section in new PF-POC plan docs
2. Direct-apply mutation engine:
   - add deterministic single-operation mutation planner (`prompt -> WorkflowMutationPlan`)
   - add fail-closed mutation applier (`artifact + plan -> mutated artifact + summary`)
   - supported operations: `add_http_after`, `add_openai_after`, `replace_node_tool`, `connect_nodes`, `remove_leaf_node`
3. CLI contract:
   - add `poc:mutate` command writing new output artifact path by default (`*.mutated.json`)
   - emit deterministic JSON with operation type, summary, warnings/errors
4. Qualification:
   - RED->GREEN unit/integration/conformance coverage for mutation determinism + safety invariants
   - strict verification and freshness evidence

## Non-Goals (This Slice)

1. Multi-operation mutation batches per prompt.
2. In-run autonomous self-modifying nodes.
3. UI/canvas workflow authoring.

## Initial Plan

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | SSOT + tracker kickoff | PF-POC-014 closure, PF-POC-015 activation, `VISION.md` SSOT rewrite, rule update for `Vision Alignment` | `npm run check:strategy` + `npm run check:spec` + `npm run check:links` pass | done |
| 2 | RED: mutation contract tests | failing planner/applier/unit + integration + conformance tests for `poc:mutate` | targeted tests fail for expected reason before implementation | done |
| 3 | GREEN: mutation planner/applier + CLI | deterministic single-operation mutation with fail-closed invariants and CLI output contract | targeted tests pass | done |
| 4 | REFACTOR: docs + qualification assets | pilot/runbook/docs + fixtures reflect mutation loop and limits | docs/tests remain consistent | done |
| 5 | Strict regression + evidence sync | strict verification/freshness and tracker/log/learnings updates | `npm run verify:strict` + `npm run check:verification-fresh` pass | done |

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 19:03 | Activated PF-POC-015 immediately after confirming PF-RUNTIME-028 merge state so lead-chef mutation loop can proceed from current master truth. | `https://github.com/chhhhhyoo/Moonstone/pull/20`, `docs/strategy/PF-POC-015.md` |
| 2026-03-13 19:04 | Created dedicated implementation branch for PF-POC-015 to keep one dominant milestone identity per PR and preserve traceable execution. | `codex/pf-runtime-029-direct-apply-mutation`, `docs/strategy/PF-POC-015.md` |
| 2026-03-13 19:11 | Completed SSOT/tracker kickoff: PF-POC-014 closed, PF-POC-015 activated, `VISION.md` replaced with lead-chef model, and governance requires `Vision Alignment` in PF-POC plans. | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `VISION.md`, `docs/governance/RULE.md`, `docs/governance/pr-branch-policy.md`, `npm run check:strategy`, `npm run check:spec`, `npm run check:links` |
| 2026-03-13 19:20 | Added RED mutation contract tests for planner/applier/conformance and captured expected failures (missing mutation modules + missing `poc:mutate` runtime contract). | `test/unit/poc/WorkflowMutationPlanner.test.mjs`, `test/unit/poc/WorkflowMutationApplier.test.mjs`, `test/integration/conformance/poc-mutate-qualification.conformance.test.mjs`, `test/fixtures/poc/poc-mutate-quality-criteria.json`, `node --test test/unit/poc/WorkflowMutationPlanner.test.mjs`, `node --test test/unit/poc/WorkflowMutationApplier.test.mjs`, `node --test test/integration/conformance/poc-mutate-qualification.conformance.test.mjs` |
| 2026-03-13 20:42 | Implemented GREEN mutation runtime contract: planner parser hardening, new applier with safety invariants, and new `poc:mutate` CLI writing immutable `*.mutated.json` outputs. | `src/core/poc/WorkflowMutationPlanner.mjs`, `src/core/poc/WorkflowMutationApplier.mjs`, `scripts/poc-mutate.mjs`, `package.json`, `node --test test/unit/poc/WorkflowMutationPlanner.test.mjs`, `node --test test/unit/poc/WorkflowMutationApplier.test.mjs` |
| 2026-03-13 20:47 | Refactored mutation qualification for hermetic execution and updated pilot runbook/spec-impact artifacts with explicit mutation limits and operator flow. | `test/integration/conformance/poc-mutate-qualification.conformance.test.mjs`, `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `notes/spec-impact/2026-03-13-pf-poc-015-direct-apply-mutation.md` |
| 2026-03-13 20:53 | Completed strict regression gates and freshness checks for PF-POC-015 closure evidence. | `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` |
| 2026-03-13 21:00 | Re-ran strict/freshness gates after final docs/log/learnings sync to keep closure evidence timestamp-fresh before PR handoff. | `npm run verify:strict`, `npm run check:verification-fresh` |
| 2026-03-13 12:48 | Merged PF-RUNTIME-029 and closed milestone/action/risk tracker set (`PF-POC-015`, `ACT-020`, `POC-019`) before activating PF-POC-016. | `https://github.com/chhhhhyoo/Moonstone/pull/21`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md` |
