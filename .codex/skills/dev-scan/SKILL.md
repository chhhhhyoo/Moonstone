---
name: dev-scan
description: Collect and synthesize multi-community developer sentiment for technical topics with anti-bias search coverage and source-cited output.
version: 1.0.0
---

# dev-scan

Codex-native migration of Gemini `dev-scan`.

## Purpose

Map real developer sentiment fast: consensus, controversies, and notable practitioner perspectives grounded in explicit sources.

## Activation Triggers

1. User asks for developer reactions, community opinions, or practitioner sentiment.
2. Technical comparison needs social/operational signal beyond vendor docs.
3. Brainstorming or strategy decisions need "what practitioners actually say" evidence.

## Data Sources

| Platform | Retrieval Pattern |
|---|---|
| Reddit | `web.search_query` with `domains: ["reddit.com"]` |
| Hacker News | `web.search_query` with `domains: ["news.ycombinator.com"]` |
| Dev.to | `web.search_query` with `domains: ["dev.to"]` |
| Lobsters | `web.search_query` with `domains: ["lobste.rs"]` |

## Protocol

### Step 1: Topic Extraction

1. Reduce the ask to a crisp topic phrase.
2. Confirm the comparison axis when applicable (`A vs B`, migration, performance, DX).

### Step 2: Parallel Search (Anti-Bias Mandatory)

Run multiple searches in parallel:

1. General sentiment: `"<topic> developer opinions site:reddit.com"`
2. HN: `"<topic> site:news.ycombinator.com"`
3. Blogs/discussion: `"<topic> site:dev.to OR site:lobste.rs"`
4. Anti-search (required): `"<topic> sucks OR problems OR alternatives OR bad"`

Rules:
1. Use anti-search every time to prevent confirmation bias.
2. Keep at least 3 distinct communities represented.
3. Prefer threads with concrete production experiences over generic hot takes.

### Step 3: Synthesize

#### 3.1 Opinion Classification

Classify each usable source into:
1. Pro/positive
2. Con/negative
3. Neutral/conditional
4. Experience-based (production-backed)

#### 3.2 Consensus

1. Treat a claim as consensus only when it appears in 2+ independent sources.
2. Target at least 5 consensus items.
3. Prioritize claims with concrete examples, benchmarks, or failure reports.

#### 3.3 Controversies

1. Capture at least 3 disagreement points.
2. For each, show both sides and the context that explains the split.

#### 3.4 Notable Perspectives

1. Capture at least 3 high-value minority perspectives.
2. Prefer insights tied to scale, maintenance burden, migration pain, or long-term operations.

## Output Format

```markdown
## Key Insights

### Consensus
1. **[Claim]**
   - [Explanation]
   - Sources: [Reddit](url), [HN](url)

### Controversy
1. **[Topic]**
   - Pro: [Argument] - [Source](url)
   - Con: [Argument] - [Source](url)
   - Context: [Why opinions diverge]

### Notable Perspective
1. **[Insight]**
   - [Why it matters]
   - Source: [Platform](url)
```

## Citation Rules

1. No unsourced claims.
2. Every insight line ends with `Source:` or `Sources:`.
3. Use direct quotes sparingly and only when they materially improve fidelity.
4. Validate links before presenting.

## Error Handling

| Situation | Response |
|---|---|
| Thin results on one platform | Continue with other communities and report sampling limits |
| Tool/search failure | Mark failed source explicitly and proceed with available evidence |
| Topic too new | Report low-signal state and suggest nearest comparable topic |

## Skill Synergy

1. With `brainstorming`: bring practitioner pitfalls into early design discussions.
2. With `prothesis`: use sentiment distribution as one strategic input, not final truth.
3. With `reflexion`: compare local failures with known community pain patterns.
4. With non-migrated `tech-decision`: use `prothesis` as temporary fallback comparator.

## Exit Protocol

1. Reconcile scan outputs from `findings.md` into `docs/logs/YYYY-MM-DD.md`.
2. Promote durable patterns and anti-patterns to `docs/learnings.md`.
3. Update `task_plan.md` and `progress.md` with handoff target and scope impact.
