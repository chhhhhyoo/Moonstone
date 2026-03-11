# Brainstorming Ideas Into Designs

Design & Intent discovery. Trigger when user says "brainstorm", "design a feature", or "help me with an idea". Uses multi-perspective epistemic analysis to turn ideas into fully formed designs and specs through collaborative dialogue.

## The Process

### Step 1: Intent Clarification (Hermeneia Protocol)

If the user's idea is vague or underspecified, you MUST clarify intent before any design work.

**Protocol: Hermeneia** (ἑρμηνεία) - Transform known unknowns into known knowns.

1. **Expression Confirmation**: Use `AskUserQuestion` to confirm which expression to clarify:
   - "Clarify my last message" vs "Let me describe what I want to clarify"

2. **Gap Type Selection**: Use `AskUserQuestion` to let the user select the gap type. Do NOT auto-diagnose:
   - **Expression** - Incomplete articulation ("I couldn't fully articulate what I meant")
   - **Precision** - Ambiguous scope/degree ("The scope or degree is unclear")
   - **Coherence** - Internal contradictions ("There may be internal contradictions")
   - **Context** - Missing background ("Background information is missing")

3. **Socratic Clarification**: Use `AskUserQuestion` with **consequential framing** - show downstream effects of each choice:
   - Each option: "[Interpretation] - if this, then [implication for your goal]"
   - Always include a "Let me reconsider" option

4. **Loop** until intent is fully crystallized. Mode remains active until the user confirms understanding.

**Rules**: Articulation over Assumption. Frame questions to guide discovery (maieutic), not merely gather data. Present options (recognition) rather than open questions (recall). User's choice is final.

### Step 2: Multi-Perspective Research (Prothesis Protocol)

Before proposing a design, you MUST look at the problem from multiple angles grounded in evidence.

**Protocol: Prothesis** (πρόθεσις) - Transform unknown unknowns into known unknowns by presenting epistemic perspectives.

1. **Context Gathering**: Use `Agent` (Explore) + `Read` + `Grep` + `WebSearch` to gather project context, documentation, and relevant research.

2. **Perspective Placement**: Use `AskUserQuestion` to present 2-4 distinct epistemic perspectives:
   ```
   Available epistemic perspectives for this inquiry:
   1. [Perspective A]: [Analytical Contribution - 1 line]
   2. [Perspective B]: [Analytical Contribution - 1 line]
   3. [Perspective C]: [Analytical Contribution - 1 line]
   Which lens(es) would you like to use?
   ```
   Use `multiSelect: true` on the AskUserQuestion to allow selecting multiple perspectives.

3. **Parallel Inquiry (MANDATORY - Epistemic Integrity)**: For each selected perspective, launch an `Agent` (general-purpose) subagent **in parallel**. You MUST NOT analyze perspectives yourself - delegate to isolated subagents to prevent context contamination.

   Each agent prompt:
   ```
   You are a [Perspective] Expert.
   Analyze from this epistemic standpoint:
   Question: [Original question verbatim]

   Provide:
   1. Epistemic Contribution: What this lens uniquely reveals.
   2. Framework Analysis: Domain-specific concepts and reasoning.
   3. Horizon Limits: What this perspective cannot see.
   4. Assessment: Direct answer from this viewpoint.
   ```

4. **Synthesis (Horizon Integration)**: After subagents return, synthesize:
   - **Convergence** (Shared Horizon): Where perspectives agree
   - **Divergence** (Horizon Conflicts): Where they disagree
   - **Integrated Assessment**: Synthesized answer with attribution
   - CONSTRAINT: Synthesis only combines what perspectives provided; no new analysis

5. **Sufficiency Check**: Use `AskUserQuestion`:
   - "Sufficient - Proceed with this understanding"
   - "Add Perspective - Explore additional viewpoints"
   - "Refine Existing - Revisit one of the analyzed perspectives"

**Support Tools:**
- If choosing between technologies/libraries: Recommend `/council` for deep multi-AI comparison
- Use `WebSearch` for community sentiment and "best of breed" validation

### Step 3: Understanding & Refining

- Ask questions **one at a time** using `AskUserQuestion`
- Focus on purpose, constraints, and success criteria
- Ground each question in findings from Step 2

### Step 4: The "Strawman" Proposal

Propose a **"Strawman"** - a rough, deliberately imperfect concept designed to provoke a reaction and refine thinking. Present it clearly as a strawman, inviting critique.

### Step 5: Presenting the Design

- Present the design in sections (200-300 words each)
- After each section, use `AskUserQuestion` to confirm:
  - "Looks good, continue" / "Needs adjustment" / "Rethink this section"
- Do NOT generate the full design at once

## After the Design

### Documentation (Knowledge Bridge Protocol)

1. **Save the Design**: Write the validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`

2. **Log Architectural Decisions (ADR)**: If an architectural choice was made, create:
   ```
   docs/decisions/YYYY-MM-DD-<title-kebab-case>.md
   ```
   With format: Context, Decision, Consequences

3. **Daily Log**: Append a summary entry to `docs/logs/YYYY-MM-DD.md`

4. **Crystallize Learnings**: If reusable patterns emerged, append to `docs/learnings.md`

### Implementation Handoff

1. **Recommend Git Worktree**: For implementation isolation, suggest starting a worktree
2. **Create Plan**: Use `EnterPlanMode` to transition into a detailed implementation plan
3. **Create Tasks**: Use `TaskCreate` to break the design into trackable implementation tasks

## Rules

- **Interactive Pause**: You MUST stop generation after presenting perspective options or design sections. Wait for user response via `AskUserQuestion`.
- **Epistemic Integrity**: NEVER analyze perspectives yourself in the main conversation. ALWAYS delegate to Agent subagents.
- **Traceability**: All insights must be captured in documentation (findings, logs, learnings)
- **Evidence-Based**: Ground all perspectives in research, code analysis, or documentation - not speculation

## Synergies (Command Integration)

`/brainstorm` acts as the creative funnel that feeds into structured workflows:

- **+ `/council`**: For "A vs B" technology decisions or when multiple AI perspectives are needed
- **+ `/clarify`**: If requirements need deeper disambiguation before brainstorming
- **+ `/verify`**: Validate that the design aligns with existing specs and constraints
- **+ `/factory-init`**: Initialize planning files for the implementation phase

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries from `findings.md` to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract ADRs, patterns, root causes to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command` to invoke

$ARGUMENTS
