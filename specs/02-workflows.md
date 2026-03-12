# Workflows

## New Request Flow

1. `poc:compile` converts prompt intent into a `WorkflowArtifact`.
2. `poc:validate` enforces trigger/node/edge/retry contract validity.
3. `poc:run` or `poc:serve` loads artifact and initializes a run journal entry.
4. Runtime evaluates graph progression as pure state transitions and emits an `OperationCommand`.
5. Connector executor (`action.http`/`action.openai`) performs side effects.
6. Runtime persists an `OperationReceipt` and routes to next node by edge rules (`always|success|failed` + condition).
7. Terminal state is recorded with `run_finished`.

## Resume Flow (Inbox/Receipt)

1. `poc:replay` reconstructs run state from append-only journal events.
2. Pending command windows (`command_emitted` without `receipt_recorded`) are surfaced explicitly.
3. Resume path re-dispatches pending commands with deterministic idempotency keys.
4. Runtime continues queue processing and records final status.

## Failure Flow

1. Connector failure yields a failure `OperationReceipt` and retry decision.
2. Retry uses capped exponential backoff and deterministic `(runId,nodeId,attempt)` idempotency key.
3. On retry exhaustion, failure edges are evaluated; missing failure path marks terminal failure.
4. `poc:inspect` exposes full event timeline for diagnosis.
