---
name: agent-council
description: Gather diverse perspectives by simulating a council of 5 distinct expert personas. Use this skill when the user wants "multiple opinions," "diverse perspectives," or to "summon the council" for a decision or analysis.
---
# agent-council

## Purpose
Run explicit deliberation before implementation when a decision has non-trivial tradeoffs, uncertainty, or stakeholder conflict. By simulating a council of 5 distinct experts moderated by a Chairman and documented by a Secretary, we ensure a comprehensive, multi-perspective analysis that is traceable and grounded in evidence.

## Protocol

### Step 1: Convene the Council
Identify 5 distinct personas relevant to the problem. Choose personas with conflicting or orthogonal viewpoints (e.g., "Security CTO" vs "Lead UX"). Always include **The Secretary** as a fixed member for minutes and reference compilation.

### Step 2: Research & Investigation (Mandatory)
Before generating opinions, perform 5 separate web searches (one for each persona) using `google_web_search` or `web_fetch`. Gather real-world data, recent news, or documentation supporting their specific angle.

### Step 3: Gather Opinions
For each persona, simulate their specific analysis, incorporating the evidence found in Step 2. Cite specific facts, dates, or data points. Adopt their specific tone and priorities.

### Step 4: Open Floor for Rebuttals
Identify the 1-2 most contentious points. Simulate a brief exchange where experts challenge each other's assumptions or data. If no major conflict exists, experts build upon each other's points.

### Step 5: Chairman's Verdict
Synthesize the opinions and debate into a final recommendation. Weigh the trade-offs and provide a clear, actionable path forward.

### Step 6: Secretary's Minutes
Provide a structured summary:
- **Decision**: [chosen path]
- **Consensus Items**: [agreed points]
- **Disagreements**: [unresolved conflicts]
- **References & Citations**: [source + context per persona]

### Step 7: Delegation (Execution Translation)
Translate the verdict into concrete tasks.
- **Action**: Update `task_plan.md` or create a new plan file if required.
- **Priority**: Call `activate_skill` (e.g., `orchestrator`) immediately in the same response if a specialized workflow is needed. **NEVER finish the council turn without an execution handoff.**

## Synergies (Skill Integration)
- **+ `orchestrator`**: The primary executor. The Council deliberates, and the Orchestrator executes.
- **+ `dev-scan`**: Feeds the Council with raw community data.
- **+ `tech-decision`**: Use the Council to resolve "Tie-Breakers" in technical comparisons.

## Federated Council (Advanced)
Use real multi-CLI opinions via the packaged script:
```bash
.gemini/skills/agent-council/scripts/council.sh "your question here"
```
Configuration lives in `.gemini/skills/agent-council/council.config.yaml`.

## Exit Protocol
1.  **Reconcile Memory**: Move findings to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract ADRs, patterns, and root causes to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off via `activate_skill`.
