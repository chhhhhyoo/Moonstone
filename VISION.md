# Moonstone Vision

Moonstone is a runtime-first orchestration platform that coordinates multi-step agent flows with explicit contracts, recoverable session state, and verifiable governance. Our North Star is a production-grade, state-of-the-art workflow orchestration system that combines the authoring ease of graphs/prompts with the deterministic reliability of durable execution.

## Target Outcomes

1. Transport-agnostic orchestration core with strict adapter boundaries
2. Durable Actor Runtime utilizing pure Moonstone transitions for crash-safe, deterministic state progression
3. Strict side-effect isolation via an Outbox/Inbox (Command/Receipt) pattern, completely decoupled from Moonstone evaluation
4. Spec and verification gates that fail closed when drift appears
5. Durable, repo-local engineering memory that prevents repeated mistakes

## Non-Goals

1. No shell-monolith orchestration
2. No transport-specific business logic in core orchestration
3. No external vault as canonical project memory
4. No direct async side-effects inside Moonstone state transitions
