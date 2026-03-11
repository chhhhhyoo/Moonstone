# Project Insight

Extract insights from the project's persistent history (Git & Markdown). Use to understand project context, recent changes, evolution, and architectural constraints before starting work.

## Workflow

### 1. Analyze Git History

```bash
git log --pretty=format:"%h - %an, %ar : %s" --stat -n 10
```
**Goal**: Understand *what* changed recently.

### 2. Analyze Planning Context

Read these files (if they exist):
- `task_plan.md` - Current plan state
- `findings.md` - Recent discoveries
- `progress.md` - Session logs

**Goal**: Understand *why* things changed.

### 3. Analyze Documentation & Decisions

- **Learnings**: Read `docs/learnings.md` (last 10 entries)
- **Decisions**: Use `Glob` for `docs/decisions/*.md`, read the 5 most recent
- **Specs**: Check `SPEC.md` and `specs/` for current requirements

**Goal**: Understand *learned* knowledge and architectural constraints.

### 4. Synthesize

Output a structured analysis:

```markdown
## Project Insight Report

### Recent Velocity
[High/Medium/Low - based on commit frequency and scope]

### Focus Area
[Current area of active development, e.g., "Refactoring Auth System"]

### Key Constraints
[From docs/decisions/ - architectural decisions that constrain future work]

### Active Risks
[e.g., "Frequent changes to utils.ts suggest instability"]

### Unfinished Work
[From task_plan.md - incomplete phases or deferred items]

### Recommendations
[Suggested next actions based on the analysis]
```

## Synergies (Command Integration)

`/project-insight` provides historical context:

- **+ `/orchestrate`**: Load context at session start to understand trajectory
- **+ `/brainstorm`**: Ground new ideas in project history and constraints
- **+ `/council`**: Provide project context to council deliberations

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Chain Next Step**: Recommend the next appropriate `/command`

$ARGUMENTS
