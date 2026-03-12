# PF-POC-004: Compiler Diagnostics And Prompt-Contract Guardrails Plan

**Milestone**: `PF-POC-004`
**Execution Branch**: `codex/pf-runtime-016-compile-diagnostics`
**Owner**: `core`
**Status**: `in_progress`
**Last Updated**: `2026-03-12`

## Objective

Expose deterministic compiler inference and fallback decisions so prompt/graph mismatches are visible during `poc:compile` instead of being discovered only at runtime.

## Scope Lock

1. Compiler diagnostics surface for POC compile path:
   - applied inference hints
   - fallback warnings when conditional intent is partial/unsupported
2. CLI surface:
   - deterministic diagnostics output from `poc:compile` without changing artifact schema compatibility
3. Governance evidence updates in same change set:
   - strategy trackers
   - daily log and spec-impact record

## Non-Goals (This Slice)

1. Full natural-language parser.
2. Runtime execution semantics changes.
3. UI-level diagnostics visualization.

## Initial Plan

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | Define diagnostics contract | stable compile diagnostics shape (inference summary + warnings) documented in code/tests | `node --test test/unit/poc/PromptCompiler.test.mjs` has RED diagnostics cases | done |
| 2 | Implement compiler diagnostics emission | compile path emits deterministic diagnostics for inferred and fallback cases | diagnostics unit tests pass | done |
| 3 | Wire compile CLI diagnostics output | `poc:compile` reports diagnostics with optional JSON report path | `npm run poc:compile` smoke confirms diagnostics fields | done |
| 4 | Refresh strategy/risk/log/spec-impact | tracker truth and evidence references updated for PF-POC-004 | `npm run check:strategy` + `npm run check:spec` pass | done |
| 5 | Full regression gate | no regressions in strict verification | `npm run verify:strict` pass | done |

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-12 17:01 | Initialized PF-POC-004 plan after PF-POC-003 merge closure to target compile diagnostics and fallback transparency gap. | `docs/strategy/PF-POC-004.md`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md` |
| 2026-03-12 17:02 | Added diagnostics coverage tests for comparator-supported and unsupported conditional prompts. | `test/unit/poc/PromptCompiler.test.mjs`, `node --test test/unit/poc/PromptCompiler.test.mjs` |
| 2026-03-12 17:03 | Added `compilePrompt` diagnostics payload (branch mode, inferences, warnings) while preserving `compilePromptToArtifact` compatibility. | `src/core/poc/PromptCompiler.mjs` |
| 2026-03-12 17:03 | Extended `poc:compile` with optional `--diagnostics-out` report emission and diagnostics summary output. | `scripts/poc-compile.mjs`, `npm run poc:compile -- --prompt "If customer is vip route premium otherwise route standard" --out .moonstone/artifacts/pf-poc-004-diagnostics.json --diagnostics-out .moonstone/artifacts/pf-poc-004-diagnostics-report.json` |
| 2026-03-12 17:05 | Completed strict regression + freshness verification after diagnostics and tracker updates. | `npm run verify:strict`, `npm run check:verification-fresh` |
