---
name: reflexion
description: "Extract session insights and persist to memory. Trigger when user says 'wrap up', 'save to memory', 'what did we learn', 'reflect on session'. Use for insight crystallization."
  Extract session insights and persist to memory. Trigger when user says "wrap up", "save to memory", "what did we learn", "reflect on session". Use for insight crystallization.
user-invocable: true
---

# Reflexion Protocol (Gemini Edition)

Extract session insights and reconstruct user's memory through conversational guidance, enabling cross-session learning.

## Definition

**Reflexion** (Latin *reflexio*, "bending back"): A procedural workflow for extracting tacit session knowledge into explicit memory through guided dialogue.

```
── PHASE MAPPING ──
Phase 1: Detect session context
Phase 2: Parallel extraction (dispatching-parallel-agents)
Phase 3: Guided selection (Interactive Pause)
Phase 4: Integration (Write to docs/learnings.md or docs/decisions/)
Phase 5: Verification & Cleanup
```

## Tool Mapping (Claude → Gemini)

| Claude Tool | Gemini CLI Equivalent |
|-------------|-----------------------|
| `AskUserQuestion` | **Interactive Pause Pattern**: Output the question text (with options) and stop. Wait for user input. |
| `Task` (Sub-agent) | **`dispatching-parallel-agents`**: Use this skill to run extraction prompts in parallel. |
| `TodoWrite` | **`planning-with-files`**: Use `task_plan.md` to track reflexion phases. |

## Core Principle

**Crystallization over Accumulation**: Distill structured insights; do not merely archive raw experience.

## Mode Activation

### Activation

Command invocation (e.g., `/reflect`) or wrap-up request (e.g., "let's save what we learned") activates mode.

## Protocol

### Phase 1: Context Detection

Identify session ID, project paths, and memory mode (User vs Project). Record this in `findings.md`.

### Phase 2: Parallel Extraction

Activate **`dispatching-parallel-agents`** with the prompts located in `.gemini/skills/reflexion/prompts/`:
1. `insight-extractor.md`
2. `session-summarizer.md`
3. `knowledge-finder.md`

Wait for all sub-agents to complete.

### Phase 3: Guided Selection (Interactive Pause)

Use **Interactive Pause** to guide the user through the extracted findings.

```
### 🧠 Reflexion: Insight Selection
The following insights were extracted. Which should be persisted to memory?

**Options:**
1. **[Insight 1]**
2. **[Insight 2]**
3. **[Insight 3]**
4. **None (skip saving)**
```

### Phase 4: Integration

**Goal**: Persist selected insights to the persistent documentation graph.

**Targets**:
1.  **Learnings**: Append to `docs/learnings.md`.
    *   *Format*: `## YYYY-MM-DD: [Title]\n- [Insight]\n- **Context**: [Context]`
2.  **Decisions**: Create new ADR in `docs/decisions/` if an architectural choice was made.
    *   *Format*: `YYYY-MM-DD-{topic}.md`
3.  **Patterns**: Update `notes/` if a general engineering pattern was discovered.

### Phase 5: Verification

Confirm completion and clean up any temporary state.

## Rules

1. **Interactive Pause**: You MUST stop after presenting selection options. No tool calls until response.
2. **Crystallization**: Focus on high-value insights (the "Why") rather than raw logs (the "What").
3. **Parallelism**: Use `dispatching-parallel-agents` for the extraction phase to save time.
4. **Convergence**: Mode remains active until all selected insights are integrated.

## Synergies (Skill Integration)

`reflexion` is the memory management layer for the skill ecosystem:

- **+ `dispatching-parallel-agents`**: MANDATORY for Phase 2. Enables fast, parallel extraction of insights from session logs.
- **+ `systematic-debugging`**: `reflexion` is the final step of a debugging session, ensuring the "Root Cause" is persisted as a long-term learning.
- **+ `orchestrator`**: Triggered by the Orchestrator at the end of major milestones to "crystallize" the session's value.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
