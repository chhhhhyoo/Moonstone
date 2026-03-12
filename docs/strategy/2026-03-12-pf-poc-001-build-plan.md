# PF-POC-001 Build Plan (2026-03-12)

## Objective

Deliver a runnable CLI-first workflow-builder POC in 10 working days with command/receipt execution, append-only run journaling, and replay-safe runtime behavior.

## Canonical Product Scope (v0)

1. Runtime semantics: sequential + branch + retry only
2. Trigger and connectors: `trigger.webhook`, `action.http`, `action.openai`
3. Interfaces:
   - `npm run poc:compile -- --prompt "..."`
   - `npm run poc:validate -- --artifact <path>`
   - `npm run poc:run -- --artifact <path> --input <path|json>`
   - `npm run poc:serve -- --artifact <path>`
   - `npm run poc:replay -- --run-id <id>`
   - `npm run poc:inspect -- --run-id <id>`

## Supersession

`PF-RUNTIME-003` remains historical context but is no longer the active canonical strategy stream. PF-POC-001 is authoritative for near-term delivery.

## Acceptance Criteria

1. Prompt compile path emits schema-valid workflow artifacts.
2. Runtime executes graph nodes through command/receipt envelopes (no inline side-effect logic in transition evaluation).
3. Retry/backoff/idempotency are deterministic and covered by tests.
4. Replay reconstructs run state from append-only journal.
5. Strict verification includes new POC runtime tests and static checks.

## Out Of Scope

1. Visual canvas UI
2. Multi-agent handoff choreography
3. Human-in-the-loop waiting states
4. Persistent database-backed journal (file-backed is sufficient for POC)
