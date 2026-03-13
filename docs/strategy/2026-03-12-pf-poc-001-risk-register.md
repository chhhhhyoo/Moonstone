# PF-POC-001 Risk Register (2026-03-12)

## Key Risks

| risk_id | description | likelihood | impact | mitigation | owner | status |
|---|---|---|---|---|---|---|
| POC-001 | Compiler generates artifact shapes that pass JSON checks but fail runtime assumptions | low | high | Canonical artifact validator plus compile/validate integration tests | core | done |
| POC-002 | Crash occurs after command emission and before receipt persistence, creating duplicate side-effect risk | low | critical | Replay + resume path with deterministic idempotency keys and crash-injection tests | core | done |
| POC-003 | Retry policy drifts across nodes due to inconsistent default/override precedence | low | medium | Single retry resolver with unit tests for cap/backoff behavior | core | done |
| POC-004 | OpenAI/HTTP connector failures become opaque and block debugging | low | high | Structured receipt error payloads and inspect timeline command | core | done |
| POC-005 | Governance drift reintroduces stale PF-RUNTIME assumptions in active planning artifacts | low | medium | Milestone/action hard reset and supersession markers in legacy docs | governance | done |
| POC-006 | Crash during multi-edge continuation fan-out may enqueue only a subset of downstream nodes | low | high | Persist continuation decision atomically and replay fan-out deterministically with crash-injected conformance tests | core | done |
| POC-007 | Prompt compiler can emit low-signal branching shapes for non-trivial natural-language prompts | medium | high | Expand compiler heuristics plus branch-focused fixtures with strict validation gates | core | done |
| POC-008 | Compiler may silently fall back to default linear graph when prompt intent is not fully understood, masking quality gaps | medium | high | Add deterministic compile diagnostics that expose applied inferences and fallback warnings | core | done |
| POC-009 | Narrow test prompts may hide regressions against realistic prompt distribution and branch combinations | medium | high | Build and enforce a golden fixture corpus for compile outputs across supported branch modes | core | done |
| POC-010 | Compile-level quality can mask runtime branch behavior drift if fixtures are not executed through command/receipt path | medium | high | Add compile-to-runtime fixture execution matrix with deterministic outcome assertions under strict verification | core | done |
| POC-011 | Runtime branch correctness under nominal paths can still fail under connector fault windows and retry exhaustion edges | medium | high | Add fault-injection matrix over compiled fixtures to assert retry/failure-edge/recovery determinism | core | done |
| POC-012 | Even with green quality gates, adoption can stall without an operator-facing runbook and deterministic demo qualification pack | medium | medium | Build demo-run qualification checklist and operator runbook tied to strict verification evidence | core | done |
| POC-013 | Webhook ingress can silently break deterministic replay triage when run-id override handling is undefined or untested end-to-end | medium | high | Add webhook E2E qualification matrix with header-based run-id override and replay/inspect continuity assertions | core | done |
| POC-014 | Interruption recovery can remain operationally brittle when `resume` is runtime-internal only and lacks CLI/operator qualification proof | medium | high | Add first-class `poc:resume` command and crash-recovery qualification matrix tied to strict verification evidence | core | done |
| POC-015 | Prompt-based pilot can appear “agentic” while still hiding generated tool intent, making correctness and reproducibility hard to review | medium | high | Emit deterministic tool-blueprint output from compiler/pilot and qualify with CLI-level conformance gates | core | done |
| POC-016 | Promptable builder can still be template theater if prompts with multiple ordered tool calls collapse into one fixed HTTP action | medium | high | Add deterministic multi-tool prompt synthesis path, expose ordered generated tools, and qualify compile/run behavior under strict conformance gates | core | done |
| POC-017 | Multi-step prompt chains can still be operationally weak if downstream tool calls do not consume upstream outputs deterministically | medium | high | Introduce deterministic upstream-output propagation in synthesized tool chains and enforce with runtime conformance evidence | core | in_progress |

## Trigger Conditions

1. Any workflow run emits side effects without a journaled command event.
2. Replay of the same run-id yields non-deterministic pending-command state.
3. New connector or runtime files land outside static/lint/test coverage.
4. A branching node has multiple true edges and replay after crash executes only a subset.
5. Compiler output for branching prompts lacks deterministic conditional routes.
6. Compiler inference/fallback choices are not visible to operator during compile.
7. Compile behavior drifts on realistic prompts not represented in unit cases.
8. Compiled artifacts pass compile gates but execute unexpected branch path at runtime.
9. Fault-injected runs diverge from expected retry/failure deterministic behavior.
10. Team cannot reproduce or present POC quality state quickly from CLI evidence.
11. Webhook-triggered runs cannot be deterministically correlated across trigger response, inspect timeline, and replay output.
12. Interrupted runs require ad hoc scripts instead of a canonical CLI resume path, increasing recovery variance.
13. Pilot users cannot inspect what tools were generated from prompt intent, causing product-fit feedback to be noisy and non-actionable.
14. Prompts that describe multiple tool calls still compile to single-step workflows, creating false confidence about promptable tool creation capability.
15. Synthesized multi-tool chains execute in order but may still ignore prior-step outputs, undermining practical agentic value.

## Exit Criteria For Risk Closure

1. POC-001: closed when compile + validate + runtime conformance tests are green.
2. POC-002: closed when command/receipt/retry crash-injection resume tests are stable in strict verification.
3. POC-003: closed when retry/default precedence and backoff capping are unit-tested.
4. POC-004: closed when `poc:inspect` exposes actionable timeline diagnostics.
5. POC-005: closed when canonical strategy trackers remain POC-first for one full milestone.
6. POC-006: closed when fan-out continuation decisions are persisted/replayed as one deterministic step and strict verification remains green.
7. POC-007: closed when branch-oriented compiler fixtures and strict verification are green.
8. POC-008: closed when compile diagnostics and fallback warning paths are covered by tests and strict verification.
9. POC-009: closed when golden compile fixtures cover supported branch modes and are enforced by strict verification.
10. POC-010: closed when compile fixtures are runtime-executed with deterministic branch outcome assertions in strict verification.
11. POC-011: closed when fault-injection runtime matrix validates retry/failure/recovery outcomes deterministically under strict verification.
12. POC-012: closed when demo runbook and qualification checklist are executable and mapped to strict verification evidence.
13. POC-013: closed when webhook E2E qualification validates health, trigger, run-id override, inspect, and replay continuity under strict verification.
14. POC-014: closed when `poc:resume` is operator-accessible and crash-recovery qualification proves deterministic resume behavior under strict verification.
15. POC-015: closed when prompt-derived tool blueprints are emitted deterministically and qualified in pilot conformance plus strict verification.
16. POC-016: closed when multi-tool prompt intents compile to deterministic sequential tool chains and execute with strict qualification evidence.
17. POC-017: closed when synthesized downstream tool commands consume upstream outputs deterministically and qualification evidence is green under strict verification.
