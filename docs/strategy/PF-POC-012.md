# PF-POC-012: Multi-Tool Prompt Synthesis Pilot Qualification Plan

**Milestone**: `PF-POC-012`
**Execution Branch**: `codex/pf-runtime-026-multi-tool-prompt-pilot`
**Owner**: `core`
**Status**: `done`
**Last Updated**: `2026-03-13`

## Objective

Raise promptable tool creation from single-template behavior to deterministic multi-tool synthesis so prompts describing ordered tool calls compile into auditable executable chains.

## Scope Lock

1. Compiler multi-tool synthesis:
   - detect multiple explicit HTTP call intents from prompt (ordered URL extraction)
   - emit sequential HTTP nodes (`http-1`, `http-2`, ...) followed by deterministic OpenAI summary node
   - keep generated tool blueprints aligned with emitted node order
2. Pilot qualification signal:
   - `poc:pilot` output must expose multi-tool chain in `generatedTools` and `executedNodeIds`
   - run artifacts remain inspectable/replayable with deterministic outputs
3. TDD qualification:
   - RED unit + conformance tests for multi-tool compile/runtime behavior
   - strict verification evidence after implementation
4. Governance sync:
   - milestone/action/risk/log updates with concrete evidence references

## Non-Goals (This Slice)

1. Arbitrary workflow loops or parallel graph synthesis.
2. Dynamic connector catalog expansion beyond existing HTTP/OpenAI runtime support.
3. UI/canvas authoring.

## Initial Plan

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | RED: multi-tool contract tests | failing compiler and pilot qualification tests for ordered multi-HTTP synthesis | targeted tests fail for expected reason before implementation | done |
| 2 | GREEN: compiler and pilot implementation | deterministic multi-tool chain generation and execution evidence | targeted tests pass | done |
| 3 | REFACTOR: docs and fixture alignment | pilot/runbook docs describe multi-tool prompt constraints and outputs | docs and tests remain consistent | done |
| 4 | Strict regression + tracker sync | strict verification/freshness evidence and tracker updates | `npm run verify:strict` + `npm run check:verification-fresh` pass | done |

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 15:10 | Activated PF-POC-012 immediately after PF-POC-010 merge closure to tackle multi-tool prompt synthesis gap with a fresh execution branch. | `docs/strategy/PF-POC-012.md`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md` |
| 2026-03-13 15:18 | Added RED tests for ordered multi-tool synthesis and confirmed expected failures (`http-2` missing) in compiler and pilot conformance paths. | `test/unit/poc/PromptCompiler.test.mjs`, `test/integration/conformance/poc-pilot.conformance.test.mjs`, `node --test test/unit/poc/PromptCompiler.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 15:25 | Implemented deterministic multi-tool prompt synthesis in compiler (ordered HTTP call inference + sequential edges + terminal success routing) and turned targeted tests green. | `src/core/poc/PromptCompiler.mjs`, `node --test test/unit/poc/PromptCompiler.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 15:27 | Updated pilot operator guide to document multi-tool prompt-chain expectations and current parser constraints. | `docs/workflows/PF-POC-PILOT-promptable-builder.md` |
| 2026-03-13 15:31 | Completed strict regression and freshness evidence with multi-tool synthesis tests included in canonical conformance route. | `npm run verify:strict`, `npm run check:verification-fresh` |
| 2026-03-13 15:36 | Opened PF-RUNTIME-026 implementation PR for multi-tool prompt synthesis slice with required governance template and validation evidence. | `https://github.com/chhhhhyoo/Moonstone/pull/18` |
| 2026-03-13 15:45 | Merged PF-RUNTIME-026 and closed PF-POC-012 action/risk scope (`ACT-017`, `POC-016`) with exit criteria satisfied. | `https://github.com/chhhhhyoo/Moonstone/pull/18`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md` |
