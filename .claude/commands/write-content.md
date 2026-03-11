# Write Content

Transform session insights and conceptual explorations into structured, publishable content through multi-perspective analysis and iterative refinement.

Trigger when: "write a blog post", "newsletter", "convert to essay", "publish insights"

## Workflow Overview

```
PERSPECTIVES → FORMAT → DRAFT → REFINE → GAP CHECK → FINALIZE
```

## Core Principle

**Crystallization of Thought**: Convert complex session deliberations into clear, structured, and publishable content.

## Phase Execution

### 1. Multi-Perspective Analysis

Launch 3 parallel `Agent` (general-purpose) subagents to analyze the topic from different angles:

- **Agent 1 (Advocate)**: Strongest arguments FOR the core thesis
- **Agent 2 (Critic)**: Strongest challenges and counterpoints
- **Agent 3 (Synthesizer)**: Points of convergence and novel connections

Use the synthesized perspective as the foundation for the content.

### 2. Format Decision

Use `AskUserQuestion` to present format options:

```
How should this content be formatted?

Options:
1. Blog Post (with language: Korean/English)
2. Essay
3. Newsletter
4. Social Thread
```

### 3. Draft Generation

Write the initial draft to `notes/drafts/YYYY-MM-DD-{topic-slug}.md`.

Structure: **Hook → Context → Framework → Application → Implications**

### 4. Iterative Refinement

Use `Edit` tool to refine sections based on user feedback. Present key sections for review via `AskUserQuestion`.

### 5. Gap Detection (Syneidesis)

Apply `/syneidesis` gap detection for final validation:
- Procedural gaps (Missing references)
- Consideration gaps (Unaddressed perspectives)
- Assumption gaps (Unverified claims)

### 6. Finalization

Apply final edits and move the file to the final destination (e.g., `notes/blog/`).

## Rules

1. **Epistemic Grounding**: Content MUST be based on the convergence/divergence findings from the Perspectives phase
2. **Interactive Pause**: Stop for format selection and refinement approval
3. **Tool Hygiene**: Do not include tool logs or debugging steps in the final content
4. **Quality Gates**: Concepts per section <= 3; Framework components <= 5

## Synergies (Command Integration)

`/write-content` transforms insights into publishable form:

- **+ `/brainstorm`**: Use brainstorm output as input for content
- **+ `/syneidesis`**: Final gap detection before publishing
- **+ `/reflect`**: Extract session insights as content seeds
- **+ `/bridge`**: Log the published content to the knowledge base

## Exit Protocol (Mandatory)

1. Draft saved to `notes/drafts/` or final location
2. Reconcile findings to `docs/logs/YYYY-MM-DD.md`
3. Crystallize insights to `docs/learnings.md`
4. Update `task_plan.md`
5. Chain Next Step: Recommend the next appropriate `/command`

$ARGUMENTS
