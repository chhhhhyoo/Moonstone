# SPEC

## Purpose

Define the executable contract for Moonstone v0.1 bootstrap.

## Source of Truth

Priority order:

1. Runtime code in `src/`
2. This file and `specs/*.md`
3. Historical docs

## Architecture Baseline

1. Core orchestration is transport-agnostic and relies on a **Durable Actor Runtime**.
2. Adapters normalize ingress into `ConversationContext`.
3. Agents are Moonstone-driven; state transitions are **pure functions** evaluating instantly with zero async side-effects.
4. Provider interfaces are defined in core; side effects are strictly externalized.
5. Side-effectful steps operate on an **Outbox/Inbox pattern**: Agents yield `OperationCommand`s, Orchestrator executes them via Provider Proxies, and resumes the Agent with an `OperationReceipt` using Correlation IDs.
6. POC workflow execution is artifact-driven (`WorkflowArtifact`) with explicit node/edge routing semantics: sequential + branch + retry.
7. POC connectors are scoped to `trigger.webhook`, `action.http`, and `action.openai`.
8. POC runtime journaling is append-only and file-backed for replay and inspection.
9. Webhook ingress supports optional deterministic run-id override via `x-moonstone-run-id`; when absent, runtime-generated run IDs are used.

## Required Contracts

Defined in [src/core/contracts.mjs](src/core/contracts.mjs):

- `ConversationContext`
- `AgentIntent`
- `AgentDefinition`
- `AgentRunResult`
- `AgentFsmContract`
- `ActorAddress`
- `RunContext`
- `CommandEnvelope`
- `ReceiptEnvelope`
- `WorkflowArtifact`
- `PocOperationCommand`
- `PocOperationReceipt`
- `ArtifactVersion`
- `MessagingProvider`
- `DomainProvider`
- `ProviderProxy`
- `SessionKey`
- `OperationReceipt`
- `SpecImpactRecord` (doc contract under `notes/spec-impact`)

## Verification Tiers

See [docs/governance/verification-tier-policy.md](docs/governance/verification-tier-policy.md).

### Immediate commands

- `npm run verify`
- `npm run verify:strict`
- `npm run poc:compile -- --prompt "..."`
- `npm run poc:validate -- --artifact <path>`
- `npm run poc:run -- --artifact <path> --input <path|json>`
- `npm run poc:serve -- --artifact <path>`
- `npm run poc:serve -- --artifact <path> [--run-id-header <name>]`
- `npm run poc:replay -- --run-id <id>`
- `npm run poc:inspect -- --run-id <id>`
- `npm run check:type`
- `npm run check:lint`
- `npm run check:contracts`
- `npm run check:pr-governance`
- `npm run check:prepush-fast`

## PR Governance Contract

1. Branch and PR naming are canonicalized in [docs/governance/pr-branch-policy.md](docs/governance/pr-branch-policy.md).
2. Machine-readable policy lives in `config/governance/pr-policy.json`.
3. Scope routing contract lives in `config/governance/verification-scope-map.json`.

## Change Control

Public contract changes require, in the same change set:

1. spec updates,
2. tests,
3. `notes/spec-impact/*.md` entry.
