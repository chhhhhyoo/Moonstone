# PF-POC-011: Promptable Tool-Blueprint Pilot Qualification Plan

**Milestone**: `PF-POC-011`
**Execution Branch**: `codex/pf-runtime-024-promptable-tool-blueprints`
**Owner**: `core`
**Status**: `in_progress`
**Last Updated**: `2026-03-13`

## Objective

Make promptable tool creation explicit in the pilot path so generated tool intent is reviewable, reproducible, and test-qualified.

## Scope Lock

1. Compiler tool-blueprint output:
   - emit deterministic `generatedTools` in compile diagnostics
   - persist tool-blueprint metadata into compiled artifact
   - infer HTTP URL from prompt when explicit URL is present (unless `--http-url` override is provided)
2. Pilot CLI evidence shape:
   - include generated tool blueprints in `poc:pilot` JSON output
   - write `tools.json` artifact alongside artifact/diagnostics/run/inspect/replay files
3. Qualification:
   - unit tests for deterministic tool-blueprint generation and URL inference
   - conformance test proving `poc:pilot` outputs/records tool blueprint contract
4. Governance updates:
   - milestone/action/risk/log updates tied to evidence in this slice

## Non-Goals (This Slice)

1. Arbitrary third-party connector catalog expansion beyond HTTP/OpenAI.
2. UI/canvas authoring.
3. Runtime queue/distributed architecture changes.

## Initial Plan

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | RED: tool-blueprint contract tests | failing compiler + pilot tests for generated-tools contract | targeted unit/conformance tests fail for expected reason before implementation | done |
| 2 | GREEN: compiler + pilot implementation | deterministic generated-tools output and tools.json emission | targeted tests pass | done |
| 3 | REFACTOR: operator docs alignment | pilot runbook documents explicit tool-blueprint outputs and interpretation | docs reflect real CLI contract | done |
| 4 | Strict regression + tracker sync | strict verification + freshness evidence with tracker/log updates | `npm run verify:strict` + `npm run check:verification-fresh` pass | done |

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 13:10 | Initialized PF-POC-011 pilot slice and parked PF-POC-010 recovery slice to avoid mixed-priority execution. | `docs/strategy/PF-POC-011.md`, `docs/strategy/PF-POC-010.md`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md` |
| 2026-03-13 13:18 | Added RED tests for prompt URL inference and generated tool-blueprint contract in compiler and pilot CLI; confirmed expected failures. | `test/unit/poc/PromptCompiler.test.mjs`, `test/integration/conformance/poc-pilot.conformance.test.mjs`, `node --test test/unit/poc/PromptCompiler.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 13:26 | Implemented deterministic generated-tools blueprints in compiler diagnostics + artifact metadata and added prompt URL inference fallback behavior. | `src/core/poc/PromptCompiler.mjs`, `node --test test/unit/poc/PromptCompiler.test.mjs` |
| 2026-03-13 13:28 | Wired pilot outputs to emit/store tool blueprints (`generatedTools`, `tools.json`) and updated operator pilot guide contract. | `scripts/poc-pilot.mjs`, `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 13:31 | Completed strict regression evidence for PF-POC-011 implementation slice with tracker integrity/freshness green. | `npm run verify:strict`, `npm run check:verification-fresh` |
