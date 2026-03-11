---
name: ultrawork
description: The "Factory Mode" for Lisa. Uses strict State, DAG Plans, and Mechanical Verification to prevent drift. Use when the user demands high reliability and "no hallucination".
---

# Ultrawork: The Drift-Proof Factory

## Philosophy
This skill transforms Lisa from a "Creative Studio" into a "Software Factory".
1.  **State is King**: We rely on `.gemini/state.json`, not conversation memory.
2.  **Plan is Law**: We execute the DAG in `PLAN.md` exactly.
3.  **Verification is Truth**: We use `verifier.sh` to mechanically check work. If it fails, we do not proceed.

## Workflow

### Phase 1: Specify (The Blueprint)
1.  **Init State**: Run `node .gemini/skills/ultrawork/scripts/state_manager.js init <feature_name>`.
2.  **Draft Plan**: Create `docs/plans/<feature>.md` using the **Strict DAG Template** (`.gemini/skills/ultrawork/templates/DAG_PLAN.md`).
3.  **Council Review**: (Optional but recommended) Use `agent-council` to review the DAG.
4.  **Lock**: User must say "Plan Approved" to proceed.

### Phase 2: Execute (The Factory)
**Loop for each TODO in DAG:**
1.  **Read State**: Check which TODO is next.
2.  **Execute**: Write code / run commands as defined in the Step.
3.  **Lie Detector**:
    *   Extract the `Mechanical Verification` JSON block from the plan.
    *   Run: `echo $JSON | .gemini/skills/ultrawork/scripts/verifier.sh`
    *   **IF PASS**: Mark TODO complete in Plan & State.
    *   **IF FAIL**: Stop. Analyze error. Retry fix (max 2 times) or ask for help.

### Phase 3: Compound (The Archive)
1.  **Reset State**: Run `state_manager.js reset`.
2.  **Log**: Update `docs/learnings.md` with what went wrong/right.

## Commands

*   `/ultrawork start <feature>`: Initialize a new factory run.
*   `/ultrawork status`: Check `state.json`.
*   `/ultrawork resume`: Pick up where we left off (useful after crash).

## The Golden Rule
**"Show me the exit code."**
Never accept an agent's claim of "It works". Always run the verifier script.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
