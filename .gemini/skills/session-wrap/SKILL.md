---
name: session-wrap
description: Comprehensive session wrap-up. Simulates a 4-agent team (Doc Updater, Automation Scout, Learning Extractor, Planner) to rigorously close a session. Integrated with the Reflexion protocol.
---

# Session Wrap (Epistemic Edition)

## Overview
You are not just "ending" a session. You are **consolidating gains and crystallizing knowledge**.
You will simulate a team of 4 specialists to analyze the work done.

**Mandate**: No session ends with stale documentation or lost insights.

## Phase 1: Context Gathering (The "Git Status" Agent)

**Instruction:** "I am gathering context."
1.  **Run:** `git status`
2.  **Run:** `git diff --stat` (summary of changes)
3.  **Run:** `git diff HEAD~1 HEAD` (if recent commit) or `git diff` (if uncommitted).
4.  **Read:** `GEMINI.md` (Workflow Rules) and `task_plan.md` (if exists).

## Phase 1.5: The Janitor (Code Quality)

**Instruction:** "I am the Janitor. I ensure the code is clean before we wrap up."
1.  **Run:** `npm run lint:fix`
2.  **Output:** "✨ Linting fixed."

## Phase 2: The Doc Updater Persona (MANDATORY)

**Instruction:** "I am the Doc Updater. My job is to ensure documentation matches reality and is well-organized."
*   **Reconcile findings.md**: Turn findings MUST be moved to `docs/logs/YYYY-MM-DD.md` or `docs/logs/YYYY-MM-DD-topic.md` (e.g. `2026-02-09-moonstone-guard-fix.md`) for fix/session records.
*   **Crystallize learnings.md**: High-value insights ("gems") MUST be persisted to `docs/learnings.md`.
*   **SSOT Alignment**: If architectural boundaries or core capabilities changed (e.g. Durable Execution, Outbox Pattern), you MUST update `VISION.md`, `SPEC.md`, and relevant `specs/*.md`.
*   **Capabilities Catalog**: If new commands, skills, or policies were introduced, you MUST update `notes/07-Gemini-Capabilities-Catalog.md`.
*   **Analyze diff**: Look at the `git diff`.
    *   Did we add a new Environment Variable? -> **MUST** update `.env.example` or `GEMINI.md`.
    *   Did we change a workflow? -> **MUST** update `GEMINI.md` / `notes/01-Workflow-Playbook.md`.
    *   Did we add a new Tool/Skill? -> **MUST** update `SPEC.md` and `notes/07-Gemini-Capabilities-Catalog.md`.
    *   Did we create new documents? -> **MUST** ensure they are linked in `GEMINI.md` or `notes/00-Index.md`.
*   **Action:**
    *   If updates are needed, **perform them now**. Do not just suggest them.
    *   "📝 Updating `docs/learnings.md` with crystallized insights..."
    *   "📝 Updating SSOT (VISION.md/SPEC.md) with new architectural invariants..."
    *   "📝 Reconciling turn findings to `docs/logs/YYYY-MM-DD.md` or `docs/logs/YYYY-MM-DD-topic.md`..."

## Phase 3: The Automation Scout Persona

**Instruction:** "I am the Automation Scout. I look for toil."
*   **Analyze:** Look at the commands run (or implied by file changes).
    *   Did we run the same long command 3 times? -> Propose a `.gemini/commands/*.toml` alias.
    *   Did we manually edit 5 files in a pattern? -> Propose a `scaffold-*.ts` script.
*   **Output:**
    *   "✅ No toil detected" OR
    *   "💡 **Automation Opportunity**: Create command `test:fast` for `npm test -- --only=changed`."

## Phase 4: The Learning Extractor (Reflexion)

**Instruction:** "I am the Learning Extractor. I crystallize insights using the Reflexion protocol."
*   **Action**: **MUST** activate the `reflexion` skill.
*   **Goal**: Ensure insights are extracted via parallel agents and selected through Socratic dialogue, then persisted to `docs/learnings.md` or `docs/decisions/`.

## Phase 5: The Follow-up Planner Persona

**Instruction:** "I am the Planner. I ensure we pick up where we left off."
*   **Analyze:** Check `task_plan.md` vs `git status`.
    *   Are there uncommitted changes?
    *   Is the current phase complete?
*   **Action:**
    *   Update `task_plan.md` (mark items `[x]`).
    *   Generate **Next Session Goal**.

## Phase 6: Final Handoff (The "Lead")

**Instruction:** "I am the Lead. I verify the team's work."
1.  **Summary:**
    *   "Linting: ✅"
    *   "Docs: ✅ Correctly linked and updated."
    *   "Reflexion: ✅ Insights crystallized to persistent memory."
    *   "Plan: ✅ Updated `task_plan.md`."
2.  **Final Message**: Provide a concise handoff for the next session.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md` or, for fix/session records, `docs/logs/YYYY-MM-DD-topic.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
