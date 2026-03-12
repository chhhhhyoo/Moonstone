# PF-POC-003: Prompt Compiler Branching Quality Plan

**Milestone**: `PF-POC-003`
**Execution Branch**: `codex/pf-runtime-015-compiler-comparator-branches`
**Owner**: `core`
**Status**: `done`
**Last Updated**: `2026-03-12`

## Objective

Increase prompt-to-artifact quality for non-trivial prompts by producing deterministic, schema-valid branch shapes and covering them with branch-focused fixtures.

## Scope Lock

1. Compiler/runtime contract surface:
   - `src/core/poc/PromptCompiler.mjs`
   - `test/unit/poc` fixtures for compiler output quality.
2. Branching focus for this slice:
   - failure-path branch generation from natural-language prompts
   - deterministic conditional branch generation for input-existence prompts
3. Governance evidence updates in same change set:
   - milestone/actions/risk tracker refresh
   - daily log and spec-impact record
4. Comparator expansion focus for this continuation slice:
   - infer comparator conditions from prompt patterns (`eq/ne/gt/gte/lt/lte`)
   - generate deterministic mutually-exclusive true/false success branches

## Non-Goals (This Slice)

1. LLM-based semantic parser for arbitrary natural language.
2. Parallel branch execution model redesign.
3. UI-level workflow authoring.

## Initial Plan

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | Add branch-focused compiler fixtures | new unit tests for failure branch + input-exists conditional branch + deterministic metadata controls | `node --test test/unit/poc/PromptCompiler.test.mjs` fails first on current compiler | done |
| 2 | Implement heuristic branch compiler upgrades | compiler emits valid branch nodes/edges from targeted prompt patterns | `node --test test/unit/poc/PromptCompiler.test.mjs` passes | done |
| 3 | Validate schema safety for generated branches | generated artifacts pass strict artifact validation for all new fixture prompts | `npm run poc:compile` + `npm run poc:validate` smoke passes | done |
| 4 | Refresh strategy/risk/log/spec-impact | trackers and records reflect PF-POC-003 execution truth | `npm run check:strategy` + `npm run check:spec` pass | done |
| 5 | Full regression gate | no regressions in runtime/connector/governance pipelines | `npm run verify:strict` pass | done |

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-12 16:44 | Initialized PF-POC-003 rolling plan and moved ACT-006 to in-progress after PF-POC-002 merge refresh. | `docs/strategy/PF-POC-003.md`, `docs/strategy/FUTURE-ACTIONS.md` |
| 2026-03-12 16:45 | Added RED-first branch-focused compiler tests for failure routing, input-exists conditional routing, and deterministic metadata/output checks. | `test/unit/poc/PromptCompiler.test.mjs`, `node --test test/unit/poc/PromptCompiler.test.mjs` |
| 2026-03-12 16:46 | Implemented compiler heuristics for failure and input-existence branches with explicit compiler hints and deterministic `now` injection support. | `src/core/poc/PromptCompiler.mjs` |
| 2026-03-12 16:46 | Resolved `check:type` inference drift by adding explicit JSDoc union typing for mixed node/edge arrays in JS strict mode. | `src/core/poc/PromptCompiler.mjs`, `npm run verify:strict` |
| 2026-03-12 16:46 | Validated compile/validate smoke path using branching prompt fixture and confirmed strict full-gate regression pass. | `npm run poc:compile -- --prompt "when input.customerId exists post to webhook and on failure send fallback summary" --out .moonstone/artifacts/pf-poc-003-branching.json`, `npm run poc:validate -- --artifact .moonstone/artifacts/pf-poc-003-branching.json`, `npm run verify:strict` |
| 2026-03-12 16:50 | Opened implementation PR with template-compliant body and policy title for milestone review. | `https://github.com/chhhhhyoo/Moonstone/pull/5` |
| 2026-03-12 17:02 | Post-merge refresh completed for PR #5; continued PF-POC-003 on new branch for comparator-aware branching coverage closure. | `git checkout -b codex/pf-runtime-015-compiler-comparator-branches`, `docs/strategy/PF-POC-003.md` |
| 2026-03-12 17:03 | Added RED-first comparator branch tests for numeric (`>`) and verbal equality (`equals`) prompt patterns. | `test/unit/poc/PromptCompiler.test.mjs`, `node --test test/unit/poc/PromptCompiler.test.mjs` |
| 2026-03-12 17:04 | Implemented comparator inference + inverse comparator mapping to build deterministic true/false conditional success edges. | `src/core/poc/PromptCompiler.mjs` |
| 2026-03-12 17:04 | Validated comparator compile/validate smoke and strict regression gates green. | `npm run poc:compile -- --prompt "When input.amount > 100 post order and summarize premium path" --out .moonstone/artifacts/pf-poc-003-comparator.json`, `npm run poc:validate -- --artifact .moonstone/artifacts/pf-poc-003-comparator.json`, `npm run verify:strict` |
| 2026-03-12 17:01 | Merged comparator extension PR and closed PF-POC-003 action scope (`ACT-006`) with milestone exit criteria satisfied. | `https://github.com/chhhhhyoo/Moonstone/pull/6`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md` |
