# PF-POC-001 Risk Register (2026-03-12)

## Key Risks

| risk_id | description | likelihood | impact | mitigation | owner | status |
|---|---|---|---|---|---|---|
| POC-001 | Compiler generates artifact shapes that pass JSON checks but fail runtime assumptions | medium | high | Canonical artifact validator plus compile/validate integration tests | core | in_progress |
| POC-002 | Crash occurs after command emission and before receipt persistence, creating duplicate side-effect risk | medium | critical | Replay + resume path with deterministic idempotency keys and crash-injection tests | core | in_progress |
| POC-003 | Retry policy drifts across nodes due to inconsistent default/override precedence | medium | medium | Single retry resolver with unit tests for cap/backoff behavior | core | in_progress |
| POC-004 | OpenAI/HTTP connector failures become opaque and block debugging | medium | high | Structured receipt error payloads and inspect timeline command | core | in_progress |
| POC-005 | Governance drift reintroduces stale PF-RUNTIME assumptions in active planning artifacts | medium | medium | Milestone/action hard reset and supersession markers in legacy docs | governance | in_progress |

## Trigger Conditions

1. Any workflow run emits side effects without a journaled command event.
2. Replay of the same run-id yields non-deterministic pending-command state.
3. New connector or runtime files land outside static/lint/test coverage.

## Exit Criteria For Risk Closure

1. POC-001: closed when compile + validate + runtime conformance tests are green.
2. POC-002: closed when crash-injection resume tests are stable in strict verification.
3. POC-003: closed when retry/default precedence and backoff capping are unit-tested.
4. POC-004: closed when `poc:inspect` exposes actionable timeline diagnostics.
5. POC-005: closed when canonical strategy trackers remain POC-first for one full milestone.
