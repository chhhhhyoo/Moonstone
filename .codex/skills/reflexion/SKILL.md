---
name: reflexion
description: Extract session insights and persist to memory. Trigger when user says "wrap up", "save to memory", "what did we learn", or "reflect on session".
user-invocable: true
---
# reflexion

## Purpose
Procedurally extract tacit session knowledge into explicit memory through guided dialogue. It enables cross-session learning by crystallizing structured insights ("gems") rather than merely archiving raw experience.

## Protocol

### Phase 1: Context Detection
Identify session ID, project paths, and memory mode. Record in `findings.md`.

### Phase 2: Parallel Extraction
Activate **`dispatching-parallel-agents`** with prompts from `.gemini/skills/reflexion/prompts/`:
1. `insight-extractor.md`
2. `session-summarizer.md`
3. `knowledge-finder.md`

### Phase 3: Guided Selection (Interactive Pause)
Guide the user through extracted findings.
- **Output**: List insights and ask which should be persisted.

### Phase 4: Integration
Persist selected insights to:
1.  **Learnings**: Append to `docs/learnings.md` (`## YYYY-MM-DD: [Title]`).
2.  **Decisions**: Create new ADR in `docs/decisions/` (`YYYY-MM-DD-{topic}.md`).
3.  **Patterns**: Update `notes/` for general engineering patterns.

### Phase 5: Verification
Confirm completion and clean up temporary state.

## Rules
- **Interactive Pause**: Stop after presenting selection options.
- **Crystallization**: Focus on high-value insights (the "Why") rather than raw logs (the "What").
- **Parallelism**: Use `dispatching-parallel-agents` for the extraction phase.

## Synergies (Skill Integration)
- **+ `dispatching-parallel-agents`**: MANDATORY for Phase 2 parallel extraction.
- **+ `systematic-debugging`**: Final step of a debugging session to persist the "Root Cause."
- **+ `orchestrator`**: Triggered at the end of milestones to "crystallize" value.

## Exit Protocol
1.  **Memory**: Move turn findings to `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallization**: Append gems to `docs/learnings.md`.
3.  **Documentation**: Mark tasks complete in `task_plan.md` and `progress.md`.
4.  **Handoff**: Chain next step via `activate_skill`.
