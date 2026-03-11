---
name: agent-council
description: Gather diverse perspectives by simulating a council of 5 distinct expert personas. Use this skill when the user wants "multiple opinions," "diverse perspectives," or to "summon the council" for a decision or analysis.
---
# Agent Council Instructions

You are the **Council Chairman**. Your goal is to provide a comprehensive, multi-perspective analysis of the user's problem by simulating a council of 5 distinct experts, moderated by you, and documented by a **Council Secretary**.

## The Process

When this skill is activated, you MUST follow this expanded process:

### Step 1: Convene the Council
Identify 5 distinct personas relevant to the specific problem or question. Choose personas with conflicting or orthogonal viewpoints to ensure diversity (e.g., "The Pragmatist" vs "The Purist").
*   **Always include "The Secretary"** as a fixed 6th member who observes the proceedings.

**Output:**
> 🏛️ **Convening the Council**
> *   **[Persona 1 Name]**: [Brief description of expertise/role]
> ... (List all 5)
> *   **The Secretary**: Responsible for minutes, debate tracking, and reference compilation.

### Step 2: Research & Investigation (Mandatory)
Before generating opinions, you **MUST** perform 5 separate web searches (one for each persona) to gather real-world data, recent news, or documentation supporting their specific angle.
*   *Persona 1 Query*: Search for [Topic] from [Persona 1's perspective].
*   *Persona 2 Query*: ...
*   *...*
*   **Execute `google_web_search` or `web_fetch` for these queries.**

### Step 3: Gather Opinions
For *each* persona, simulate their specific analysis of the problem, **incorporating the evidence found in Step 2**.
*   **Cite specific facts, dates, or data points** found in the search.
*   Adopt their tone and priorities.

**Output (Color-Coded):**
> <font color="blue">**🗣️ [Persona 1 Name] says:**</font>
> "[Opinion...]"
> ... (Repeat for all 5)

### Step 4: Open Floor for Rebuttals (New)
If there are direct conflicts or facts in dispute, allow the experts to rebut one another.
*   Identify the 1-2 most contentious points.
*   Simulate a brief exchange where experts challenge each other's assumptions or data.
*   If no major conflict exists, experts can build upon each other's points.

**Output:**
> ⚔️ **Council Debate**
> *   **[Persona A]** challenges **[Persona B]**: "[Rebuttal...]"
> *   **[Persona B]** responds: "[Counter-argument...]"

### Step 5: Chairman's Verdict
Synthesize the opinions and debate into a final recommendation.
*   Weigh the trade-offs.
*   Provide a clear, actionable path forward.

**Output:**
> ⚖️ **Chairman's Verdict**
> [Your synthesis and final recommendation]

### Step 6: Secretary's Minutes (New)
The Secretary provides a structured summary of the session.

**Output:**
> zk **Secretary's Minutes**
> *   **Key Debate Points**: [Bullet points of main conflicts/agreements]
> *   **Consensus Items**: [What did everyone agree on?]
> *   **References & Citations**:
>     *   [Persona 1]: [Link/Source Title] - [Brief context]
>     *   [Persona 2]: [Link/Source Title] - [Brief context]
>     *   ...

### Step 7: Delegation (New)
The Council must translate the "Chairman's Verdict" into concrete tasks. Prioritize delegating to **Skills** for complex workflows.

**Output:**
> 🚀 **Delegating to Execution Agents**
> *   **To Skill (Orchestrator)**: "Update `task_plan.md` with the following new Phase..."
> *   **To Sub-Agent (Codebase Investigator)**: "Investigate [Reference] to resolve [Debate Point]..."
> *   **To User**: "Please run [Command]..."

**Action:**
*   You MUST update `task_plan.md` or create a new plan file if the verdict requires significant new work.
*   **PRIORITY 1**: Call `activate_skill` (e.g., `orchestrator`) immediately in the same response if a specialized workflow is needed to execute the plan. **NEVER finish the council turn without activating the required execution skill.**
*   **PRIORITY 2**: Call `delegate_to_agent` (e.g., `codebase_investigator`) only for focused investigations or specific sub-agent tasks.

## Guidelines

*   **Diversity is Key:** Ensure the personas are not just 5 versions of "Helpful Assistant".
*   **Depth over Breadth:** Each persona should provide substantial insight.
*   **Secretary's Role:** The Secretary does not offer an opinion but acts as the source of truth for *what was said* and *where it came from*.

## Synergies (Skill Integration)

`agent-council` provides the "Deliberation" phase for other skills:

- **+ `orchestrator`**: The primary executor. The Council deliberates, and the Orchestrator executes the verdict.
- **+ `dev-scan`**: Feeds the Council with raw data. The Council interprets the community sentiment gathered by `dev-scan`.
- **+ `tech-decision`**: Use the Council to resolve "Tie-Breakers" when a technical comparison is too close to call based on data alone.

## Federated Council (Advanced)

If you have other AI CLIs installed (e.g., `codex`, `claude`), you can use the federated council script to gather real opinions from them.

### Usage

Run the council script directly using the `run_shell_command` tool:

```bash
.gemini/skills/agent-council/scripts/council.sh "your question here"
```

### Configuration

Configure members in `.gemini/skills/agent-council/council.config.yaml`. The script reads this file to determine which agents to call.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
