# Tech Decision — Deep Technical Decision Analysis

Systematically analyze technical decisions using multi-source parallel research and synthesized recommendations.

**Core Principle**: Conclusion First — all reports present the conclusion first, then evidence and rationale.

## Use Cases

- Library/framework selection (React vs Vue, Prisma vs TypeORM)
- Architecture pattern decisions (Monolith vs Microservices, REST vs GraphQL)
- Implementation approach selection (Server-side vs Client-side, Polling vs WebSocket)
- Tech stack decisions (Language, database, infrastructure)

## Decision Workflow

### Phase 1: Problem Definition

Clarify the decision topic and context:

1. **Identify Topic**: What exactly needs to be decided?
2. **Identify Options**: What are the primary choices to compare?
3. **Establish Criteria**: What criteria will be used for evaluation?
   - Performance, learning curve, ecosystem, maintainability, cost, etc.
   - Set priorities based on project-specific characteristics.

Use `AskUserQuestion` to confirm which criteria matter most before proceeding.

### Phase 2: Parallel Information Gathering

> **Prompts**: Load subagent prompts from `.claude/prompts/tech-decide/` (codebase-explorer, docs-researcher, decision-synthesizer, tradeoff-analyzer).
> **References**: Use `.claude/references/tech-decide/evaluation-criteria.md` for scoring rubrics and `.claude/references/tech-decide/report-template.md` for the final report structure.

Launch multiple `Agent` (general-purpose) subagents **in parallel**:

```
┌─────────────────────────────────────────────────────────────┐
│  Run simultaneously (parallel Agent subagents)              │
├─────────────────────────────────────────────────────────────┤
│  1. Codebase Explorer Agent                                 │
│     → Analyze existing codebase, identify patterns/constraints│
│                                                             │
│  2. Docs Researcher Agent                                   │
│     → WebSearch + WebFetch official docs, guides, best practices │
│                                                             │
│  3. Community Sentiment Agent (uses /dev-scan approach)     │
│     → WebSearch Reddit, HN, Dev.to for real-world opinions  │
│                                                             │
│  4. Council Agent (uses /council approach)                  │
│     → Gather various expert perspectives via parallel agents│
└─────────────────────────────────────────────────────────────┘
```

### Phase 3: Synthesis Analysis

Analyze gathered information:
- Organize pros/cons per option
- Score options based on evaluation criteria
- Organize conflicting opinions and evaluate reliability (source-based)

### Phase 4: Final Report Generation

Generate a conclusion-first comprehensive report using the template at `.claude/references/tech-decide/report-template.md`:

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
| Performance | 3/5 | 2/5 | 4/5 |
| **Total** | **X pts** | **Y pts** | **Z pts** |

## Recommendation Rationale
1. [Key reason 1 with source]
2. [Key reason 2 with source]

## Risks and Considerations
- [Risk/Consideration 1]
- [Risk/Consideration 2]
```

Save report to `docs/decisions/YYYY-MM-DD-<topic>.md`.

## Quick Execution Guide

### Simple Comparison (A vs B)
1. Execute Docs Researcher + Codebase Explorer (parallel `Agent` subagents)
2. Run Community Sentiment Agent (`/dev-scan` approach)
3. Synthesize tradeoffs
4. Generate report

### Deep Analysis (Complex Decision)
1. Execute Codebase Explorer (analyze current state)
2. Parallel: Docs Researcher, Community Sentiment, Council agents
3. Synthesize tradeoffs
4. Generate report

## Rules

1. **Confirm Criteria**: Always confirm which criteria matter most to the user first
2. **Conclusion First**: Always present the recommendation at the beginning
3. **Show Reliability**: Explicitly mark unclear or outdated sources
4. **Provide Context**: Analysis accuracy improves with project characteristics, team size, and existing tech stack details

## Synergies (Command Integration)

`/tech-decide` acts as the analytical hub for technical choices:

- **+ `/dev-scan`**: Uses dev-scan approach as a primary data source for community sentiment and "anti-search" criticism
- **+ `/orchestrate`**: Triggered by the Orchestrator whenever a "Should I use X or Y?" question arises during strategy design
- **+ `/debug`**: Invoked when a bug's root cause suggests a fundamental architectural flaw
- **+ `/write-plan`**: The output of `/tech-decide` provides the "Decision Rationale" required in every high-quality implementation plan

## Exit Protocol (Mandatory)

1. Save report to `docs/decisions/YYYY-MM-DD-<topic>.md`
2. Reconcile findings to `docs/logs/YYYY-MM-DD.md`
3. Crystallize insights to `docs/learnings.md`
4. Update `task_plan.md`
5. Chain Next Step: Recommend the next appropriate `/command`

$ARGUMENTS
