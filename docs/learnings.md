# Learnings

## 2026-03-09: Bootstrap Contracts Before Features

- Runtime contracts were defined before adding multiple agents.
- Governance was implemented as executable checks, not prose-only policy.
- Passive context index was enforced by generation and freshness checks.

## 2026-03-10: Command Migration Requires Protocol Extraction, Not Text Copy

- Gemini command files often describe intent, but real behavior lives across skills, hooks, and routing policy.
- Safe migration to Codex should map one artifact at a time and log dependency edges explicitly before editing.
- Hook-enforced guarantees must be re-expressed as skill rules plus governance routing when runtime hook APIs differ.

## 2026-03-10: For Coupled Commands, Migrate the Whole Skill Package First

- If a command depends on companion scripts/config/references, command-only translation silently drops capability.
- Copying the full package first and then rewriting SKILL instructions is lower risk than re-authoring files piecemeal.
- Deliberation workflows need explicit disagreement logging to avoid "consensus theater" in technical decisions.

## 2026-03-10: Re-Validation Skills Must Force Fresh Evidence

- A "double-check" mode without explicit claim-by-claim evidence gathering does not reduce hallucination risk enough.
- Verification routing should include an interrupt skill (`doubt`) so challenged claims follow a mandatory correction loop.

## 2026-03-10: Bootstrap Commands Need Overwrite Guards

- Planning-file bootstrap is useful, but blindly re-templating active files can destroy critical context.
- Migration should preserve command intent while adding fail-safe behavior around existing memory artifacts.

## 2026-03-10: Filename Parity Is Inferior To Behavior Parity

- When source playbooks reference missing docs, preserving filenames produces brittle workflows with fake compliance.
- Better migration strategy: preserve decision/verification behavior and remap references to current canonical documents.

## 2026-03-10: Runtime Command Migration Needs Topology Checks First

- A local-run command from another repo is often invalid even if syntax is correct.
- Migration should detect actual entrypoints and map to repo-native execution truth (tests/gates) before preserving command text.

## 2026-03-10: Ship Flows Must Be Verification-Tier Aware

- A generic "run verify then ship" flow is too weak for runtime-scope changes under fail-closed governance.
- Shipping workflows should bind to scope classification and escalate to strict gates automatically.

## 2026-03-10: Canonical Gate Reuse Beats Legacy Script Emulation

- If source commands reference retired scripts, emulating them reintroduces maintenance debt.
- Migration should route through the current canonical gate command and preserve behavior at policy level.

## 2026-03-10: Separate Standard vs Strict Verification Intents

- Collapsing strict and non-strict verification into one workflow encourages accidental under-verification.
- Explicit strict-tier commands/skills keep release confidence proportional to runtime risk.

## 2026-03-10: Session Wrap Is A Governance Control, Not A Courtesy

- Treating wrap-up as optional summary text causes silent memory loss and weak handoffs.
- A mandatory closeout protocol should reconcile transient artifacts into durable logs every material session.

## 2026-03-10: Hookless Runtimes Need Guard Substitution

- When platform hooks are unavailable, translate blocking behavior into canonical verification guards.
- Document the enforcement delta explicitly so teams understand what moved from runtime to verification-time control.

## 2026-03-10: Auto-Mutation Hooks Should Become Explicit Hygiene Steps

- Hidden post-turn auto-fix behavior can obscure causality in session diffs.
- Migrating to explicit lint-fix steps in closeout flow improves traceability and operator control.

## 2026-03-10: Prefer Native Index Pipelines Over Legacy Map Generators

- If a native indexing command already exists, hook migration should reuse it instead of duplicating generator logic.
- Add explicit aliases only for operator discoverability, not for maintaining parallel map systems.

## 2026-03-10: Shared Hook State Should Become A Reusable Utility

- Cross-cutting hook state (active skill, verification timestamps) should not be duplicated across ad hoc shell scripts.
- A single state utility with stable schema improves later migration of evidence and sequencing hooks.

## 2026-03-10: Sequence Constraints Should Be Testable Preflight Guards

- Hidden hook-time sequencing logic is hard to audit and hard to reuse in CI.
- Expressing prerequisites as explicit commands makes constraints observable and enforceable across environments.

## 2026-03-10: Verification Integrity Needs Tracking + Freshness, Not Just Pass Logs

- Recording a pass once is insufficient; completion claims need recency guarantees.
- Wrapping canonical verification commands to update state reduces drift between actual checks and claimed status.

## 2026-03-10: Convert Heuristic Reminders Into Explicit Governance Rules

- In environments without response hooks, reminder logic should become auditable policy contracts.
- Clear mandatory rules outperform best-effort reminder heuristics for long-session reliability.

## 2026-03-10: Migrate Generators By Convergence, Not Duplication

- When a native generator already exists, merge missing source behaviors into that generator instead of maintaining parallel outputs.
- Keep a fail-closed empty-output guard in generated context maps to prevent silent wipeouts during path or topology drift.

## 2026-03-10: Central Hook Settings Need A Policy Twin After Hook Migration

- Migrating hooks one-by-one is not enough; the original settings-level orchestration contract still needs a centralized Codex-native artifact.
- A policy file plus integrity guard is a better replacement than attempting to simulate missing runtime hook callbacks.

## 2026-03-10: Deliberation Skills Need Forced Execution Handoffs

- Council-style analysis loses value when it does not force a concrete next action; synthesis alone is not an execution artifact.
- Preserve per-persona evidence requirements during migration or the "multi-perspective" workflow degrades into style, not substance.

## 2026-03-10: Missing Skill Dependencies Need Explicit Fallback Contracts

- When source skills depend on yet-to-be-migrated skills, capture deterministic fallback chains to available local skills instead of leaving implicit broken choreography.
- This keeps migration sequential while preserving behavioral value until dependent slices are completed.

## 2026-03-10: Migrate Command-Assuming Skills Against Canonical Repo Gates

- Skills imported from other repos often assume command names that do not exist locally.
- Preserve workflow intent, but remap gate execution to canonical project commands to avoid fake-operational skills.

## 2026-03-10: Template-Bound Validators Must Be Retargeted To Local Canonical Structure

- Copying a validator that expects foreign spec headings creates a gate that always fails and teaches users to ignore checks.
- During migration, keep the validation purpose but remap required structure checks to this repo's canonical document contract.

## 2026-03-11: Durable Execution & Outbox Patterns (SOTA Research)

- **Insight**: Production-grade orchestration requires strict separation of control plane (Moonstone) from execution plane (Providers).
- **Pattern**: **Pure Moonstone transitions** must yield `Commands` rather than executing async side-effects.
- **Pattern**: **Idempotency Keys** should be derived from `SessionKey + CommandId` to ensure safe retries across process restarts.
- **Pattern**: **Task Tokens** (opaque strings) should be used for long-running callbacks (Human-in-the-loop, slow tool calls).
- **Audit**: Every command must be journaled in an event log before being dispatched to a provider (Transactional Outbox).

## 2026-03-11: Skill Rubric Enforcement Is Critical For Protocol Consistency

- Placeholder skills with only name/description are too shallow for production-grade agent governance.
- A mandatory quality rubric (Purpose, Protocol, Exit Protocol) ensures that agent behavior is driven by durable instructions rather than ad-hoc heuristics.
- Automated link integrity checks in skill files prevent "documentation rot" where skills point to retired or renamed specs.
- Durable memory markers in `Exit Protocol` guarantee that every material session contributes to the project's long-term intelligence.

## 2026-03-11: Blocker Tracking Needs Re-Validation, Not Assumptions

- A recurring verification failure can clear once dependent skill/template migrations converge; always rerun full gates before carrying old blocker status forward.
- Migrating a skill without its referenced assets/scripts creates temporary governance noise that disappears only after dependency-chain closure.

## 2026-03-11: Commit Hygiene Should Be Its Own Workflow Stage

- Release readiness and commit crafting solve different risks; combining them blurs intent and increases staging mistakes.
- Explicit logical-unit staging plus Conventional Commit drafting improves auditability before branch closeout decisions.

## 2026-03-11: Clarification Protocols Fail Quietly When Phase Structure Is Compressed

- Summarizing a clarification skill too aggressively removes enforcement detail (especially interactive-pause and gap-selection discipline).
- Keep concise wording, but preserve explicit phase gates wherever ambiguity handling controls execution safety.

## 2026-03-11: Strict Commit Workflows Need Fresh Full-Gate Evidence

- High-integrity commit flows should require fresh verification in the same session, not trust earlier "green" assumptions.
- Cluster approval before `git commit` materially reduces accidental cross-concern history pollution.

## 2026-03-11: User Comprehension Is A Distinct Quality Gate

- Post-delivery understanding checks should be explicit workflow stages, not ad hoc explanations.
- Tracking comprehension tasks in the same planning surface improves closeout clarity and accountability.

## 2026-03-12: Workflow POCs Need Contract-First Runtime Before UX Expansion

- Fast POC delivery still benefits from strict `artifact -> command -> receipt -> journal` boundaries; skipping this just defers risk into opaque debugging later.
- Replay safety improves drastically when command emission is persisted before side-effect execution, even in file-backed journals.
- Limiting first POC semantics to sequential + branch + retry provides meaningful product signal without premature parallel/human-wait complexity.

## 2026-03-12: Crash Injection Tests Expose Real Resume Risks Early

- A deliberate crash window (`after command emission, before receipt`) is a high-value test seam for orchestration runtimes.
- Resume correctness depends on treating emitted-without-receipt commands as first-class pending work, not as incidental log noise.

## 2026-03-12: Resume Logic Must Reconcile Missing Continuations, Not Just Pending Commands

- Replaying only queued nodes and pending commands is insufficient; crashes after `receipt_recorded` or `retry_scheduled` can strand runs with no visible pending work.
- Resume should infer continuation from the last persisted receipt/retry intent when state is `running` but queue and pending sets are empty.

## 2026-03-12: Fan-Out Needs Planned-Then-Applied Journal Semantics

- Multi-edge continuation is not safe if replay only trusts observed queue entries; crashes mid-enqueue can silently drop branches.
- Persisting a continuation plan first, then reconciling missing nodes on resume, is a low-cost way to avoid branch-loss without introducing full transactional storage.

## 2026-03-12: JS Strict Type Safety Needs Explicit Union Typing In Mixed Draft Arrays

- With `checkJs` enabled, array literal inference can freeze to the first element shape and reject later union members (for example HTTP node config vs OpenAI node config).
- For compiler-style builders that push heterogeneous node types, add explicit JSDoc union typing up front so strict type checks reflect intended schema breadth.

## 2026-03-12: Conditional Branching In Fan-Out Runtimes Needs Explicit Inverse Conditions For If/Else Semantics

- In a fan-out edge model, adding a conditional edge plus an unconditional fallback edge causes double execution when the condition is true.
- For compiler-generated if/else behavior, emit two explicit complementary conditions (`op` and inverse `op`) so branch execution remains deterministic and mutually exclusive.

## 2026-03-12: Fail-Closed Compilers Still Need Visible Diagnostics

- A deterministic fallback to default graph shape is safer than guessing, but silent fallback hides prompt/artifact mismatch risk.
- Exposing inference mode and warnings at compile time catches bad prompt contracts earlier and reduces runtime debugging churn.

## 2026-03-12: Narrow Unit Cases Are Not Enough For Prompt Compilers

- Deterministic unit tests on isolated prompts can still miss regressions across realistic prompt classes.
- A fixture corpus plus golden matrix assertions provides broader regression signal without introducing nondeterministic snapshot noise.

## 2026-03-12: Quality Criteria Should Be Data, Not Tribal Process

- A written quality checklist is insufficient unless thresholds are machine-enforced against fixture data.
- Encoding qualification gates as a criteria JSON + gate test keeps recursive TDD loops honest and fail-closed.

## 2026-03-12: Compile Correctness Is Not Runtime Correctness

- A compiler can emit structurally valid artifacts while still routing to unexpected branches at execution time.
- Add compile-to-runtime matrix tests with deterministic connector stubs to verify actual executed node paths and attempts.

## 2026-03-12: Recovery Guarantees Need Fault-Window Tests, Not Just Happy/Fail Paths

- Retry/failure logic that passes nominal tests can still break when crashes happen at persistence boundaries.
- Include injected crash points in runtime matrix tests so `resume` determinism is proven under fault windows.

## 2026-03-13: Operator Readiness Must Be Enforced By Tests, Not Runbook Prose

- A runbook without an executable qualification matrix drifts quickly and becomes trust theater.
- Encode operator expectations (scenario IDs, command coverage, event coverage) in data-driven criteria files so regressions fail closed.

## 2026-03-13: Deterministic Run IDs Are Required For Repeatable Triage

- Inspect/replay workflows are weaker if run IDs are random-only because evidence chains become manual and error-prone.
- Optional explicit run IDs in CLI execution are a low-cost contract that materially improves debugging and qualification reproducibility.

## 2026-03-13: Ingress Determinism Needs E2E Proof, Not Unit Confidence

- A webhook route can be healthy while still violating correlation guarantees if run-id override semantics are not tested end-to-end.
- Health + trigger + inspect + replay must be validated in one gate to prove operator-grade reproducibility.

## 2026-03-13: Post-Merge Tracker Refresh Must Close The Risk/Action Pair, Not Just The Milestone

- Marking only the milestone as done leaves governance drift if linked action/risk IDs remain in-progress.
- Every merge closure refresh should update milestone, future action, and risk register together before activating the next slice.

## 2026-03-13: Product Signal Needs A One-Command Pilot Lane

- Teams lose confidence when every change is another gate but there is no fast end-to-end “does this feel right?” workflow.
- A pilot command that compiles, runs, inspects, and replays in one flow exposes product gaps much faster than documentation reviews.

## 2026-03-13: Promptable Tool Creation Must Be Explicit, Not Implied

- A prompt-to-run flow is not enough for product-fit evaluation if generated tool intent is hidden in node internals.
- Emitting deterministic tool-blueprint artifacts (`generatedTools` and `tools.json`) makes pilot feedback actionable because reviewers can inspect what was actually created.

## 2026-03-13: Recovery Features Need CLI-Level Qualification, Not Runtime-Only Tests

- Runtime `resume` correctness is necessary but insufficient for operator confidence if no first-class CLI contract exists.
- A crash->`poc:resume`->inspect/replay conformance gate catches integration drift between journal state, connector dispatch, and operator command surfaces.

## 2026-03-13: Promptable Tool Creation Needs Ordered Multi-Step Synthesis To Be Credible

- Showing a generated tool list is not enough if multi-step prompts still collapse to one fixed action node.
- Deterministic extraction of ordered HTTP calls from prompt text is a practical bridge between rigid templates and fully open-ended tool synthesis.

## 2026-03-13: Ad-Hoc TS Adoption During POC Delivery Creates Toolchain Drift

- Introducing `.ts` incrementally into a `.mjs`-dominant Node-direct runtime creates a mixed contract that increases debugging and CI ambiguity.
- During product-discovery slices, keep one dominant module/runtime path and use strict `checkJs` for type safety until a dedicated migration slice is approved.
- Treat TypeScript source migration as a standalone milestone with explicit conversion boundaries and gate parity, not as opportunistic per-feature edits.

## 2026-03-13: Command Envelopes Should Carry Resolved Payloads, Not Templates

- If command payloads retain unresolved templates, inspect timelines under-report actual runtime behavior and hide dataflow correctness issues.
- Resolving nested payload templates before command emission creates auditable, deterministic operation evidence aligned with execution reality.

## 2026-03-13: Branch Intent Must Include Upstream Outcome Paths To Feel Agentic

- Input-only condition parsing creates a fake ceiling for promptable workflows because users naturally ask for routing on connector outcomes (for example status codes).
- A deterministic mapping from prompt status conditions to terminal receipt paths (`nodeResults.http-N.result.status`) is a practical midpoint between rigid templates and risky dynamic expression engines.

## 2026-03-13: Governance Must Be Product-Serving Or It Becomes Setup Drag

- Branch/PR governance is useful only when it shortens execution ambiguity; if rules are scattered, teams waste time navigating process instead of shipping capability.
- Keeping lifecycle steps in one canonical `RULE.md` plus a hard product-first slice contract prevents “setup theater” and forces measurable progress on promptable automation behavior.

## 2026-03-13: Prompt Mutation Must Be Fail-Closed Before It Is "Agentic"

- Letting free-form prompts mutate workflow topology without an explicit operation verb quickly becomes nondeterministic and unsafe.
- A strict single-operation contract with deterministic error codes is a practical first step that gives real product signal without introducing hidden graph corruption risk.

## 2026-03-13: Conformance Gates Must Be Hermetic To Be Trustworthy

- Mutation scenarios that rely on public internet URLs create flaky false negatives unrelated to runtime logic.
- Routing all qualification HTTP traffic through local mock origins keeps conformance deterministic and makes failures actionable.

## 2026-03-13: Iterative Pilot Loops Need Explicit Artifact Lineage

- A feedback-driven rerun flow is hard to trust if it does not report which artifact was the source and which artifact was actually executed.
- Emitting `sourceArtifactPath` + `effectiveArtifactPath` + mutation summary in CLI output makes chef-style review loops reproducible and auditable.

## 2026-03-13: Intent-Driven Mutation Needs A Proposal Gate Before Apply

- Letting natural-language direction auto-apply graph edits collapses review and execution into one opaque step, which is risky even in a CLI-first POC.
- A proposal-only default with explicit `--apply-direction` keeps lead-chef control intact while preserving deterministic inspect/replay evidence.

## 2026-03-13: Direction Planner Heuristics Need URL-Aware Intent Parsing

- Keyword intent parsing can silently misclassify operations when tokens (for example `summary`) appear inside URLs rather than user intent text.
- Stripping URLs before intent classification is a low-cost guardrail that keeps bounded direction mapping deterministic without adding LLM dependence.

## 2026-03-13: Role Replacement Must Be Anchor-Context-Aware

- Global phrase replacement for role aliases (`summary step`, `request step`) can corrupt operation descriptors such as \"add summary step\" and break valid intent mapping.
- Restricting role substitution to structural anchor contexts (`after`, `connect ... to ...`, `replace ... with`, `remove leaf ...`) keeps node-id-free direction support safe and predictable.

## 2026-03-13: Ambiguity Should Trigger Deterministic Choice, Not Guessing

- Hard-failing every role ambiguity forces users back to implementation details and collapses lead-chef abstraction.
- A safer middle path is deterministic proposal candidates plus explicit selection (`--proposal-id`) before apply.
- Keep fail-closed behavior for multi-ambiguous directions; candidate explosion and hidden heuristics are worse than explicit rejection.

## 2026-03-13: Pilot Qualification Must Be Checkpoint-Gated, Not Open-Loop

- Without explicit checkpoint gates, teams can pass many local tests while still drifting from product-level pilot criteria.
- A C0..C5 fail-closed checkpoint model (entry gate, RED harness, GREEN gap closure, REFACTOR, strict final gate) forces measurable progress and prevents silent scope creep.
- Pilot acceptance should be scenario-corpus-driven with deterministic evidence, not ad hoc “looks good” demos.

## 2026-03-13: CLI Failure Payloads Are Part Of The Product Contract

- If failure paths print ad hoc stderr text, conformance harnesses cannot qualify fail-closed behavior deterministically.
- Emit stable JSON failure payloads (`ok/status/error.code/error.message`) on stdout so invalid-direction and invalid-apply scenarios are machine-checkable, reproducible, and operator-legible.
- Candidate ordering should be human-legible deterministic too: natural node-id sort (`...-2` before `...-10`) avoids review confusion without sacrificing determinism.
