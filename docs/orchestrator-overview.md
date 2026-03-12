# Orchestrator Overview

## Purpose And Boundaries

Moonstone now operates two runtime slices:

1. Legacy intake orchestration (historical bootstrap slice).
2. PF-POC-001 workflow runtime (`WorkflowRuntime`) for CLI/webhook graph execution.

The canonical active direction is PF-POC-001. Runtime execution is command/receipt-driven and journal-first.

## Flow At A Glance (PF-POC-001)

1. Prompt or JSON artifact enters via `poc:compile` / `poc:validate`.
2. Runtime starts a run journal (`run_started`).
3. Graph routing enqueues node execution from `trigger.webhook` edges.
4. Runtime emits `OperationCommand` envelopes per node execution.
5. Connector executors (`action.http`, `action.openai`) perform side effects.
6. Runtime records `OperationReceipt` envelopes.
7. Edge routing chooses next nodes using `always|success|failed` + declarative conditions.
8. `run_finished` closes the run.

## Replay And Recovery

1. `poc:replay` rebuilds run state from append-only journal events.
2. Pending commands (emitted without receipt) are surfaced explicitly.
3. Resume path re-dispatches pending commands with deterministic idempotency keys.
4. `poc:inspect` shows timeline diagnostics for verification and debugging.

## Can / Cannot / Currently Does

### Can

1. Execute sequential + branch + retry workflow graphs.
2. Persist command/receipt timeline in file-backed append-only journals.
3. Run through CLI (`poc:run`) and webhook ingress (`poc:serve`).

### Cannot (v0)

1. Provide visual drag/drop canvas authoring.
2. Orchestrate multi-agent handoff workflows.
3. Model human wait-state orchestration.

### Currently Does

1. Supports `trigger.webhook`, `action.http`, and `action.openai`.
2. Enforces declarative artifact validation before execution.
3. Includes crash-injection replay/resume conformance tests.

## Verification Confidence

Confidence comes from fresh `verify` / `verify:strict` evidence, including POC runtime tests.
