# Dev Opinions Scan

Collect and synthesize diverse opinions on specific topics from multiple developer communities. Use for "developer reactions", "community opinions", or "what do devs think about X" requests. Aggregates Reddit, HN, Dev.to, Lobsters, etc.

## Purpose

Quickly understand **diverse perspectives** on technical topics:
- Distribution of pros/cons (Sentiment analysis)
- Practitioner experiences (Real-world use cases)
- Hidden concerns or advantages
- Unique or notable perspectives

## Data Sources

| Platform | Method |
|----------|--------|
| Reddit | `WebSearch` |
| Hacker News | `WebSearch` |
| Dev.to | `WebSearch` |
| Lobsters | `WebSearch` |

## Execution

### Step 1: Topic Extraction

Extract the core topic from the user request.

Examples:
- "Developer reactions to React 19" -> `React 19`
- "Community opinions on Bun vs Deno" -> `Bun vs Deno`

### Step 2: Parallel Search (Anti-Bias Strategy)

Execute multiple `WebSearch` calls **in parallel** (all in one message) to capture a broad spectrum:

1. **General**: `"{topic} developer opinions site:reddit.com"`
2. **Hacker News**: `"{topic} site:news.ycombinator.com"`
3. **Blogs**: `"{topic} site:dev.to OR site:lobste.rs"`
4. **The "Anti-Search" (MANDATORY)**: `"{topic} problems OR alternatives OR criticism OR downsides"`
   - *Why?* To actively seek out criticism and prevent confirmation bias.

Use `WebFetch` on the most promising URLs from search results to get detailed thread content and comments.

### Step 3: Synthesize & Present

Analyze the collected data to derive meaningful insights.

#### 3-1. Opinion Classification

Classify collected opinions by:
- **Pro/Positive**: Supporting opinions, benefits, ease of use
- **Con/Negative**: Concerns, criticism, bugs, better alternatives
- **Neutral/Conditional**: "Only if...", "When used with...", "Depends on scale"
- **Experience-based**: Opinions derived from actual production or project usage

#### 3-2. Derive Consensus

Identify opinions **repeatedly appearing** across communities:
- Same point mentioned in 2+ sources = consensus
- Especially high reliability if mentioned in both Reddit and Hacker News
- Prioritize opinions backed by specific numbers, benchmarks, or examples
- **Target at least 5 consensus items**

#### 3-3. Identify Controversies

Find points where **opinions diverge** significantly:
- Opposing opinions on the same feature/topic
- Threads with active, heated debates
- Topics with many "depends on...", "but actually..." responses
- **Target at least 3 controversy points**

#### 3-4. Select Notable Perspectives

Find unique or deep insights that add value beyond the majority view:
- Logically sound opinions that differ from the majority
- Insights from senior developers or domain experts
- Perspectives derived from large-scale project experience
- Edge cases or long-term maintenance perspectives others might miss
- **Target at least 3 notable perspectives**

## Output Format

**Core Principle**: All opinions MUST have an inline source. No opinions without sources.

```markdown
## Key Insights

### Consensus

1. **[Opinion Title]**
   - [Detailed description of the opinion]
   - [Additional context or examples provided in threads]
   - Sources: [Reddit](url), [HN](url)

2. **[Opinion Title]**
   - [Details]
   - Source: [Dev.to](url)

(at least 5 items)

---

### Controversy

1. **[Controversy Topic]**
   - **Pro**: "[Quote or summarized argument]" - [Source](url)
   - **Con**: "[Quote or summarized argument]" - [Source](url)
   - **Context**: [Explanation of why opinions diverge]

(at least 3 items)

---

### Notable Perspective

1. **[Insight Title]**
   > "[Original quote or key sentence]"
   - [Explanation of why this perspective is unique or valuable]
   - Source: [Platform](url)

(at least 3 items)
```

### Source Citation Rules

- **Inline links required**: End every opinion with `Source: [Platform](url)`
- **Multiple sources**: Use `Sources: [Reddit](url), [HN](url)`
- **Direct quotes**: Use `"..."` format for impactful original statements
- **URL accuracy**: Only include verified accessible links from search results

## Error Handling

| Situation | Response |
|-----------|----------|
| No search results | Skip that platform, focus on others, or try broader keywords |
| Tool failure | Note the failure and proceed with results from other platforms |
| Topic too new | Inform the user and suggest related established technologies |

## Synergies (Command Integration)

`/dev-scan` is a foundational research layer:

- **+ `/council`**: Provides the "Community Opinion" data point for council deliberations
- **+ `/brainstorm`**: Used in the research phase to validate ideas against community sentiment
- **+ `/clarify`**: When clarification reveals a technology choice, scan community opinions

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract insights to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command` to invoke

$ARGUMENTS
