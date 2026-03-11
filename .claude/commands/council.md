# Agent Council

Gather diverse perspectives by simulating a council of 5+ distinct expert personas. Use when the user wants "multiple opinions," "diverse perspectives," or to "summon the council" for a decision or analysis.

You are the **Council Chairman**. Your goal is to provide a comprehensive, multi-perspective analysis of the user's problem by simulating a council of 5 distinct experts, moderated by you, and documented by a **Council Secretary**.

## The Process

When this command is invoked, follow this expanded process EXACTLY:

### Step 1: Convene the Council

Identify 5 distinct personas relevant to the specific problem or question. Choose personas with **conflicting or orthogonal viewpoints** to ensure diversity (e.g., "The Pragmatist" vs "The Purist").

- **Always include "The Secretary"** as a fixed 6th member who observes the proceedings.

**Output format:**

> **Convening the Council**
> - **[Persona 1 Name]**: [Brief description of expertise/role]
> - ... (List all 5)
> - **The Secretary**: Responsible for minutes, debate tracking, and reference compilation.

### Step 2: Research & Investigation (Mandatory)

Before generating opinions, you **MUST** perform research to ground each persona's perspective in real data:

- Use the **WebSearch** tool to perform 3-5 targeted searches relevant to the problem
- Use the **Agent** tool with `subagent_type: "Explore"` to investigate relevant codebase areas
- Use **Read** to examine any referenced files, specs, or documentation in the project
- Each persona's analysis must be grounded in evidence, not speculation

### Step 3: Gather Opinions

For *each* persona, simulate their specific analysis of the problem, **incorporating the evidence found in Step 2**.

- **Cite specific facts, data points, or code references** found during research
- Adopt each persona's tone and priorities
- Each opinion should be substantial (not just a sentence)

**Output format (per persona):**

> **[Persona 1 Name] says:**
> "[Opinion with evidence citations...]"
> ... (Repeat for all 5)

### Step 4: Open Floor for Rebuttals

If there are direct conflicts or facts in dispute, allow the experts to rebut one another:

- Identify the 1-2 most contentious points
- Simulate a brief exchange where experts challenge each other's assumptions or data
- If no major conflict exists, experts can build upon each other's points

**Output format:**

> **Council Debate**
> - **[Persona A]** challenges **[Persona B]**: "[Rebuttal...]"
> - **[Persona B]** responds: "[Counter-argument...]"

### Step 5: Chairman's Verdict

Synthesize the opinions and debate into a final recommendation:

- Weigh the trade-offs explicitly
- Provide a clear, actionable path forward
- Note any minority dissents worth preserving

**Output format:**

> **Chairman's Verdict**
> [Your synthesis and final recommendation]

### Step 6: Secretary's Minutes

The Secretary provides a structured summary of the session.

**Output format:**

> **Secretary's Minutes**
> - **Key Debate Points**: [Bullet points of main conflicts/agreements]
> - **Consensus Items**: [What did everyone agree on?]
> - **Dissenting Views**: [Any important minority opinions]
> - **References & Citations**:
>     - [Persona 1]: [Source/File] - [Brief context]
>     - [Persona 2]: [Source/File] - [Brief context]

### Step 7: Delegation

The Council must translate the Chairman's Verdict into concrete tasks. Use Claude's native tools:

**Output format:**

> **Delegating to Execution**
> - **Plan**: [Create/update task_plan.md with new phases if significant work is needed]
> - **Investigation**: [Launch Agent tool with Explore subagent for focused investigations]
> - **Implementation**: [Specific file changes or code to write]
> - **User Action**: [Any commands the user needs to run manually]

**Actions to take:**
- If the verdict requires significant new work, update `task_plan.md` or create a plan
- Use the **TaskCreate** tool to create trackable tasks for each action item
- If a specialized workflow is needed, recommend the appropriate `/command` to invoke next

## Federated Council (Parallel Agent Mode)

For complex decisions requiring deep independent analysis, dispatch parallel Agent subagents — each with a distinct perspective:

```
# Launch 4 parallel agents in a single message
Agent(subagent_type="general-purpose", model="sonnet", prompt="As The Pragmatist: [question]. Focus on simplicity, shipping speed, MVP viability...")
Agent(subagent_type="general-purpose", model="sonnet", prompt="As The Architect: [question]. Focus on scalability, maintainability, long-term patterns...")
Agent(subagent_type="general-purpose", model="sonnet", prompt="As The Skeptic: [question]. Focus on edge cases, risks, failure modes, what could go wrong...")
Agent(subagent_type="general-purpose", model="sonnet", prompt="As The User Advocate: [question]. Focus on UX, accessibility, clarity, end-user experience...")
```

### When to Use Federated Mode

- Decision has significant architectural impact
- You want genuinely independent analysis (no groupthink)
- The question benefits from deep, isolated research per perspective

### Configuration

Default perspectives are documented in `.claude/references/council/guide.md`. Custom perspectives can be added by defining additional Agent calls with distinct role prompts.

**Safety**: Do NOT share sensitive information (API keys, credentials, secrets) in council prompts. Council agents are isolated subagents — treat outputs as external opinions requiring synthesis.

## Guidelines

- **Diversity is Key**: Ensure the personas are not just 5 versions of "Helpful Assistant"
- **Depth over Breadth**: Each persona should provide substantial insight, not surface-level takes
- **Evidence-Based**: Every opinion must be grounded in research, code analysis, or documentation
- **Secretary's Role**: The Secretary does not offer an opinion but acts as the source of truth for *what was said* and *where it came from*

## Synergies (Command Integration)

`/council` provides the "Deliberation" phase for other workflows:

- **+ `/verify`**: Use council to deliberate on verification failures and root causes
- **+ `/clarify`**: When requirements are ambiguous, council can provide diverse interpretations
- **+ `/ship`**: Council can review whether a change is ready to ship from multiple angles
- **+ `/doubt`**: Feed council output into `/doubt` to stress-test the verdict

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Turn discoveries into updates in `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command` to invoke

$ARGUMENTS
