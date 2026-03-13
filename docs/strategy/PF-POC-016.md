# PF-POC-016: Lead-Chef Pilot Feedback Loop Qualification

**Milestone**: `PF-POC-016`
**Execution Branch**: `codex/pf-runtime-030-chef-feedback-loop`
**Owner**: `core`
**Status**: `done`
**Last Updated**: `2026-03-13`

## Objective

Add an iterative pilot feedback lane so users can start from either prompt or existing artifact, apply prompt direction as mutation, rerun immediately, and review deterministic lineage evidence without editing JSON by hand.

## Vision Alignment

This slice advances `VISION.md` by:

1. strengthening the lead-chef loop (direction -> system mutation -> rerun -> review),
2. moving from one-shot execution to iterative prompt-driven graph evolution,
3. preserving durable execution evidence (`run`, `inspect`, `replay`) across revision cycles.

## Scope Lock

1. Pilot feedback contract:
   - extend `poc:pilot` to support artifact-first iteration (`--artifact <path>`)
   - add optional direction input (`--feedback "..."`) that applies one deterministic mutation before run
2. Deterministic lineage evidence:
   - pilot output must include source artifact path, effective artifact path, mutation operation summary (when feedback provided)
   - source artifact remains immutable; mutated artifact written to deterministic path
3. Qualification coverage:
   - add conformance tests for compile -> feedback mutate -> rerun path
   - verify inspect/replay remain stable for feedback-mutated runs
4. Docs and governance sync:
   - update pilot runbook with iterative feedback flow and limitations
   - keep milestone/action/risk/log updates in lockstep

## Non-Goals (This Slice)

1. Multi-operation feedback per turn.
2. Autonomous in-run self-modifying nodes.
3. Multi-session memory/orchestration state beyond file artifact lineage.

## Initial Plan

| phase | plan_item | deliverable | verification_gate | status |
|---|---|---|---|---|
| 1 | RED: pilot feedback contract tests | failing conformance + integration tests for artifact-first + feedback mutation path | targeted tests fail for expected reason before implementation | done |
| 2 | GREEN: pilot feedback implementation | `poc:pilot` supports `--artifact` + optional `--feedback` with deterministic lineage output | targeted tests pass | done |
| 3 | REFACTOR: runbook/spec-impact updates | pilot docs describe iterative feedback contract and failure limits | docs/tests remain consistent | done |
| 4 | Strict regression + evidence sync | strict verification/freshness and tracker closure evidence | `npm run verify:strict` + `npm run check:verification-fresh` pass | done |

## Implementation Update Log (Append-Only)

| timestamp_kst | update | evidence |
|---|---|---|
| 2026-03-13 22:02 | Activated PF-POC-016 after PF-RUNTIME-029 merge closure with one dominant milestone and risk/action refresh (`ACT-021`, `POC-020`). | `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md`, `docs/strategy/PF-POC-016.md` |
| 2026-03-13 22:09 | Added RED conformance contract for artifact-first feedback loop and confirmed expected failure (`poc:pilot` still hard-requires `--prompt`). | `test/integration/conformance/poc-pilot.conformance.test.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 22:16 | Implemented GREEN pilot feedback lane: `poc:pilot` now accepts `--artifact` and optional `--feedback`, applies deterministic mutation, and emits artifact lineage summary in output contract. | `scripts/poc-pilot.mjs`, `node --test test/integration/conformance/poc-pilot.conformance.test.mjs` |
| 2026-03-13 22:19 | Completed REFACTOR docs/spec impact for chef feedback loop and updated operator runbook with iterative mutation workflow. | `docs/workflows/PF-POC-PILOT-promptable-builder.md`, `notes/spec-impact/2026-03-13-pf-poc-016-pilot-feedback-loop.md` |
| 2026-03-13 22:26 | Completed strict regression gates for PF-POC-016; reran freshness check after strict completion due parallel timing window. | `npm run verify:strict`, `npm run check:verification-fresh` |
| 2026-03-13 22:37 | Re-ran strict/freshness/strategy/spec/link gates after final log+learning sync so branch evidence remains current for PR handoff. | `npm run verify:strict`, `npm run check:verification-fresh`, `npm run check:strategy`, `npm run check:spec`, `npm run check:links` |
| 2026-03-13 12:06 | Merged PF-RUNTIME-030 and closed milestone/action/risk tracker set (`PF-POC-016`, `ACT-021`, `POC-020`) before activating PF-POC-017. | `https://github.com/chhhhhyoo/Moonstone/pull/22`, `docs/strategy/MILESTONES.md`, `docs/strategy/FUTURE-ACTIONS.md`, `docs/strategy/2026-03-12-pf-poc-001-risk-register.md` |
