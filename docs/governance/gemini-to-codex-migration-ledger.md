# Gemini To Codex Migration Ledger

## Purpose

Track deterministic, dependency-safe migration from `.gemini` assets to Codex-native skills/governance.

## Processing Order Policy

1. Process source artifacts in lexical order from `find .gemini -type f | sort`.
2. Skip non-functional artifacts (`.DS_Store`).
3. Migrate one functional artifact per slice unless a hard dependency requires bundled migration.
4. Preserve behavior first; add enhancements only if they do not remove existing guarantees.

## Slices

### Slice 01 (Completed 2026-03-10): `.gemini/commands/clarify.toml`

- Source behavior:
1. Trigger `/clarify` for requirement disambiguation.
2. Enforce iterative consequential questioning.
3. Produce "Before vs After" requirement crystallization.
4. Hand off clarified output to spec/planning.

- Coupled dependencies reviewed:
1. `.gemini/skills/clarify/SKILL.md`
2. `.gemini/skills/hermeneia/SKILL.md`
3. `.gemini/skills/orchestrator/SKILL.md` (precedence chain reference)
4. `.gemini/settings.json` hook chain (state and sequencing awareness)

- Codex-native target:
1. Added local skill: `.codex/skills/clarify/SKILL.md`
2. Updated routing policy: `docs/governance/local-skill-routing.md` includes intent crystallization stage

- Known deviations:
1. Gemini slash-command entrypoint becomes Codex skill-trigger phrases (`clarify`, `/clarify`, requirement-refinement language).
2. Gemini hook-enforced pause model is represented as explicit skill rules because Codex does not run Gemini hook lifecycle.

### Slice 02 (Completed 2026-03-10): `.gemini/commands/council.toml`

- Source behavior:
1. Invoke a multi-perspective technical council.
2. Synthesize perspectives into a final decision.
3. Record decision for downstream execution.

- Coupled dependencies reviewed:
1. `.gemini/skills/agent-council/SKILL.md`
2. `.gemini/skills/agent-council/council.config.yaml`
3. `.gemini/skills/agent-council/references/*`
4. `.gemini/skills/agent-council/scripts/*`

- Codex-native target:
1. Added local skill package copy at `.codex/skills/agent-council/` (skill + config + references + scripts).
2. Rewrote `.codex/skills/agent-council/SKILL.md` for Codex-native tooling and explicit `/council` triad compatibility.
3. Updated `docs/governance/local-skill-routing.md` to include deliberation stage (`agent-council`, `prothesis`) for contested decisions.

- Known deviations:
1. Gemini-specific tool names (`google_web_search`, `activate_skill`, `delegate_to_agent`) replaced with Codex-compatible workflow instructions.
2. Script path references moved from `.gemini/...` to `.codex/...`.

### Slice 03 (Completed 2026-03-10): `.gemini/commands/doubt.toml`

- Source behavior:
1. Trigger immediate re-validation mode (`/doubt`, `!rv` semantics).
2. Re-check prior claims against reality before continuing.
3. Correct or confirm the previous answer with explicit verdict.

- Coupled dependencies reviewed:
1. `.gemini/skills/doubt/SKILL.md`
2. `orchestrator` + `syneidesis` + `verification-before-completion` synergy expectations.

- Codex-native target:
1. Added local skill: `.codex/skills/doubt/SKILL.md`.
2. Updated `docs/governance/local-skill-routing.md` verification stage to include `doubt`.

- Known deviations:
1. Gemini tool names replaced with Codex command/tool-agnostic checks (`rg`, `ls`, targeted tests).

### Slice 04 (Completed 2026-03-10): `.gemini/commands/factory_init.toml`

- Source behavior:
1. Create `task_plan.md`, `findings.md`, `progress.md` from factory template.
2. Force reminder to review `docs/learnings.md` and `docs/decisions/`.
3. Confirm activation with "Factory initialized. External memory is active."

- Coupled dependencies reviewed:
1. Existing local planning workflow (`planning-with-files`, `writing-plans`).
2. Repo governance memory requirements (`docs/logs/YYYY-MM-DD.md`, `docs/learnings.md`).

- Codex-native target:
1. Added local skill: `.codex/skills/factory-init/SKILL.md`.
2. Updated plan-bootstrap routing in `docs/governance/local-skill-routing.md` to include `factory-init`.

- Known deviations:
1. Added overwrite-safety guard for pre-existing planning files (enhancement, not behavior loss).
2. Template content is codex-native minimal skeleton rather than Gemini template clone.

### Slice 05 (Completed 2026-03-10): `.gemini/commands/factory_scaffold.toml`

- Source behavior:
1. Scaffold a new artifact blueprint (`tool|skill|agent`).
2. Create `specs/<artifact_name>.md` with concrete success criteria.
3. Initialize transparency log `notes/FACTORY_RUN_<id>.md`.
4. Enforce boundedness and failure-mode checks before code.

- Coupled dependencies reviewed:
1. `.gemini/skills/build-agent-from-scratch/SKILL.md` for upstream factory intent.
2. Source-referenced docs paths (missing in this repo).
3. Existing local `specs/` and `notes/` structure.

- Codex-native target:
1. Added local skill: `.codex/skills/factory-scaffold/SKILL.md`.
2. Updated `docs/governance/local-skill-routing.md` with factory blueprint stage.

- Known deviations:
1. Source paths to missing Obsidian docs were remapped to existing repo specs (`specs/02..05`).
2. Added append-safe behavior for existing artifact spec files and deterministic 3-digit factory log IDs.

### Slice 06 (Completed 2026-03-10): `.gemini/commands/run_local.toml`

- Source behavior:
1. Run local server in instance-mode development environment.
2. Ensure non-lambda local runtime configuration.

- Coupled dependencies reviewed:
1. Source runtime command assumptions (`npm run ts-node src/main.ts`, `MODE=instance`, `STAGE=local`).
2. Actual repo command surface in `package.json`.

- Codex-native target:
1. Added local skill: `.codex/skills/run-local/SKILL.md`.
2. Updated implementation routing in `docs/governance/local-skill-routing.md` to include `run-local`.

- Known deviations:
1. Source runtime entrypoint does not exist in this repo; replaced with verification-driven local loop (`test:unit`, `test:conformance`, `verify`, `verify:strict`).
2. Source env-flag semantics are retained conceptually (local-instance intent) but not literally executable here.

### Slice 07 (Completed 2026-03-10): `.gemini/commands/ship.toml`

- Source behavior:
1. Check git status.
2. Run verification.
3. Update transparency log.
4. Summarize changes against `SPEC.md` and related specs.
5. Propose ship branch without executing push automatically.

- Coupled dependencies reviewed:
1. PR/branch policy (`docs/governance/pr-branch-policy.md`).
2. Verification tier policy (`docs/governance/verification-tier-policy.md`).
3. Existing verification command surface (`verify`, `verify:strict`).

- Codex-native target:
1. Added local skill: `.codex/skills/ship/SKILL.md`.
2. Updated routing with dedicated release-readiness stage.

- Known deviations:
1. Added scope-aware tier selection (`runtime` -> `verify:strict`, otherwise `verify`) instead of single fixed verify command.
2. Added explicit fail-closed requirement for unknown scope paths.

### Slice 08 (Completed 2026-03-10): `.gemini/commands/verify.toml`

- Source behavior:
1. Run a multi-command verification bundle.
2. Stop on first red status.
3. Propose minimal fixes linked to spec sections.

- Coupled dependencies reviewed:
1. Legacy command names in source prompt.
2. Current canonical verification pipeline in `package.json`.

- Codex-native target:
1. Added local skill: `.codex/skills/verify/SKILL.md`.
2. Updated verification routing to include `verify`.

- Known deviations:
1. Replaced missing legacy command bundle with canonical repo gate `npm run verify`.
2. Preserved fail-fast + minimal-fix semantics.

### Slice 09 (Completed 2026-03-10): `.gemini/commands/verify_strict.toml`

- Source behavior:
1. Run strict multi-gate verification.
2. Stop on first red.
3. Require root cause analysis before fixes.

- Coupled dependencies reviewed:
1. Legacy strict-command names from source prompt.
2. Current strict gate command in `package.json`.

- Codex-native target:
1. Added local skill: `.codex/skills/verify-strict/SKILL.md`.
2. Updated verification routing to include `verify-strict`.

- Known deviations:
1. Replaced legacy strict fan-out with canonical `npm run verify:strict`.
2. Preserved root-cause-first failure protocol.

### Slice 10 (Completed 2026-03-10): `.gemini/commands/wrap.toml`

- Source behavior:
1. Trigger mandatory session close protocol.
2. Route through dedicated wrap skill instead of ad hoc summary.
3. Guarantee no context loss.

- Coupled dependencies reviewed:
1. `.gemini/skills/session-wrap/SKILL.md`
2. Memory destination policy (`docs/logs/YYYY-MM-DD.md`, `docs/learnings.md`).
3. Existing session planning files (`task_plan.md`, `findings.md`, `progress.md`).

- Codex-native target:
1. Added local skill: `.codex/skills/wrap/SKILL.md`.
2. Updated wrap/memory routing to include explicit `wrap` stage gate.

- Known deviations:
1. Replaced Gemini-only commands and tooling assumptions (e.g., `lint:fix`, `activate_skill`) with repo-native verification and handoff rules.
2. Preserved mandatory closeout semantics as explicit no-stale-memory rules.

### Slice 11 (Completed 2026-03-10): `.gemini/hooks/epistemic-gate.sh`

- Source behavior:
1. Block tool execution when unresolved epistemic `[Gap:]` items remain in `task_plan.md`.
2. Suggest comprehension verification after significant writes.

- Coupled dependencies reviewed:
1. `task_plan.md` gap notation convention (`[ ] [Gap:`).
2. Verification and guard governance docs.

- Codex-native target:
1. Added executable guard: `scripts/check-epistemic-gaps.mjs`.
2. Added command: `npm run check:epistemic-gaps`.
3. Integrated guard into canonical `npm run verify` pipeline.
4. Registered guard in governance docs and routing policy.

- Known deviations:
1. Codex has no Gemini hook lifecycle; blocking moved from per-tool runtime hook to verification-time fail-closed guard.
2. Katalepsis suggestion path is represented through wrap/verification rules rather than hook-side runtime messaging.

### Slice 12 (Completed 2026-03-10): `.gemini/hooks/post-task-lint.sh`

- Source behavior:
1. Auto-run lint fix after session/agent turns.

- Coupled dependencies reviewed:
1. Existing lint check script (`check:lint`).
2. Wrap/session close protocol.

- Codex-native target:
1. Added lint fix command: `npm run lint:fix` via `scripts/lint-fix.mjs`.
2. Updated `wrap` skill verification hygiene to run `lint:fix` when runtime files changed.

- Known deviations:
1. No auto-hook trigger exists in Codex runtime; behavior moved to explicit wrap-phase hygiene rather than per-turn automatic execution.

### Slice 13 (Completed 2026-03-10): `.gemini/hooks/refresh-cognitive-map.sh`

- Source behavior:
1. Regenerate passive context map after skill activation.

- Coupled dependencies reviewed:
1. Source generator (`.gemini/scripts/generate-cognitive-map.js`).
2. Existing native index generator (`scripts/generate-passive-context-index.mjs`).

- Codex-native target:
1. Added alias command: `npm run refresh:cognitive-map` -> `npm run docs:index`.
2. Updated `wrap` documentation reconciliation phase to refresh the context index when docs/spec/governance changed.

- Known deviations:
1. Auto-hook trigger replaced with explicit workflow step and command alias due lack of hook lifecycle in Codex.
2. Target map output remains `docs/index/passive-context-index.md` rather than `.gemini/GEMINI.md`.

### Slice 14 (Completed 2026-03-10): `.gemini/hooks/session-state-manager.sh`

- Source behavior:
1. Persist active skill state.
2. Recall active state on session start.
3. Track verification status and timestamp fields.

- Coupled dependencies reviewed:
1. Source `.gemini/state.json` schema.
2. Future hook dependencies on verification status fields.

- Codex-native target:
1. Added reusable state utility: `scripts/session-state.mjs`.
2. Added commands:
   - `npm run state:recall`
   - `npm run state:set`
   - `npm run state:verification`
3. Integrated state recall/persist guidance into `wrap` protocol and routing usage.

- Known deviations:
1. Event-driven automatic updates are replaced by explicit command-driven state operations.
2. State file path moved from `.gemini/state.json` to `notes/.session-state.json`.

### Slice 15 (Completed 2026-03-10): `.gemini/hooks/skill-linker.sh`

- Source behavior:
1. Block `executing-plans` when no plan files exist.
2. Block `build-agent-from-scratch` when technical handbook is missing.

- Coupled dependencies reviewed:
1. `executing-plans` skill workflow.
2. build-agent factory prerequisites.

- Codex-native target:
1. Added prerequisite guard script: `scripts/check-skill-prereqs.mjs`.
2. Added command: `npm run check:skill-prereqs`.
3. Wired preflight call into `.codex/skills/executing-plans/SKILL.md`.
4. Registered prerequisite rule in routing and guard registry docs.

- Known deviations:
1. Hook-time dynamic blocking replaced with explicit preflight command invocation.
2. `build-agent-from-scratch` prerequisite check is implemented in guard script for future use, even though local skill migration for that artifact is pending.

### Slice 16 (Completed 2026-03-10): `.gemini/hooks/verify-evidence.sh`

- Source behavior:
1. Track verification command outcomes and timestamps.
2. Block success claims without recent passing verification evidence.

- Coupled dependencies reviewed:
1. Shared session-state fields (`lastVerificationStatus`, `lastVerificationTime`).
2. Completion/ship verification workflows.

- Codex-native target:
1. Added tracked verification runner: `scripts/run-with-state.mjs`.
2. Added freshness guard: `scripts/check-verification-fresh.mjs`.
3. Refactored npm scripts:
   - `verify` now wraps `verify:core` via tracked runner
   - `verify:strict` now wraps `verify:strict:core` via tracked runner
4. Added command `npm run check:verification-fresh`.
5. Wired freshness checks into `verification-before-completion`, `ship`, and `wrap` skills plus governance docs.

- Known deviations:
1. Model-response-time blocking cannot be replicated directly without hook APIs; enforcement moved to explicit freshness guard checks in completion/ship flows.

### Slice 17 (Completed 2026-03-10): `.gemini/hooks/wrap-enforcer.sh`

- Source behavior:
1. Remind users to run `/wrap` when task completion language appears.

- Coupled dependencies reviewed:
1. Existing `wrap` skill and memory-closeout policy.
2. Agent rulebook and routing governance references.

- Codex-native target:
1. Strengthened routing rule: `wrap` is mandatory before ending material sessions.
2. Added explicit agent-rulebook principle requiring wrap protocol execution at session closeout.

- Known deviations:
1. Response-time heuristic reminders cannot be replicated without hook lifecycle; enforcement moved to explicit governance contract.

### Slice 18 (Completed 2026-03-10): `.gemini/policies/workspace_safety.toml`

- Source behavior:
1. Deny dangerous destructive command patterns.
2. Require user confirmation for high-impact commands.

- Coupled dependencies reviewed:
1. Codex runtime permission/escalation model.
2. Local governance guard architecture.

- Codex-native target:
1. Added canonical policy file: `config/governance/workspace-safety-policy.json`.
2. Added validation guard: `scripts/check-workspace-safety-policy.mjs`.
3. Added command: `npm run check:workspace-safety`.
4. Added policy doc: `docs/governance/workspace-safety-policy.md`.
5. Included safety-policy check in `verify:core` and governance docs.

- Known deviations:
1. Runtime command denial/approval remains governed by Codex platform controls; local policy enforces policy integrity, not direct command interception.

### Slice 19 (Completed 2026-03-10): `.gemini/scripts/generate-cognitive-map.js`

- Source behavior:
1. Build a central "cognitive hub" map with commands, skills, specs, playbooks, and docs inventory.
2. Extract compact markdown descriptions for specs/playbooks.
3. Refuse update when all sections are empty (wipeout safety gate).

- Coupled dependencies reviewed:
1. Existing native index generator (`scripts/generate-passive-context-index.mjs`).
2. Refresh alias and wrap linkage (`npm run refresh:cognitive-map`, `wrap` protocol).
3. Strict freshness guard (`scripts/check-passive-index-freshness.mjs`).

- Codex-native target:
1. Enhanced `scripts/generate-passive-context-index.mjs` with:
   - command surface catalog derived from `package.json` scripts
   - Codex skill catalog derived from `.codex/skills/`
   - markdown summary extraction for `specs/*.md` and `notes/*.md`
   - top-level docs catalog mirroring source cognitive-map discoverability intent
2. Added generation safety gate to fail closed when critical artifact discovery resolves to empty output.
3. Regenerated `docs/index/passive-context-index.md` with the merged Codex-native cognitive hub content.

- Known deviations:
1. Source target `.gemini/GEMINI.md` is not updated; canonical output remains `docs/index/passive-context-index.md`.
2. Gemini command files are replaced by Codex-native npm command surface plus local skill catalog.

### Slice 20 (Completed 2026-03-10): `.gemini/settings.json`

- Source behavior:
1. Declare global lifecycle-hook orchestration (session start/end, tool hooks, model hooks).
2. Keep hook enablement and disabled-list policy in a single settings file.

- Coupled dependencies reviewed:
1. Previously migrated hook-equivalent commands/skills (state, lint, prereq, freshness, map refresh).
2. Governance docs controlling lifecycle behavior (`local-skill-routing`, `verification-tier-policy`, `agent-rulebook`).
3. Canonical verify pipeline in `package.json`.

- Codex-native target:
1. Added canonical policy: `config/governance/session-automation-policy.json` mapping source lifecycle hooks to Codex-native commands/docs/skills.
2. Added integrity guard: `scripts/check-session-automation-policy.mjs`.
3. Added command: `npm run check:session-automation`.
4. Integrated guard into `verify:core`.
5. Added governance doc: `docs/governance/session-automation-policy.md`.
6. Updated governance registry/rulebook/routing/tier policy with lifecycle-policy enforcement references.

- Known deviations:
1. Runtime hook callbacks are not emulated; lifecycle semantics are enforced by explicit policy and verification-time checks.
2. `hooksConfig.disabled` remains represented as policy data (`disabled: []`) and guarded for drift rather than runtime mutability.

### Slice 21 (Completed 2026-03-10): `.gemini/skills/agent-council/SKILL.md`

- Source behavior:
1. Enforce multi-persona debate with role diversity.
2. Require evidence-backed persona opinions before verdict.
3. Require post-verdict execution delegation (do not stop at discussion).

- Coupled dependencies reviewed:
1. Existing Codex migration artifact `.codex/skills/agent-council/SKILL.md`.
2. Deliberation stage routing in `docs/governance/local-skill-routing.md`.
3. Existing council package assets (references/scripts/config).

- Codex-native target:
1. Updated `.codex/skills/agent-council/SKILL.md` to restore stronger source guarantees:
   - explicit per-persona evidence-gathering requirement for external decisions
   - mandatory execution handoff step before closing council output
2. Added explicit skill-synergy links for execution continuation (`orchestrator`, `prothesis`, `writing-plans`, `doubt`).

- Known deviations:
1. Gemini tool invocations (`activate_skill`, model-specific web tools) remain replaced by Codex-native workflow phrasing.
2. Execution handoff is protocol-enforced through skill rules rather than tool-callback enforcement.

### Slice 22 (Completed 2026-03-10): `.gemini/skills/agent-council/council.config.yaml`

- Source behavior:
1. Define federated council member CLI commands, chairman role, and timeout/synthesis settings.

- Coupled dependencies reviewed:
1. `.codex/skills/agent-council/scripts/council.sh`.
2. Existing copied Codex council config file.

- Codex-native target:
1. File-level parity confirmed: `.codex/skills/agent-council/council.config.yaml` is identical to source.
2. No changes required.

- Known deviations:
1. None (no-op parity slice).

### Slice 23 (Completed 2026-03-10): `.gemini/skills/agent-council/references/config.md`

- Source behavior:
1. Document how to configure council members/chairman in `council.config.yaml`.

- Coupled dependencies reviewed:
1. Local council package reference docs under `.codex/skills/agent-council/references/`.
2. Copied council config file.

- Codex-native target:
1. File-level parity confirmed: `.codex/skills/agent-council/references/config.md` matches source exactly.
2. No changes required.

- Known deviations:
1. None (no-op parity slice).

### Slice 24 (Completed 2026-03-10): `.gemini/skills/agent-council/references/examples.md`

- Source behavior:
1. Provide representative usage examples for council runs.

- Coupled dependencies reviewed:
1. Local reference package under `.codex/skills/agent-council/references/`.

- Codex-native target:
1. File-level parity confirmed: `.codex/skills/agent-council/references/examples.md` matches source exactly.
2. No changes required.

- Known deviations:
1. None (no-op parity slice).

### Slice 25 (Completed 2026-03-10): `.gemini/skills/agent-council/references/host-ui.md`

- Source behavior:
1. Document host-side integration expectations for council execution UX.

- Coupled dependencies reviewed:
1. Local reference package under `.codex/skills/agent-council/references/`.

- Codex-native target:
1. File-level parity confirmed: `.codex/skills/agent-council/references/host-ui.md` matches source exactly.
2. No changes required.

- Known deviations:
1. None (no-op parity slice).

### Slice 26 (Completed 2026-03-10): `.gemini/skills/agent-council/references/overview.md`

- Source behavior:
1. Provide high-level overview and positioning for council workflow.

- Coupled dependencies reviewed:
1. Local reference package under `.codex/skills/agent-council/references/`.

- Codex-native target:
1. File-level parity confirmed: `.codex/skills/agent-council/references/overview.md` matches source exactly.
2. No changes required.

- Known deviations:
1. None (no-op parity slice).

### Slice 27 (Completed 2026-03-10): `.gemini/skills/agent-council/references/requirements.md`

- Source behavior:
1. Capture required prerequisites and operational expectations for council usage.

- Coupled dependencies reviewed:
1. Local reference package under `.codex/skills/agent-council/references/`.

- Codex-native target:
1. File-level parity confirmed: `.codex/skills/agent-council/references/requirements.md` matches source exactly.
2. No changes required.

- Known deviations:
1. None (no-op parity slice).

### Slice 28 (Completed 2026-03-10): `.gemini/skills/agent-council/references/safety.md`

- Source behavior:
1. Document council safety considerations and operational caveats.

- Coupled dependencies reviewed:
1. Local reference package under `.codex/skills/agent-council/references/`.

- Codex-native target:
1. File-level parity confirmed: `.codex/skills/agent-council/references/safety.md` matches source exactly.
2. No changes required.

- Known deviations:
1. None (no-op parity slice).

### Slice 29 (Completed 2026-03-10): `.gemini/skills/agent-council/scripts/council-job-worker.ts`

- Source behavior:
1. Implement worker-side council member invocation and result handling.

- Coupled dependencies reviewed:
1. Local script package under `.codex/skills/agent-council/scripts/`.

- Codex-native target:
1. File-level parity confirmed: `.codex/skills/agent-council/scripts/council-job-worker.ts` matches source exactly.
2. No changes required.

- Known deviations:
1. None (no-op parity slice).

### Slice 30 (Completed 2026-03-10): `.gemini/skills/agent-council/scripts/council-job.sh`

- Source behavior:
1. Provide shell wrapper for council job execution pipeline.

- Coupled dependencies reviewed:
1. Local script package under `.codex/skills/agent-council/scripts/`.

- Codex-native target:
1. File-level parity confirmed: `.codex/skills/agent-council/scripts/council-job.sh` matches source exactly.
2. No changes required.

- Known deviations:
1. None (no-op parity slice).

### Slice 31 (Completed 2026-03-10): `.gemini/skills/agent-council/scripts/council-job.ts`

- Source behavior:
1. Implement TypeScript council job orchestration logic.

- Coupled dependencies reviewed:
1. Local script package under `.codex/skills/agent-council/scripts/`.

- Codex-native target:
1. File-level parity confirmed: `.codex/skills/agent-council/scripts/council-job.ts` matches source exactly.
2. No changes required.

- Known deviations:
1. None (no-op parity slice).

### Slice 32 (Completed 2026-03-10): `.gemini/skills/agent-council/scripts/council.sh`

- Source behavior:
1. Provide top-level shell entrypoint for federated council execution.

- Coupled dependencies reviewed:
1. Local script package under `.codex/skills/agent-council/scripts/`.

- Codex-native target:
1. File-level parity confirmed: `.codex/skills/agent-council/scripts/council.sh` matches source exactly.
2. No changes required.

- Known deviations:
1. None (no-op parity slice).

### Slice 33 (Completed 2026-03-10): `.gemini/skills/brainstorming/SKILL.md`

- Source behavior:
1. Turn idea-stage requests into design artifacts through clarification, multi-perspective analysis, strawman proposal, and iterative validation.
2. Pause interactively across perspective/design sections.
3. Hand off accepted design to planning and implementation workflows.

- Coupled dependencies reviewed:
1. `.gemini/skills/hermeneia/SKILL.md`
2. `.gemini/skills/prothesis/SKILL.md`
3. Non-migrated dependencies referenced by source (`tech-decision`, `dev-scan`, `dispatching-parallel-agents`, `knowledge-bridge`, `using-git-worktrees`).
4. Local routing policy and available Codex skills.

- Codex-native target:
1. Added new local skill: `.codex/skills/brainstorming/SKILL.md`.
2. Preserved core source protocol:
   - intent clarification first
   - evidence-backed multi-lens analysis
   - strawman options
   - iterative section-by-section refinement with pauses
   - explicit packaging + handoff to planning/execution skills
3. Updated `docs/governance/local-skill-routing.md` to include brainstorming in a dedicated pre-implementation idea-shaping stage.

- Known deviations:
1. Source-coupled skills not yet migrated are represented via explicit fallback behavior to currently available local skills.
2. Gemini tool-calling directives are replaced by Codex-native workflow commands and skill routing.

### Slice 34 (Completed 2026-03-10): `.gemini/skills/build-agent-from-scratch/SKILL.md`

- Source behavior:
1. Run interview-driven specification intake for new agent/service build requests.
2. Draft specs with safety/architecture constraints before coding.
3. Execute quality gates before sign-off.

- Coupled dependencies reviewed:
1. Source assets (`assets/SPEC_QUESTIONNAIRE.md`, `assets/SPEC_RUBRIC.md`).
2. Source scripts (`scripts/scaffold_specs.ts`, `scripts/lint_spec.ts`, `scripts/validate_spec.ts`).
3. Existing local prerequisite guard (`scripts/check-skill-prereqs.mjs`).
4. Local planning/factory skills and verification policy.

- Codex-native target:
1. Added new local skill: `.codex/skills/build-agent-from-scratch/SKILL.md`.
2. Preserved source protocol with Codex-native command mapping:
   - mandatory design interview
   - spec scaffolding via existing factory/planning workflow
   - canonical checks via `check:spec`, `verify`, and strict gate when needed
3. Added routing policy coverage for new-capability factory stage.

- Known deviations:
1. Source command names (`spec:scaffold`, `spec:lint`, `spec:validate`) are replaced by canonical repo commands.
2. References to source assets/scripts remain as upcoming slices until each artifact is migrated.

### Slice 35 (Completed 2026-03-10): `.gemini/skills/build-agent-from-scratch/assets/SPEC_QUESTIONNAIRE.md`

- Source behavior:
1. Provide structured interview prompts for early spec definition.

- Coupled dependencies reviewed:
1. `.codex/skills/build-agent-from-scratch/SKILL.md` interview phase.

- Codex-native target:
1. Added asset: `.codex/skills/build-agent-from-scratch/assets/SPEC_QUESTIONNAIRE.md`.
2. Updated local skill to explicitly use this questionnaire in Phase 1.

- Known deviations:
1. None; questionnaire content preserved.

### Slice 36 (Completed 2026-03-10): `.gemini/skills/build-agent-from-scratch/assets/SPEC_RUBRIC.md`

- Source behavior:
1. Provide self-review rubric for spec quality before sign-off.

- Coupled dependencies reviewed:
1. `.codex/skills/build-agent-from-scratch/SKILL.md` drafting workflow.

- Codex-native target:
1. Added asset: `.codex/skills/build-agent-from-scratch/assets/SPEC_RUBRIC.md`.
2. Updated local skill to require rubric review as explicit gate.

- Known deviations:
1. None; rubric content preserved.

### Slice 37 (Completed 2026-03-10): `.gemini/skills/build-agent-from-scratch/scripts/lint_spec.ts`

- Source behavior:
1. Lint `SPEC.md` for lazy placeholders and empty-section structure issues.

- Coupled dependencies reviewed:
1. `.codex/skills/build-agent-from-scratch/SKILL.md` quality-gate phase.
2. `package.json` command surface.

- Codex-native target:
1. Added source-parity script copy: `.codex/skills/build-agent-from-scratch/scripts/lint_spec.ts`.
2. Added runnable native equivalent: `scripts/spec-lint.mjs`.
3. Added npm command: `npm run spec:lint`.
4. Updated local build-agent skill to run `spec:lint` before `check:spec`.

- Known deviations:
1. Runtime execution path is `.mjs` command in root `scripts/` instead of direct TypeScript script execution.

### Slice 38 (Completed 2026-03-10): `.gemini/skills/build-agent-from-scratch/scripts/scaffold_specs.ts`

- Source behavior:
1. Scaffold baseline spec/subspec structure and enforce "update-spec-before-scaffold" guard.

- Coupled dependencies reviewed:
1. `.codex/skills/build-agent-from-scratch/SKILL.md` scaffolding phase.
2. Canonical local spec file conventions.
3. `package.json` command surface.

- Codex-native target:
1. Added source-parity script copy: `.codex/skills/build-agent-from-scratch/scripts/scaffold_specs.ts`.
2. Added runnable native equivalent: `scripts/spec-scaffold.mjs`.
3. Added npm command: `npm run spec:scaffold`.
4. Updated build-agent skill scaffolding flow to invoke the new scaffold command.

- Known deviations:
1. Native scaffold creates canonical local spec filenames (`03-tooling-and-skills.md`, `05-memory-and-documentation.md`) and local conformance path (`test/integration/conformance`) instead of source defaults.
2. Runtime execution path is `.mjs` command in root `scripts/` instead of direct TypeScript script execution.

### Slice 39 (Completed 2026-03-10): `.gemini/skills/build-agent-from-scratch/scripts/validate_spec.ts`

- Source behavior:
1. Validate spec document structure and required section coverage.

- Coupled dependencies reviewed:
1. `.codex/skills/build-agent-from-scratch/SKILL.md` quality-gate phase.
2. Canonical local `SPEC.md` structure.
3. `package.json` command surface.

- Codex-native target:
1. Added source-parity script copy: `.codex/skills/build-agent-from-scratch/scripts/validate_spec.ts`.
2. Added runnable native equivalent: `scripts/spec-validate.mjs`.
3. Added npm command: `npm run spec:validate`.
4. Updated build-agent skill quality-gate flow to include `spec:validate`.

- Known deviations:
1. Native validation criteria are mapped to local canonical SPEC headings rather than source template headings to avoid a permanently-failing gate.
2. Runtime execution path is `.mjs` command in root `scripts/` instead of direct TypeScript script execution.

### Slice 40 (Completed 2026-03-10): `.gemini/skills/capture-skill/SKILL.md`

- Source behavior:
1. Capture reusable session knowledge into new or existing local skills.
2. Enforce distillation from conversation artifacts into clean operational instructions.

- Coupled dependencies reviewed:
1. Source template dependency (`templates/SKILL_TEMPLATE.md`).
2. Existing local skills for synergy (`reflexion`, `manage-skills`, `systematic-debugging`).
3. Local routing policy for wrap/memory stages.

- Codex-native target:
1. Added new local skill: `.codex/skills/capture-skill/SKILL.md`.
2. Mapped source behavior to Codex-native paths and commands (`.codex/skills/...`, `npm run check:skills`, `npm run verify` when needed).
3. Updated routing policy to include `capture-skill` in wrap/memory stage and usage rules.

- Known deviations:
1. Source references to Gemini rule destinations are replaced with repo-native durable memory destinations.
2. Template reference points to local migration path and is completed in the next slice.

### Slice 41 (Completed 2026-03-10): `.gemini/skills/capture-skill/templates/SKILL_TEMPLATE.md`

- Source behavior:
1. Provide canonical template skeleton for creating captured skills.

- Coupled dependencies reviewed:
1. `.codex/skills/capture-skill/SKILL.md` template reference.

- Codex-native target:
1. Added template parity file: `.codex/skills/capture-skill/templates/SKILL_TEMPLATE.md`.

- Known deviations:
1. None; template content preserved.

### Slice 42 (Completed 2026-03-10): `.gemini/skills/clarify/SKILL.md`

- Source behavior:
1. Apply Hermeneia clarification protocol with explicit trigger rules.
2. Use ambiguity categories (Expression/Precision/Coherence/Context) and iterative consequential options.
3. Enforce interactive pause before any next action/tooling.

- Coupled dependencies reviewed:
1. `hermeneia` intent-expression framing.
2. `orchestrator` planning precedence expectations.
3. `writing-plans` handoff requirements.

- Codex-native target:
1. Reconciled `.codex/skills/clarify/SKILL.md` to restore source-parity controls:
   - explicit "do not auto-trigger on assistant-only low-impact ambiguity" rule,
   - ambiguity category table with question forms,
   - mandatory pause rule that blocks tool calls until user reply.
2. Preserved Codex-native structured output and handoff into planning skills.

- Known deviations:
1. Source decorative formatting and `activate_skill` wording are replaced by Codex-native plain handoff instructions.
2. Clarification output format is normalized to repo skill style while preserving behavioral guarantees.

### Slice 43 (Completed 2026-03-10): `.gemini/skills/crash-inspector/SKILL.md`

- Source behavior:
1. Record crash reports immediately when tools fail repeatedly, hang, or loop.
2. Collect failure context and quick triage evidence before retrying.
3. Delegate repair to the right specialist skill rather than fixing ad hoc.

- Coupled dependencies reviewed:
1. `systematic-debugging` for code/test failure repair.
2. `orchestrator` for sequencing/plan failures.
3. `brainstorming` for missing-capability gaps.
4. Memory reconciliation requirements in `findings.md`, `docs/logs/YYYY-MM-DD.md`, and `docs/learnings.md`.

- Codex-native target:
1. Added new local skill: `.codex/skills/crash-inspector/SKILL.md`.
2. Preserved source intent with stronger anti-loop controls:
   - mandatory timestamped crash report template in `findings.md`,
   - no identical retries after 2 failures without a new hypothesis,
   - explicit delegated handoff contract.
3. Updated `docs/governance/local-skill-routing.md`:
   - added incident-response stage (`crash-inspector`, `systematic-debugging`, `orchestrator`)
   - added usage rule requiring `crash-inspector` before repeated retries.

- Known deviations:
1. Gemini tool names and `activate_skill` delegation are replaced with Codex-native command-agnostic handoff protocol.
2. Environment triage examples are constrained to non-destructive evidence collection unless separately approved.

### Slice 44 (Completed 2026-03-10): `.gemini/skills/dev-scan/SKILL.md`

- Source behavior:
1. Gather developer sentiment from multiple communities (Reddit, HN, Dev.to, Lobsters).
2. Use anti-bias search strategy including mandatory criticism-focused query.
3. Synthesize source-cited consensus, controversies, and notable minority insights.

- Coupled dependencies reviewed:
1. `brainstorming` for design-phase synthesis usage.
2. `prothesis` for strategy/comparison decision support.
3. `reflexion` for durable trend extraction.
4. Non-migrated source dependency `tech-decision` (fallback needed).

- Codex-native target:
1. Added new local skill: `.codex/skills/dev-scan/SKILL.md`.
2. Mapped source search model to Codex-native web tooling patterns (`web.search_query` with domain filtering and parallel query strategy).
3. Preserved output guarantees:
   - source-linked claims only,
   - minimum targets for consensus/controversy/notable sections,
   - explicit anti-search requirement.
4. Updated `docs/governance/local-skill-routing.md`:
   - added "Community sentiment scan" stage,
   - added usage rule for developer-opinion requests.

- Known deviations:
1. Gemini-specific `google_web_search` references replaced by Codex web tool instructions.
2. `tech-decision` remains non-migrated; local fallback is explicitly documented as `prothesis`.

### Slice 45 (Completed 2026-03-10): `.gemini/skills/dispatching-parallel-agents/SKILL.md`

- Source behavior:
1. Parallelize independent failures across focused agents.
2. Require independence checks to avoid cross-domain interference.
3. Reintegrate and verify full suite after parallel work.

- Coupled dependencies reviewed:
1. `orchestrator` for dependency-aware decomposition.
2. `systematic-debugging` for root-cause workflows per independent domain.
3. `dev-scan`, `reflexion`, and `prothesis` synergy paths.

- Codex-native target:
1. Added new local skill: `.codex/skills/dispatching-parallel-agents/SKILL.md`.
2. Mapped source dispatch model to Codex runtime capabilities:
   - explicit independence gate before parallelization,
   - parallel investigation via `multi_tool_use.parallel` for independent reads/research,
   - deterministic integration before verification to avoid write collisions.
3. Updated `docs/governance/local-skill-routing.md`:
   - added "Parallel decomposition" stage,
   - added usage rule for independent multi-failure situations.

- Known deviations:
1. Gemini conceptual `Dispatch(...)` agent API is represented as Codex-native parallel tool usage and investigation packeting.
2. Parallel code edits are intentionally constrained to conflict-safe integration semantics rather than unconstrained concurrent writes.

### Slice 46 (Completed 2026-03-10): `.gemini/skills/doubt/SKILL.md`

- Source behavior:
1. Enter hard re-validation mode on skepticism triggers.
2. Enumerate prior claims and verify each with fresh tool evidence.
3. Publish explicit confirmed/false/unverified verdict and correct course.

- Coupled dependencies reviewed:
1. Existing local `.codex/skills/doubt/SKILL.md`.
2. Verification and orchestration synergy expectations (`orchestrator`, `syneidesis`, `verification-before-completion`).

- Codex-native target:
1. Parity confirmed with no additional edits required.
2. Existing local skill already preserves source-critical guarantees:
   - explicit pause into verification mode,
   - claim-by-claim fresh evidence requirements,
   - explicit verdict + correction loop.

- Known deviations:
1. Source example block is not copied verbatim; behavior is preserved through protocol rules.
2. Gemini `activate_skill` wording remains replaced by Codex-native handoff language.

### Slice 47 (Completed 2026-03-10): `.gemini/skills/eval-suite-checklist/SKILL.md`

- Source behavior:
1. Require matrix-first test design (happy path, edge, adversarial, system failure).
2. Enforce deterministic conformance checks and safety-focused verification.
3. Integrate with debugging and branch-readiness workflows.

- Coupled dependencies reviewed:
1. Source assets/scripts (`assets/TEST_STRATEGY.md`, `scripts/lint_conformance.ts`, `scripts/run_conformance.ts`) scheduled in upcoming slices.
2. Existing local verification command surface (`test:conformance`, `verify:strict`).
3. Synergy expectations with `test-driven-development` and `systematic-debugging`.

- Codex-native target:
1. Rewrote `.codex/skills/eval-suite-checklist/SKILL.md` to restore source-critical guarantees while preserving local durable-execution quality checks.
2. Added mandatory coverage matrix categories, deterministic test constraints, and explicit quality-verdict output.
3. Mapped verification to canonical local commands (`test:conformance`, `verify:strict`).
4. Updated routing usage rules to require `eval-suite-checklist` for conformance/eval-suite revisions.

- Known deviations:
1. Source `conformance:lint` command is not yet available in local package scripts; current workflow uses existing canonical checks until script-migration slices are processed.
2. Source `finishing-a-development-branch` synergy is mapped to local `ship` fallback until that source skill is migrated.

### Slice 48 (Completed 2026-03-10): `.gemini/skills/eval-suite-checklist/assets/TEST_STRATEGY.md`

- Source behavior:
1. Provide minimal required conformance categories and per-test required fields.

- Coupled dependencies reviewed:
1. `.codex/skills/eval-suite-checklist/SKILL.md` coverage-matrix phase.

- Codex-native target:
1. Added asset parity file: `.codex/skills/eval-suite-checklist/assets/TEST_STRATEGY.md`.
2. Updated local eval-suite skill to explicitly require this asset in Phase 1.

- Known deviations:
1. None; source content preserved verbatim.

### Slice 49 (Completed 2026-03-10): `.gemini/skills/eval-suite-checklist/scripts/lint_conformance.ts`

- Source behavior:
1. Lint conformance JSON suite for required categories and per-case required fields.
2. Fail closed when conformance structure is missing or malformed.

- Coupled dependencies reviewed:
1. `.codex/skills/eval-suite-checklist/SKILL.md` verification steps.
2. Local test topology under `test/integration/conformance/`.
3. `package.json` command surface.

- Codex-native target:
1. Added source-parity script copy: `.codex/skills/eval-suite-checklist/scripts/lint_conformance.ts`.
2. Added runnable native equivalent: `scripts/conformance-lint.mjs`.
3. Added npm command: `npm run conformance:lint`.
4. Updated local eval-suite skill to run `conformance:lint` before conformance tests.

- Known deviations:
1. Local repository currently uses `.mjs` conformance tests and fixture JSONs, not source-style JSON case files; native lint script skips with explicit info when no case files are present outside fixtures.

### Slice 50 (Completed 2026-03-10): `.gemini/skills/eval-suite-checklist/scripts/run_conformance.ts`

- Source behavior:
1. Execute conformance JSON cases with shell-disabled process spawning and command safety restrictions.
2. Enforce timeout, expected/forbidden output checks, and fail-closed reporting.

- Coupled dependencies reviewed:
1. Existing local runner: `scripts/run-conformance.mjs`.
2. Local conformance test topology (`.test.mjs` suites + fixture JSON).
3. Eval-suite skill verification workflow.

- Codex-native target:
1. Added source-parity script copy: `.codex/skills/eval-suite-checklist/scripts/run_conformance.ts`.
2. Upgraded native runner `scripts/run-conformance.mjs` to hybrid mode:
   - runs source-style JSON conformance suites when present (with safety checks),
   - runs canonical `.test.mjs` conformance suites,
   - fails closed when no suite artifacts exist.
3. Preserved command surface (`npm run test:conformance`) while expanding behavior coverage.

- Known deviations:
1. Native runner supports both source JSON mode and existing `.mjs` test mode to match local repository reality.

### Slice 51 (Completed 2026-03-10): `.gemini/skills/executing-plans/SKILL.md`

- Source behavior:
1. Execute plan in bounded batches with checkpoint reporting.
2. Require plan/file freshness checks before implementation.
3. Stop immediately on blockers and avoid guess-driven continuation.

- Coupled dependencies reviewed:
1. Existing local preflight guard (`check:skill-prereqs -- --skill executing-plans`).
2. Planning/memory files (`task_plan.md`, `progress.md`, `findings.md`).
3. Source synergy expectations with `writing-plans`, `systematic-debugging`, and branch-finish workflows.

- Codex-native target:
1. Rewrote `.codex/skills/executing-plans/SKILL.md` from stub to full protocol:
   - purpose + activation preconditions,
   - freshness/go-no-go checks,
   - batch execution loop with verification evidence,
   - explicit stop conditions and checkpoint reporting.
2. Preserved mandatory preflight command and added `ship` fallback for non-migrated finishing skill.

- Known deviations:
1. Source default "first 3 tasks" batching is retained as default but user-directed one-by-one mode still takes precedence.
2. Source `activate_skill` branch-finish handoff is mapped to Codex-native `finishing-a-development-branch` + `ship` chain.

### Slice 52 (Completed 2026-03-10): `.gemini/skills/finishing-a-development-branch/SKILL.md`

- Source behavior:
1. Enforce final quality verification before branch closeout choices.
2. Present explicit four-option integration decision (merge/PR/keep/discard).
3. Require confirmation for destructive closeout paths and worktree cleanup discipline.

- Coupled dependencies reviewed:
1. Existing local release skill: `.codex/skills/ship/SKILL.md`.
2. `executing-plans` completion handoff logic.
3. PR/branch governance policy (`docs/governance/pr-branch-policy.md`).

- Codex-native target:
1. Added new local skill: `.codex/skills/finishing-a-development-branch/SKILL.md`.
2. Integrated source option model and safety guards with Codex governance:
   - explicit four-option branch closeout flow,
   - typed confirmation for discard,
   - no implicit push/merge execution.
3. Updated routing release-readiness stage to include this skill.
4. Updated `executing-plans` completion handoff to route through finishing skill + `ship`.

- Known deviations:
1. Source ticket-title convention is replaced by repository policy-driven PR governance checks.
2. Runtime-specific worktree commands remain conditional on actual worktree usage in current repo state.

### Slice 53 (Completed 2026-03-10): `.gemini/skills/moonstone-transformer/SKILL.md`

- Source behavior:
1. Transform Moonstone model definitions into machine/schema/service/test scaffolding.
2. Wire generated artifacts into runtime registration points.
3. Enforce non-overwrite safeguards and transition validation coverage.

- Coupled dependencies reviewed:
1. Local runtime wiring files (`src/service/AgentFactory.mjs`, `src/agent/registry.mjs`, `src/agent/active-agents.json`).
2. Source template dependencies (`templates/machine.ts.hbs`, `schema.ts.hbs`, `service.ts.hbs`) in upcoming slices.
3. Existing local agent architecture (`src/agent/intake/*`).

- Codex-native target:
1. Added new local skill: `.codex/skills/moonstone-transformer/SKILL.md`.
2. Mapped source workflow to local runtime conventions (`.mjs` agent modules, runtime registry/factory wiring) while preserving model-driven generation intent.
3. Updated routing with explicit `moonstone-transformer` usage for model-to-runtime scaffolding tasks.

- Known deviations:
1. Source TypeScript/Zod output assumptions are adapted to local `.mjs` + validator-function conventions when strict TypeScript toolchain is not the runtime path.
2. Source `CyanResolver` wiring target is replaced by local runtime integration points.

### Slice 54 (Completed 2026-03-10): `.gemini/skills/moonstone-transformer/templates/machine.ts.hbs`

- Source behavior:
1. Provide XState machine scaffold template for generated agent machines.

- Coupled dependencies reviewed:
1. `.codex/skills/moonstone-transformer/SKILL.md` template references.

- Codex-native target:
1. Added template parity file: `.codex/skills/moonstone-transformer/templates/machine.ts.hbs`.

- Known deviations:
1. None; source template preserved.

### Slice 55 (Completed 2026-03-10): `.gemini/skills/moonstone-transformer/templates/schema.ts.hbs`

- Source behavior:
1. Provide Zod-based context/event schema scaffold template for generated Moonstone artifacts.

- Coupled dependencies reviewed:
1. `.codex/skills/moonstone-transformer/SKILL.md` template references.

- Codex-native target:
1. Added template parity file: `.codex/skills/moonstone-transformer/templates/schema.ts.hbs`.

- Known deviations:
1. None; source template preserved.

### Slice 56 (Completed 2026-03-10): `.gemini/skills/moonstone-transformer/templates/service.ts.hbs`

- Source behavior:
1. Provide service-layer scaffold template for machine/action/guard wiring.

- Coupled dependencies reviewed:
1. `.codex/skills/moonstone-transformer/SKILL.md` template references.

- Codex-native target:
1. Added template parity file: `.codex/skills/moonstone-transformer/templates/service.ts.hbs`.

- Known deviations:
1. None; source template preserved.

### Slice 57 (Completed 2026-03-10): `.gemini/skills/git-craft-commit/SKILL.md`

- Source behavior:
1. Select logical commit units from current diff.
2. Enforce lint/hygiene before staging.
3. Generate Conventional Commit message and stage without implicit push.

- Coupled dependencies reviewed:
1. Existing release-closeout skills (`ship`, `finishing-a-development-branch`).
2. Local governance around branch/PR workflows.
3. Session-memory artifacts exclusion conventions (`task_plan.md`, `findings.md`, `progress.md`).

- Codex-native target:
1. Added new local skill: `.codex/skills/git-craft-commit/SKILL.md`.
2. Preserved source commit-crafting workflow with explicit no-auto-push and no-implicit-commit defaults.
3. Updated routing with a commit-preparation stage and usage rule.

- Known deviations:
1. Source references to generic "equivalent lint command" are pinned to canonical local command `npm run lint:fix`.
2. Execution remains confirmation-gated for commit/push actions under Codex command safety model.

### Slice 58 (Completed 2026-03-10): `.gemini/skills/hermeneia/SKILL.md`

- Source behavior:
1. Treat intent clarification as a dedicated dialogical mode.
2. Enforce user-selected gap categories and interactive pause semantics.
3. Block tool execution until ambiguity converges.

- Coupled dependencies reviewed:
1. Existing local `clarify` skill behavior and handoff expectations.
2. `orchestrator` and `prothesis` sequencing.

- Codex-native target:
1. Reconciled `.codex/skills/hermeneia/SKILL.md` to restore source-critical protocol depth:
   - explicit expression-confirmation and gap-selection phases,
   - consequential option templates,
   - hard pause rule before tools.
2. Preserved local memory/governance closeout semantics.

- Known deviations:
1. Source formal symbolic-flow block is summarized operationally rather than copied verbatim.
2. Gemini `activate_skill` wording remains mapped to Codex-native explicit handoff steps.

### Slice 59 (Completed 2026-03-10): `.gemini/skills/high-integrity-commit/SKILL.md`

- Source behavior:
1. Require fresh lint/test gates before any commit operation.
2. Cluster changed files into logical commit units.
3. Require explicit user approval before commit execution.

- Coupled dependencies reviewed:
1. Existing `git-craft-commit` and `finishing-a-development-branch` workflows.
2. Local canonical verification command surface (`verify`).
3. Commit/push safety expectations in Codex execution model.

- Codex-native target:
1. Added new local skill: `.codex/skills/high-integrity-commit/SKILL.md`.
2. Preserved source iron-gate and interactive approval semantics with local commands (`lint:fix`, `verify`).
3. Updated routing policy so commit-preparation stage includes strict commit-execution path.

- Known deviations:
1. Source generic `npm test` gate is mapped to canonical local `npm run verify`.
2. Commit/push execution remains explicit-confirmation gated per Codex safety rules.

### Slice 60 (Completed 2026-03-10): `.gemini/skills/katalepsis/SKILL.md`

- Source behavior:
1. Guide user understanding of delivered work through categorized entry points.
2. Use Socratic verification loops instead of one-shot explanation monologues.
3. Track comprehension completion tasks until convergence.

- Coupled dependencies reviewed:
1. Existing planning files (`task_plan.md`, `progress.md`) used for comprehension tracking.
2. `orchestrator`, `reflexion`, and `wrap` handoff semantics.

- Codex-native target:
1. Added new local skill: `.codex/skills/katalepsis/SKILL.md`.
2. Preserved source behavior with Codex-native templates for entry-point selection and comprehension task registration.
3. Updated routing policy with dedicated comprehension-closure stage and usage rule.

- Known deviations:
1. Source symbolic protocol flow is represented as operational phases.
2. Source `activate_skill` phrasing remains replaced by explicit next-step handoff instructions.

## Next Artifact

1. `.gemini/skills/knowledge-bridge/SKILL.md`
