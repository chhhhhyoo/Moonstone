# PF-POC-008 Operator Runbook (CLI-First)

## Goal

Provide deterministic operator proof for compile/run/replay/inspect behavior using executable CLI evidence.

## Fast Qualification (Recommended)

Run the demo qualification matrix:

```bash
npm run poc:qualify:demo
```

This command executes all required scenario classes:

1. `happy-sequential`
2. `branch-comparator-true`
3. `retry-recovery-success`
4. `failure-branch-fallback`

Acceptance condition: all subtests pass and no scenario is skipped.

Run webhook E2E qualification matrix:

```bash
npm run poc:qualify:webhook
```

Webhook acceptance condition: health + trigger + inspect + replay coverage pass with deterministic run-id behavior.

Run resume CLI qualification matrix:

```bash
npm run poc:qualify:resume
```

Resume acceptance condition: crash-interrupted run resumes through `poc:resume` with deterministic inspect/replay continuity.

## Manual Triage Flow

Use this flow when debugging one workflow by hand.

1. Compile prompt to artifact + diagnostics:

```bash
npm run poc:compile -- \
  --prompt "When input.amount > 100 summarize premium order otherwise summarize standard order" \
  --http-url "https://example.internal/vendor" \
  --out ".moonstone/artifacts/demo-branch.json" \
  --diagnostics-out ".moonstone/artifacts/demo-branch.diagnostics.json"
```

2. Validate artifact contract:

```bash
npm run poc:validate -- --artifact ".moonstone/artifacts/demo-branch.json"
```

3. Run with explicit run ID (required for deterministic inspection):

```bash
npm run poc:run -- \
  --artifact ".moonstone/artifacts/demo-branch.json" \
  --input '{"amount": 120, "text": "demo"}' \
  --journal-dir ".moonstone/poc-journal" \
  --run-id "demo-branch-001"
```

4. Inspect command/receipt timeline:

```bash
npm run poc:inspect -- --run-id "demo-branch-001" --journal-dir ".moonstone/poc-journal"
```

5. Replay state from journal:

```bash
npm run poc:replay -- --run-id "demo-branch-001" --journal-dir ".moonstone/poc-journal"
```

6. Resume interrupted run from journal (when status remains `running`):

```bash
npm run poc:resume -- --run-id "demo-branch-001" --journal-dir ".moonstone/poc-journal"
```

## Webhook E2E Flow (Deterministic Run ID)

1. Start serve runtime with explicit run-id header contract:

```bash
npm run poc:serve -- \
  --artifact ".moonstone/artifacts/demo-branch.json" \
  --host "127.0.0.1" \
  --port "3100" \
  --journal-dir ".moonstone/poc-journal" \
  --run-id-header "x-moonstone-run-id"
```

2. Health check:

```bash
curl -sS "http://127.0.0.1:3100/health"
```

3. Trigger with deterministic run-id header:

```bash
curl -sS -X POST "http://127.0.0.1:3100/hooks/demo-branch" \
  -H "content-type: application/json" \
  -H "x-moonstone-run-id: webhook-demo-001" \
  -d '{"amount":120,"text":"demo"}'
```

4. Inspect/replay with same run-id:

```bash
npm run poc:inspect -- --run-id "webhook-demo-001" --journal-dir ".moonstone/poc-journal"
npm run poc:replay -- --run-id "webhook-demo-001" --journal-dir ".moonstone/poc-journal"
```

## Troubleshooting Map (Risk-Linked)

| symptom | likely root | command path | linked_risk_id |
|---|---|---|---|
| Compile returns warning about unsupported conditional intent | Prompt did not match supported comparator/exists patterns | `poc:compile` diagnostics output | `POC-008` |
| Replay state does not match run summary | Journal continuity or continuation recovery drift | `poc:inspect` + `poc:replay` | `POC-002`, `POC-006` |
| Retry behavior differs from expected attempts | Retry/backoff/idempotency policy drift | `poc:run` + `poc:inspect` | `POC-003`, `POC-011` |
| Demo cannot be reproduced quickly | Operator runbook/fixtures not aligned with strict gates | `poc:qualify:demo` | `POC-012` |
| Webhook response runId does not match requested header | Ingress did not apply deterministic run-id override | `poc:qualify:webhook` + `poc:inspect` | `POC-013` |
| Interrupted run remains stuck in `running` with pending command | Resume path is missing or journal recovery contract drifted | `poc:resume` + `poc:replay` + `poc:qualify:resume` | `POC-014` |

## Source Of Truth

1. Qualification test: `test/integration/conformance/poc-demo-runbook-qualification.conformance.test.mjs`
2. Scenario fixtures: `test/fixtures/poc/poc-demo-runbook-fixtures.json`
3. Qualification criteria: `test/fixtures/poc/poc-demo-quality-criteria.json`
4. Webhook E2E test: `test/integration/conformance/poc-webhook-e2e-qualification.conformance.test.mjs`
5. Webhook E2E fixtures/criteria:
   - `test/fixtures/poc/poc-webhook-e2e-fixtures.json`
   - `test/fixtures/poc/poc-webhook-e2e-quality-criteria.json`
6. Resume CLI qualification test: `test/integration/conformance/poc-resume-cli-qualification.conformance.test.mjs`
