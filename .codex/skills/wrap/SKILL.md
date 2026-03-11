---
name: wrap
description: Close a session with zero context loss by reconciling plans, logs, learnings, and next-session handoff. Trigger on "wrap", "/wrap", or end-of-session requests.
---

# wrap

Codex-native migration of Gemini `/wrap`.

## Purpose

End sessions with explicit state reconciliation, durable memory updates, and actionable handoff notes.

## Protocol

### Phase 1: Context Snapshot

1. Capture `git status --short`.
2. Capture `git diff --stat`.
3. Re-read `task_plan.md`, `findings.md`, and `progress.md` when present.
4. Recall persisted session state when available (`npm run state:recall`).

### Phase 2: Documentation Reconciliation (Mandatory)

1. Move material findings into `docs/logs/YYYY-MM-DD.md`.
2. Promote durable patterns to `docs/learnings.md`.
3. Ensure governance docs/spec links reflect newly added artifacts where relevant.
4. **SSOT Alignment**: If architectural boundaries or core capabilities changed (e.g. Durable Execution, Outbox Pattern, Provider interfaces), you MUST update the Single Source of Truth: `VISION.md`, `SPEC.md`, and relevant `specs/*.md`.
5. **Capabilities Catalog**: If new commands, skills, or policies were introduced, you MUST update `notes/07-Gemini-Capabilities-Catalog.md`.
6. Refresh passive context index when docs/spec/governance files changed (`npm run refresh:cognitive-map`).

### Phase 3: Verification Hygiene

1. If runtime files changed, run `npm run lint:fix` before final verification.
2. If code or governance logic changed, run at least `npm run verify`.
3. If strict-tier or runtime-risk scope changed, run `npm run verify:strict`.
4. Validate freshness before completion claims (`npm run check:verification-fresh`).
5. Record exact command results in `progress.md`.

### Phase 4: Automation/Toil Scan

Identify repeated manual work and note concrete automation opportunities (script, command alias, guard) in `docs/logs/YYYY-MM-DD.md`.

### Phase 5: Next Session Handoff

1. Update `task_plan.md` with completed and next slice.
2. State one concrete next-session goal.
3. Flag unresolved risks or blockers explicitly.

### Phase 6: Final Wrap Summary

Provide concise wrap report:

1. Verification state.
2. Docs/memory reconciliation status.
3. Pending next action.
4. Persist session close state (`npm run state:set -- --skill wrap --phase closed`).

## Rules

1. No session close with stale findings outside durable logs.
2. No "done" signal without verification evidence for changed scope.
3. No hidden blockers; unresolved risks must be explicit.

## Skill Synergy

1. With `reflexion`: extract and formalize higher-order learnings.
2. With `ship`: use when closing a release-prep session.
3. With `manage-skills`: run catalog hygiene checks at milestone boundaries.

## Exit Protocol

1. `docs/logs/YYYY-MM-DD.md` updated.
2. `docs/learnings.md` updated when new durable insights exist.
3. `task_plan.md` and `progress.md` reflect real session state.
