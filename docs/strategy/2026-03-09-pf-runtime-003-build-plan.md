# PF-RUNTIME-003 Build Plan (2026-03-09)

> Superseded on 2026-03-12 by `PF-POC-001`:
> `docs/strategy/2026-03-12-pf-poc-001-build-plan.md`

## Objective

Prove multi-agent runtime viability and Durable Execution semantics by implementing an Outbox/Inbox (Command/Receipt) pattern, adding a second active Moonstone agent, and passing crash-resilient parity + resume-flow pressure checks.

## Why Now

`PF-RUNTIME-002` closed the incremental TS/ESLint baseline. Based on deep architectural research, the highest remaining runtime risks are single-agent bias and in-memory Moonstone side-effect coupling. To achieve SOTA orchestration reliability, we must enforce a strict separation between state transitions (pure) and side-effects (outbox/inbox) before adding real database persistence.

## Scope

1. Core Execution Contract Refactor:
   - Introduce strict `OperationCommand` (Outbox) and `OperationReceipt` (Inbox) boundaries via correlation IDs.
   - Refactor `BaseFsmAgent` so transitions are pure functions yielding commands, with zero direct async side-effects.
   - Update `Orchestrator` to act as an event dispatcher handling Commands and injecting Receipts.
2. Add exactly one new active Moonstone agent family (e.g., Research Agent):
   - definition
   - machine
   - implementation
   - schema
3. Register agent in runtime wiring:
   - `src/agent/active-agents.json`
   - registry and factory routing
4. Add parity and lifecycle tests:
   - Crash/resume flow tests: Serialize `ActorStore`, wipe memory, reload state, and assert no duplicate side effects.
   - cross-agent route behavior tests (via correlation IDs)
5. Keep transport-agnostic core boundary intact.

## Out of Scope

1. Full TypeScript migration (reserved for `ACT-008` expansion).
2. Implementing a persistent database (Postgres/Redis) for `ActorStore` (reserved for `PF-CONF-001`).
3. Visual UI / Prompt-to-Workflow Compilation.

## Acceptance Criteria

1. Two active agents are represented in code and registry with one-machine-one-component parity.
2. State transitions in Moonstone agents do not directly await provider calls (strict Command/Receipt flow).
3. `npm run verify:strict` passes with new runtime tests.
4. Session wait/resume behavior is verified, successfully passing a simulated process crash/resume test.
5. Milestone `PF-RUNTIME-003` may move to `done` only after these parity pressure tests are stable in CI.

## Execution Sequence

1. Define `Command` and `Receipt` structures in `contracts.mjs` with explicit correlation IDs.
2. Refactor `BaseFsmAgent.mjs` and `IntakeAgent.machine.mjs` to purely yield Commands.
3. Update `Orchestrator.mjs` Dispatch loop and `ProviderProxy.mjs` boundaries.
4. Implement Second Agent and runtime intent routing.
5. Verification hardening and Two-Agent Crash/Resume test implementation.
