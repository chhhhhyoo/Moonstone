# Decision Record 001: Durable Moonstone and Outbox Pattern

## Status
Accepted

## Context
Our orchestration platform requires execution correctness, deterministic resume-safety, and strong observability for agents, sub-agents, and tools. Naive in-memory finite state machines (Moonstone) or simplistic visual graphs are insufficient to survive process crashes, orchestrate long-running tool timeouts, or safely handle human-in-the-loop wait states. Without a durable execution strategy, our platform is vulnerable to state loss and side-effect duplication (phantom retries).

An extensive due diligence review comparing SOTA workflow orchestration platforms (Temporal, Camunda 8, AWS Step Functions, Azure Durable Functions, LangGraph) was conducted. The research conclusively demonstrated that production-grade execution requires strict separation of control flow (the orchestrator) from side-effect execution (workers/providers).

## Decision
We adopt the **"Durable Moonstone + Outbox/Inbox" architecture** as our core execution model.

1. **Pure Moonstone Transitions**: Moonstones/Statecharts must operate as pure functions. A state transition `(State, Event) -> (NextState, Commands[])` must evaluate instantly in memory and perform **zero side-effects**.
2. **Outbox Pattern (Commands)**: Any interaction with the outside world (e.g., calling an LLM, querying a DB, spawning a sub-agent) is yielded as an `OperationCommand`.
3. **Inbox Pattern (Receipts)**: The `Orchestrator` handles routing these commands to the `ProviderProxy` and pauses the agent's state execution. When the provider finishes, it returns an `OperationReceipt` to the Orchestrator, which injects the receipt back into the Moonstone as an event.
4. **Correlation IDs**: Every Command and Receipt must carry a deterministic `CorrelationId` and `SessionKey` for safe state re-hydration and multi-agent routing.
5. **Event Journaling**: All transitions, commands, and receipts must be append-only journaled (initially in `ActorStore`) to allow perfect determinism upon replay/resume.

## Consequences
* **Positive**: We achieve Temporal-like crash resilience and auditable state tracks without the weight of deploying a distributed consensus engine.
* **Positive**: `PF-RUNTIME-003` parity testing can easily prove crash resilience by intentionally wiping memory, reloading the ActorStore, and asserting zero duplicate API calls.
* **Negative**: Agent and Tool implementation logic becomes more verbose, as inline `await` calls to providers inside state handlers are strictly prohibited. Developers must explicitly yield a command and wait for a receipt.

## References
* "Event Sourcing & Replay" - Azure Durable Functions / Temporal Architecture
* "Outbox Pattern" / "Append-only Log" - Camunda Zeebe Architecture
* "Wait for Task Token" - AWS Step Functions
