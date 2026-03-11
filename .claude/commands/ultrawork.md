# Ultrawork: The Drift-Proof Factory

Use when the user demands high reliability and "no hallucination". Strict State, DAG Plans, and Mechanical Verification to prevent drift.

## Philosophy

1. **State is King**: We rely on `task_plan.md` and `TaskCreate`/`TaskUpdate`, not conversation memory.
2. **Plan is Law**: We execute the DAG in the plan exactly.
3. **Verification is Truth**: We use verification commands to mechanically check work. If it fails, we do not proceed.

## Workflow

### Phase 1: Specify (The Blueprint)

1. **Init State**: Create all tasks via `TaskCreate` with full descriptions and dependencies
2. **Draft Plan**: Create `docs/plans/<feature>.md` using the Strict DAG template at `.claude/templates/dag-plan.md`:
   - Each task has: ID, description, dependencies, mechanical verification command
   - Dependencies form a DAG (no cycles)
3. **Council Review**: (Optional) Use `/council` to review the DAG
4. **Lock**: Use `AskUserQuestion` — user must say "Plan Approved" to proceed

### Phase 2: Execute (The Factory)

**Loop for each task in DAG order:**

1. **Read State**: Check `TaskList` for the next unblocked task. Mark `in_progress` via `TaskUpdate`.
2. **Execute**: Write code / run commands as defined in the task.
3. **Mechanical Verification** (use `.claude/scripts/verifier.sh` as the standard verification harness):
   - Extract the verification command from the plan
   - Run it via `Bash`
   - **IF PASS**: Mark task `completed` via `TaskUpdate`. Update plan.
   - **IF FAIL**: Stop. Analyze error. Retry fix (max 2 times) or use `AskUserQuestion` to ask for help.

### Phase 3: Compound (The Archive)

1. **Final Verification**: Run `npm run verify` (or project equivalent)
2. **Log**: Update `docs/learnings.md` with what went wrong/right
3. **Clean State**: Mark all tasks completed

## Commands

- `/ultrawork start <feature>`: Initialize a new factory run
- `/ultrawork status`: Check task list state
- `/ultrawork resume`: Pick up where we left off (useful after context loss)

## The Golden Rule

**"Show me the exit code."**

Never accept a claim of "It works". Always run the verification command via `Bash` and check the exit code.

## Rules

- **NO skipping verification** — every task has a mechanical check
- **NO proceeding on failure** — fix or ask, never ignore
- **NO conversation memory reliance** — always read state from tasks/files
- **NO bundled changes** — one task, one verification, then next
- **NO implicit approval** — user must explicitly approve the plan

## Synergies (Command Integration)

`/ultrawork` is the highest-discipline execution mode:

- **+ `/write-plan`**: Creates the DAG plan this skill executes
- **+ `/council`**: Reviews the plan before locking
- **+ `/tdd`**: Each task follows TDD discipline
- **+ `/verify-complete`**: Every task ends with mechanical verification
- **+ `/finish-branch`**: Complete development after all tasks

## Exit Protocol (Mandatory)

1. All verification commands must have passed
2. Reconcile findings to `docs/logs/YYYY-MM-DD.md`
3. Crystallize insights to `docs/learnings.md`
4. Update `task_plan.md` with all completed items
5. Chain Next Step: Recommend the next appropriate `/command`

$ARGUMENTS
