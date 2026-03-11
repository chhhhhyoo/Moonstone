# Workflows

## New Request Flow

1. Adapter receives transport payload.
2. Adapter normalizes to `ConversationContext`.
3. Orchestrator resolves active session by hierarchical key.
4. If session exists, resume agent.
5. If no session, route intent, create agent, and begin state evaluation.
6. Agent evaluates state as a pure function and yields `OperationCommand`s.
7. Orchestrator persists the state transition and commands to the Event Journal (`ActorStore`).
8. Orchestrator delegates commands to `ProviderProxy` for side-effect execution.

## Resume Flow (Inbox/Receipt)

1. `ProviderProxy` completes side-effect and returns an `OperationReceipt` with a `CorrelationId`.
2. Orchestrator matches `CorrelationId` to an existing `SessionKey`.
3. Stored actor/agent wakes up and receives the `OperationReceipt` as an event.
4. Agent evaluates new state and yields next commands.
5. Terminal states clear actor/session or mark workflow complete.

## Failure Flow

1. Provider proxy failure yields a failure `OperationReceipt`.
2. Orchestrator injects the failure receipt into the agent for deterministic handling (e.g., transition to a failed/retry state).
3. Contract mismatch during compilation/validation returns an immediate, controlled failure result.
4. Fail-open behavior on required checks is prohibited.
