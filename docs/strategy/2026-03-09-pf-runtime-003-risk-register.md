# PF-RUNTIME-003 Risk Register (2026-03-09)

## Key Risks

| risk_id | description | likelihood | impact | mitigation | owner | status |
|---|---|---|---|---|---|---|
| R003-01 | Moonstone side-effects leak into evaluation loop (breaking determinism) | high | critical | Static checks for pure functions; refactor BaseFsmAgent to return Commands | core | open |
| R003-02 | Correlation ID collisions or routing failures in multi-agent interleaving | medium | high | Strict UUID/SessionKey schema; dual-agent pressure tests | core | open |
| R003-03 | Command/Receipt dual-write failure (Orchestrator crash after Moonstone transition but before Command relay) | medium | high | Durable Outbox journaling in ActorStore; resume-from-last-event logic | core | open |
| R003-04 | Incremental TS/ESLint scope leaves untyped edges in contract boundaries | high | medium | Prioritize ACT-008 expansion for Command/Receipt/CorrelationId types | core | open |
| R003-05 | In-flight versioning breakage (Moonstone definition updates while session sleeps) | medium | high | Immutable artifact versioning; pinned artifactId in RunContext | core | open |

## Trigger Conditions

1. Any direct async `await` detected inside an Agent's machine evaluation logic.
2. CI failure in parity/resume tests or correlation ID routing.
3. Strategy trackers moving status without evidence of durable-execution compliance.

## Exit Criteria For Risk Closure

1. `R003-01`: Closed when BaseFsmAgent is strictly pure and all side-effects are externalized as Commands.
2. `R003-02` and `R003-03`: Closed when two-agent crash/resume tests pass in CI.
3. `R003-05`: Closed when RunContext explicitly carries an immutable artifact version.
