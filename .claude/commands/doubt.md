# Doubt (Self-Verification Protocol)

Force a rigorous self-verification of the previous output or current plan. Use when user says "!rv", "are you sure?", "verify that", or expresses strong doubt about a claim or proposal.

**Goal**: Correct hallucinations, verify assumptions, and ensure factual accuracy.

## Triggers

- User says `!rv` (Re-Validate) or `/doubt`
- User asks "Are you sure?"
- User points out a potential error ("That file doesn't exist")
- User expresses skepticism about any claim

## The Protocol

When invoked, STOP your current line of thinking and execute this verification loop:

### 1. Acknowledge and Pause

State clearly that you are entering verification mode:

> "Entering verification mode. Re-verifying previous statements against reality."

### 2. Identify Claims

List the specific factual claims, assumptions, or code references made in the previous turn:

- *Claim 1*: "The file `config.json` exists"
- *Claim 2*: "The library `axios` is installed"
- *Claim 3*: "The function `processData` handles null values"

### 3. Verification Action (The "Reality Check")

For **EACH** claim, obtain **new evidence** using tools. You CANNOT rely on context memory alone.

- Use `Read` to verify file contents
- Use `Glob` to verify file existence
- Use `Grep` to search for function definitions, patterns
- Use `Bash` to check system state (`git status`, `npm ls`, `ls`, etc.)

**Crucial**: If you cannot verify a claim with a tool, you MUST explicitly label it as an *assumption*.

### 4. The Verdict

Report verification results clearly:

```
Verification Results:
- CONFIRMED: `config.json` exists (verified via Glob)
- FALSE: `axios` is NOT in package.json (checked dependencies)
- UNVERIFIED: Could not find `processData` definition - this was an assumption
```

### 5. Correction

Propose a corrected plan or answer based *only* on verified facts. Clearly mark what changed from the original.

## Example

**User**: "!rv" (after Agent proposed running a deploy script)

**Agent**:
"Entering verification mode. Checking if `scripts/deploy.sh` exists..."
[Glob: `scripts/deploy.sh`] -> No match
"**Correction**: I hallucinated `deploy.sh`. The actual script is `scripts/release.sh`. Updating plan to use `release.sh`."

## Synergies (Command Integration)

`/doubt` is the "Emergency Brake":

- **+ `/verify`**: `/doubt` checks claims; `/verify` runs the full test/lint suite
- **+ `/council`**: After doubting, summon the council for a second opinion on complex questions
- **+ `/clarify`**: If doubt reveals ambiguity in requirements, invoke `/clarify`

## Exit Protocol (Mandatory)

1. **Reconcile Memory**: Move discoveries to `docs/logs/YYYY-MM-DD.md`
2. **Crystallize Gems**: Extract insights to `docs/learnings.md`
3. **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`
4. **Chain Next Step**: Recommend the next appropriate `/command` to invoke

$ARGUMENTS
