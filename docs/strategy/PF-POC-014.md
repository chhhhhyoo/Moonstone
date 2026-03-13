# PF-POC-014: Upstream-Status Conditional Routing For Prompt-Synthesized Workflows

**Milestone**: `PF-POC-014`
**Execution Branch**: `codex/pf-runtime-028-upstream-branch-conditions`
**Owner**: `core`
**Status**: `in_progress`
**Last Updated**: `2026-03-13`

## Objective

Upgrade the pilot from input-only conditional parsing to upstream-aware branch synthesis, so prompts can declare status-based routing against connector outcomes in a deterministic, inspectable way.

## Scope Lock

1. Compiler branch-intent expansion:
   - infer status-comparator branch intent from prompts (for example `if response.status >= 500`)
   - map inferred conditions to deterministic runtime paths using terminal HTTP node result status
   - emit complementary true/false edges (no unconditional fallback edge in conditional mode)
2. Runtime and pilot qualification:
   - conformance verifies branch routing based on upstream status condition paths
   - inspect timeline and executed-node output remain deterministic and auditable
3. Governance sync:
   - milestone/action/risk/log evidence updated in lockstep for kickoff and completion

## Non-Goals (This Slice)

1. Generic expression language for arbitrary field transforms.
2. Branch conditions over arbitrary upstream response body fields.
3. Parallel/fan-out prompt synthesis or loop semantics.

## Initial Plan

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | RED: upstream-condition contract tests | failing unit + conformance tests asserting status-based branch compilation and execution | targeted tests fail for expected reason before implementation | done |
| 2 | GREEN: compiler/runtime behavior | deterministic upstream-status condition edges and runtime branch execution | targeted tests pass | done |
| 3 | REFACTOR: pilot docs and diagnostics alignment | runbook/docs updated for upstream-status branch syntax and limits | docs/tests remain consistent | done |
| 4 | Strict regression + tracker sync | strict verification/freshness evidence and tracker closure updates | `npm run verify:strict` + `npm run check:verification-fresh` pass | done |

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 17:40 | Activated PF-POC-014 immediately after PF-POC-013 merge closure to address upstream-condition branch realism in the pilot workflow builder. | `docs/strategy/PF-POC-014.md`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md` |
| 2026-03-13 17:41 | Created dedicated implementation branch for PF-POC-014 to keep one dominant milestone identity per PR and preserve plan traceability. | `codex/pf-runtime-028-upstream-branch-conditions`, `docs/strategy/PF-POC-014.md` |
| 2026-03-13 17:47 | Added RED tests for upstream-status conditional routing and confirmed expected failures (`branchMode` stayed `default`, condition edges missing nodeResults status path). | `test/unit/poc/PromptCompiler.test.mjs`, `test/integration/conformance/poc-pilot.conformance.test.mjs`, `node --test test/unit/poc/PromptCompiler.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 17:52 | Implemented upstream-status comparator inference (`response/http/upstream status`) mapped to terminal HTTP receipt path and turned targeted unit/conformance tests green. | `src/core/poc/PromptCompiler.mjs`, `node --test test/unit/poc/PromptCompiler.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 17:55 | Updated pilot runbook with an explicit upstream-status branch qualification scenario and documented current parser limitation scope. | `docs/workflows/PF-POC-PILOT-promptable-builder.md` |
| 2026-03-13 17:59 | Completed strict regression and freshness evidence for PF-POC-014 implementation scope; tracker set is PR-ready. | `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec` |
| 2026-03-13 18:02 | Re-ran strict + freshness after final log/learnings updates to keep verification evidence fully fresh for PR handoff. | `npm run verify:strict`, `npm run check:verification-fresh` |
| 2026-03-13 18:10 | Opened PF-RUNTIME-028 implementation PR with insight-first template, reviewer hotspots, and full validation evidence. | `https://github.com/chhhhhyoo/Moonstone/pull/20` |
