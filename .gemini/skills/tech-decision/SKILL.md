---
name: tech-decision
description: This skill should be used when the user asks about "technical decision", "what to use", "A vs B", "comparison analysis", "library selection", "architecture decision", "which one to use", "tradeoffs", "tech selection", "implementation approach", or needs deep analysis for technical decisions. Provides systematic multi-source research and synthesized recommendations.
version: 0.1.0
---

# Tech Decision - Deep Technical Decision Analysis

Skill for systematically analyzing technical decisions and deriving comprehensive conclusions.

## Core Principle

**Conclusion First**: All reports present the conclusion first, then provide evidence and rationale.

## Use Cases

- Library/framework selection (React vs Vue, Prisma vs TypeORM)
- Architecture pattern decisions (Monolith vs Microservices, REST vs GraphQL)
- Implementation approach selection (Server-side vs Client-side, Polling vs WebSocket)
- Tech stack decisions (Language, database, infrastructure, etc.)

## Decision Workflow

### Phase 1: Problem Definition

Clarify the decision topic and context:

1. **Identify Topic**: What exactly needs to be decided?
2. **Identify Options**: What are the primary choices to compare?
3. **Establish Criteria**: What criteria will be used for evaluation?
   - Performance, learning curve, ecosystem, maintainability, cost, etc.
   - Set priorities based on project-specific characteristics.
   - Reference **`references/evaluation-criteria.md`** for detailed criteria.

### Phase 2: Parallel Information Gathering

Gather information from multiple sources simultaneously. **Must run in parallel**:

```
┌─────────────────────────────────────────────────────────────┐
│  Run simultaneously (Parallel with Task tool)               │
├─────────────────────────────────────────────────────────────┤
│  1. codebase-explorer agent                                 │
│     → Analyze existing codebase, identify patterns/constraints│
│                                                             │
│  2. docs-researcher agent                                   │
│     → Research official docs, guides, and best practices    │
│                                                             │
│  3. Skill: dev-scan                                         │
│     → Gather community opinions (Reddit, HN, Dev.to, etc.)  │
│                                                             │
│  4. Skill: agent-council                                    │
│     → Gather various AI expert perspectives                 │
│                                                             │
│  5. [Optional] Context7 MCP                                 │
│     → Query latest docs per library                         │
└─────────────────────────────────────────────────────────────┘
```

### Phase 3: Synthesis Analysis

Run the `tradeoff-analyzer` agent with the gathered information:

- Organize pros/cons per option.
- Score options based on evaluation criteria.
- Organize conflicting opinions and evaluate reliability (source-based).

### Phase 4: Final Report Generation

Generate a conclusion-first comprehensive report with the `decision-synthesizer` agent (Template: **`references/report-template.md`**):

```markdown
# Technical Decision Report: [Topic]

## Conclusion (Executive Summary)
**Recommendation: [Option X]**
[1-2 sentence key reason summarizing the choice]

## Evaluation Criteria and Weights
| Criteria | Weight | Description |
|----------|--------|-------------|
| Performance | 30% | ... |
| Learning Curve | 20% | ... |

## Option Analysis

### Option A: [Name]
**Pros:**
- [Pro 1] (Source: official docs)
- [Pro 2] (Source: Reddit r/webdev)

**Cons:**
- [Con 1] (Source: HN discussion)

**Good fit for:** [Specific Scenario]

## Comprehensive Comparison
| Criteria | Option A | Option B | Option C |
|----------|----------|----------|----------|
| Performance | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Total** | **X pts** | **Y pts** | **Z pts** |

## Recommendation Rationale
1. [Key reason 1 with source]
2. [Key reason 2 with source]

## Risks and Considerations
- [Risk/Consideration 1]
- [Risk/Consideration 2]
```

## Resources Used

### Agents (Core Sub-Agents)

| Agent | Role |
|-------|------|
| `codebase-explorer` | Analyze existing codebase, identify patterns/constraints |
| `docs-researcher` | Research official docs, guides, best practices |
| `tradeoff-analyzer` | Organize pros/cons, comparative analysis |
| `decision-synthesizer` | Generate conclusion-first final report |

### Existing Skills (Integration)

| Skill | Purpose | How to Call |
|-------|------|-----------|
| `dev-scan` | Community opinions from Reddit, HN, Dev.to | `Skill: dev-scan` |
| `agent-council` | Gather various AI expert perspectives | `Skill: agent-council` |

## Quick Execution Guide

### 1. Simple Comparison (A vs B)
User: "React vs Vue which is better?"
1. Execute `docs-researcher` + `codebase-explorer` (parallel).
2. Call `dev-scan`.
3. Call `tradeoff-analyzer`.
4. Call `decision-synthesizer`.

### 2. Deep Analysis (Complex Decision)
User: "Which state management library should we use for this project?"
1. Execute `codebase-explorer` (analyze current state).
2. Parallel: `docs-researcher`, `dev-scan`, `agent-council`.
3. Call `tradeoff-analyzer`.
4. Call `decision-synthesizer`.

## Synergies (Skill Integration)

`tech-decision` acts as the analytical hub for technical choices:

- **+ `dev-scan`**: Uses `dev-scan` as a primary data source for community sentiment and "anti-search" criticism.
- **+ `orchestrator`**: Triggered by the Orchestrator whenever a "Should I use X or Y?" or "Which approach is better?" question arises during strategy design.
- **+ `systematic-debugging`**: Invoked when a bug's root cause suggests a fundamental architectural flaw or when choosing between multiple possible fixes.
- **+ `writing-plans`**: The output of `tech-decision` provides the "Decision Rationale" required in every high-quality implementation plan.

## Notes

1. **Provide Context**: Analysis accuracy improves with project characteristics, team size, and existing tech stack details.
2. **Confirm Criteria**: Always confirm which criteria matter most to the user first.
3. **Show Reliability**: Explicitly mark unclear or outdated sources.
4. **Conclusion First**: Always present the recommendation at the beginning.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
