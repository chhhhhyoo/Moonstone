# Architecture

## Scope

Moonstone is the runtime plane for orchestration, session continuity, and agent execution, strictly enforcing a **Durable Execution** paradigm to ensure deterministic, crash-safe workflows.

## Boundaries

1. Core orchestration must not import transport payload formats.
2. Adapters convert transport payloads into `ConversationContext`.
3. Agent logic must be **pure functions**; state transitions must not perform direct protocol calls, await promises, or produce side-effects.
4. Agents communicate with the outside world by yielding `OperationCommand`s (Outbox) and waking upon `OperationReceipt`s (Inbox).
5. Provider proxies are the only place for HTTP/protocol details and side-effect execution.
6. Governance checks live in scripts and docs, not in ad hoc runtime branching.

## Layer Model

1. `src/core`: orchestration contracts, session identity, command/receipt routing, and event dispatcher loop
2. `src/adapter`: transport normalization
3. `src/agent`: pure Moonstone agents and agent metadata (compiled from prompt/graph)
4. `src/provider`: domain provider interfaces and proxy implementations for executing side-effects
5. `src/service`: actor/session storage (Event Journal) and messaging abstractions

## State Model

Session identity is hierarchical (`source:conversation:thread:user:agent`) to avoid `userId`-only collisions. Every execution command and receipt carries a `CorrelationId` and `SessionKey` for deterministic resumption and routing across multiple concurrent agents. All state transitions are modeled to be append-only journaled.
