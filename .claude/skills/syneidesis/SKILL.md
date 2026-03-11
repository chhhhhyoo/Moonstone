---
name: syneidesis
description: Use before finalizing any plan or making an irreversible decision. Surfaces epistemic gaps, unconsidered alternatives, and blind spots. Mandatory before write-plan finalization.
user-invocable: true
allowed-tools: Read, AskUserQuestion
---

# Syneidesis (Gap Surfacing Protocol)

Surface potential gaps at decision points. Raises procedural, consideration, assumption, and alternative gaps as questions before decisions, destructive actions, or "check for gaps" requests.

**Syneidesis** (συνείδησις): Surfacing potential gaps at decision points, transforming unknown unknowns into questions the user can evaluate.

**Core Principle**: Surfacing over Deciding. AI makes visible; user judges.

## When to Activate

- Before irreversible actions (git push, delete, deploy)
- Before finalizing plans
- When user asks "check for gaps" or "what am I missing?"
- At phase boundaries in plan execution

## Protocol

### Detection (Silent)

1. **Stakes Assessment**:
   - Irreversible + High impact -> High stakes (MUST surface)
   - Irreversible + Low impact -> Medium stakes (SHOULD surface)
   - Reversible + Any impact -> Low stakes (MAY surface)

2. **Gap Scan** - Check for these gap types:

   | Gap Type | Description | Example |
   |----------|-------------|---------|
   | **Procedural** | Missing steps | "Have we run the migration?" |
   | **Consideration** | Unconsidered factors | "What about rate limiting?" |
   | **Assumption** | Unverified beliefs | "Are we sure the API supports v2?" |
   | **Alternative** | Unexplored options | "Have we considered using X instead?" |

3. **Filter**: Only surface gaps with observable evidence.

### Surfacing

Use `AskUserQuestion` with clear options:

```
Syneidesis Check:
[Question about the gap]
(Rationale: [1-line explanation of why this matters])

Options:
1. Address: [What addressing this looks like]
2. Dismiss: [Acknowledged, proceeding anyway]
3. Defer: [Add to task_plan.md for later]
```

### Gap Tracking

Record ALL detected gaps in `task_plan.md`:

```markdown
## Epistemic Gaps
- [ ] [Gap:Procedural] Have we verified the database schema matches? (Rationale: Schema drift causes silent failures)
- [x] [Gap:Assumption] API v2 compatibility confirmed (Dismissed: checked docs)
```

**Workflow**:
1. Detect all gaps -> Write to `task_plan.md`
2. Surface first gap via `AskUserQuestion`
3. On response: Mark gap in `task_plan.md`, re-scan for new gaps
4. Loop until all gaps resolved or dismissed

### Plan Mode Integration

Apply Syneidesis at **phase boundaries**:

| Transition | Focus |
|------------|-------|
| Planning -> Implementation | Scope completeness, missing requirements |
| Phase N -> Phase N+1 | Previous phase completion, dependencies |
| Implementation -> Commit | Changed assumptions, deferred decisions |

## Rules

1. **Question > Assertion**: Ask "was X considered?", never "you missed X"
2. **Batch Register**: Record ALL gaps in `task_plan.md` before surfacing any
3. **Interactive Pause**: MUST use `AskUserQuestion` and stop
4. **User Authority**: Dismissal is final
5. **Stakes Calibration**: High stakes = block until answered
6. **No Self-Diagnosis**: Present gaps as questions, not conclusions

## Synergies (Command Integration)

`/syneidesis` is the "Conscience Layer":

- **+ `/write-plan`**: Every plan MUST pass syneidesis before finalization
- **+ `/orchestrate`**: Orchestrator triggers syneidesis before irreversible actions
- **+ `/doubt`**: Syneidesis asks "what did we miss?"; `/doubt` asks "is what we said true?"
- **+ `/clarify`**: If a gap reveals ambiguity, invoke `/clarify`

## Exit Protocol (Mandatory)

1. All gaps tracked in `task_plan.md`
2. Reconcile discoveries to `docs/logs/YYYY-MM-DD.md`
3. Chain Next Step: Recommend the next appropriate `/command`

$ARGUMENTS
