# Orchestrator Overview

## Purpose And Boundaries

Moonstone orchestrates routing, session continuity, agent execution, and outbound messaging using a **Durable Execution** paradigm.

It does not own transport payload parsing and does not own provider protocol logic. It serves as an event dispatcher and state journal for agents.

## Flow At A Glance (Durable Moonstone + Outbox Pattern)

1. Adapter normalizes request into `ConversationContext`.
2. Orchestrator computes `SessionKey` and checks active session.
3. Existing session wakes up agent; otherwise intent routing creates agent.
4. Agent evaluates its state as a **pure function** and yields `OperationCommand`s.
5. Orchestrator appends the state transition and commands to an event journal (`ActorStore`).
6. Orchestrator delegates commands to the `ProviderProxy` for side-effect execution.
7. Upon completion, `ProviderProxy` returns an `OperationReceipt` with a `CorrelationId`.
8. Orchestrator routes the receipt back to the matching session to resume execution.

## Can / Cannot / Currently Does

### Can

1. route and resume active agent slices
2. persist waiting-state sessions by hierarchical key and event journaling
3. emit structured operation commands and receipts
4. enforce strict side-effect isolation (Outbox pattern)

### Cannot

1. parse Slack/REST details in core orchestrator
2. call HTTP/protocol operations directly from agents (all async calls must be yielded as commands)
3. rely on user-id-only session identity

### Currently Does

1. ships one vertical slice (`intake`) with one proxy boundary (migrating to pure Moonstone)
2. includes strict verification and conformance harness

## Session Lifecycle

1. `set`: store actor/agent state and journaled events by key
2. `get`: return if active and not expired
3. `touch`: refresh waiting state
4. `clear`: remove completed/failed sessions

## Interface Snapshot

Contracts are defined in [src/core/contracts.mjs](../src/core/contracts.mjs).

## Failure Surface

1. invalid context normalization -> reject at adapter
2. unknown intent -> no-op or controlled error path
3. proxy failure -> controlled `failed` receipt returned to orchestrator, Moonstone decides next step
4. stale session -> treated as new request

## Roadmap / Drift Isolation

Future transport-heavy integrations move to `Mariner`.
Future conformance/promotion-heavy workflows move to `Surveyor`.

## Verification Confidence

Confidence comes from `npm run verify:strict`, not from doc claims.
