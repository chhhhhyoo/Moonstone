# PF-POC-005: Workflow Fixture Corpus And Golden Compile Matrix Plan

**Milestone**: `PF-POC-005`
**Execution Branch**: `codex/pf-runtime-017-compile-golden-fixtures`
**Owner**: `core`
**Status**: `in_progress`
**Last Updated**: `2026-03-12`

## Objective

Raise regression confidence by adding a representative prompt/artifact fixture corpus and deterministic golden checks for compiler output quality.

## Scope Lock

1. Fixture corpus:
   - prompt fixtures covering supported branch modes (`default`, `exists`, `comparator`, failure path)
   - expected artifact assertions (topology and condition semantics)
2. Golden checks:
   - deterministic compile matrix tests under unit/strict verification
3. Governance evidence updates in same change set:
   - strategy trackers
   - daily log and spec-impact record

## Non-Goals (This Slice)

1. New runtime execution semantics.
2. Broad NLP interpretation.
3. UI authoring and visualization.

## Initial Plan

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | Define fixture matrix contract | canonical fixture schema and prompt classes for compile regression | fixture-driven test file exists and fails first on placeholder expectations | done |
| 2 | Implement golden fixture tests | deterministic assertions for generated nodes/edges/conditions across fixture set | fixture test suite passes | done |
| 3 | Wire fixture matrix into strict flow | fixture tests run through existing `test:unit` and strict verification path | `npm run verify:strict` includes fixture coverage and passes | done |
| 4 | Refresh strategy/risk/log/spec-impact | tracker truth and evidence references updated for PF-POC-005 | `npm run check:strategy` + `npm run check:spec` pass | done |
| 5 | Regression confirmation | no regressions across conformance/runtime suites | `npm run verify:strict` pass | done |

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-12 17:07 | Initialized PF-POC-005 plan after PF-POC-004 merge closure to add golden compile fixture matrix coverage. | `docs/strategy/PF-POC-005.md`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md` |
| 2026-03-12 17:09 | Added compile fixture corpus with representative prompt classes across default/exists/comparator/failure/fallback-warning modes. | `test/fixtures/poc/prompt-compile-fixtures.json` |
| 2026-03-12 17:09 | Added fixture-driven golden matrix test for deterministic compile outputs and topology/condition invariants. | `test/unit/poc/PromptCompiler.fixtures.test.mjs`, `node --test test/unit/poc/PromptCompiler.fixtures.test.mjs test/unit/poc/PromptCompiler.test.mjs` |
| 2026-03-12 17:10 | Completed strict regression + freshness verification with fixture matrix integrated in unit route. | `npm run verify:strict`, `npm run check:verification-fresh` |
