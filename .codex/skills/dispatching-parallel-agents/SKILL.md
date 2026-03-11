---
name: dispatching-parallel-agents
description: Decompose independent problem domains and execute parallel investigation safely without state or file-conflict collisions.
---

# dispatching-parallel-agents

Codex-native migration of Gemini `dispatching-parallel-agents`.

## Purpose

Speed up multi-issue investigations by parallelizing only truly independent workstreams while preventing merge/state collisions.

## Protocol

### Phase 1: Independence Gate (Mandatory)

Before parallelizing, prove domains are independent:
1. File overlap check: no expected edits to the same key files.
2. State overlap check: no shared mutable runtime state between tasks.
3. Dependency overlap check: one task does not rely on output of another.

If any overlap is uncertain, do not parallelize. Use `orchestrator` for sequential slicing.

### Phase 2: Task Packet Definition

Create one packet per domain with:
1. Narrow scope (single file group/subsystem/failure class).
2. Concrete success signal (exact tests/checks/log evidence).
3. Constraints (what not to touch).
4. Required output (root cause + changes + verification).

### Phase 3: Parallel Execution Strategy

Use parallelism where this runtime supports it:

1. For independent reads/research/inspection commands, use `multi_tool_use.parallel`.
2. For independent edit plans, parallelize investigation first, then apply patches deterministically to avoid write conflicts.
3. Never run parallel edits targeting the same file set.
4. Avoid broad "fix everything" packets.

### Phase 4: Integration And Verification

1. Reconcile outputs into a single change plan.
2. Check conflicts explicitly (`git status`, touched-file overlap).
3. Run full-scope verification, not only per-domain checks.
4. If integration fails, roll back to sequential remediation by dependency order.

## Prompt/Task Packet Template

```markdown
Domain: [single failure area]
Goal: [what must pass]
Constraints: [do-not-change boundaries]
Evidence Required:
- root cause
- exact files changed
- validation command + result
```

## Common Failure Modes

1. False independence assumptions leading to hidden coupling regressions.
2. Packets too broad, causing diff sprawl and low accountability.
3. Per-domain checks pass but full-suite integration fails.
4. Parallel edits collide in shared utility files.

## Skill Synergy

1. With `systematic-debugging`: parallel root-cause isolation across unrelated failure classes.
2. With `dev-scan`: parallel source gathering across communities.
3. With `reflexion`: parallel extraction of lessons/patterns from distinct evidence sets.
4. With `prothesis`: compare independent solution paths in parallel before selecting one.

## Exit Protocol

1. Reconcile findings into `docs/logs/YYYY-MM-DD.md`.
2. Promote durable parallelization patterns and anti-patterns to `docs/learnings.md`.
3. Update `task_plan.md` and `progress.md` with independence decision and integration outcomes.
