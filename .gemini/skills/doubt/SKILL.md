---
name: doubt
description: Use when the user types '!rv', '!verify', 'are you sure?', or expresses strong doubt. Forces a rigorous self-verification of the previous output or current plan.
---

# Doubt (Self-Verification)

**Goal:** Correct hallucinations, verify assumptions, and ensure factual accuracy.

## Triggers
- User says `!rv` (Re-Validate)
- User asks "Are you sure?"
- User points out a potential error ("That file doesn't exist")
- User expresses skepticism

## The Protocol

When this skill is activated, you MUST STOP your current line of thinking and execute the following verification loop:

### 1. Acknowledge and Pause
State clearly that you are entering verification mode.
> "I hear your doubt. I will strictly re-verify my previous statements/plan against reality."

### 2. Identify Claims
List the specific factual claims, assumptions, or code references you made in the previous turn.
*   *Claim 1:* "The file `config.json` exists."
*   *Claim 2:* "The library `axios` is installed."
*   *Claim 3:* "The function `processData` handles null values."

### 3. Verification Action (The "Reality Check")
For **EACH** claim, you must obtain **new evidence** using tools. You cannot rely on your context memory.
*   **Action:** `ls config.json` or `read_file config.json`
*   **Action:** `read_file package.json` (to check dependencies)
*   **Action:** `search_file_content` (to find function definitions)

**Crucial:** If you cannot verify it with a tool, you must admit it is an *assumption*.

### 4. The Verdict
Report the results of your verification.

> **Verification Results:**
> *   ✅ **Confirmed:** `config.json` exists.
> *   ❌ **FALSE:** `axios` is NOT in `package.json`.
> *   ⚠️ **Unverified:** Could not find `processData` definition.

### 5. Correction
Propose a corrected plan or answer based *only* on the verified facts.

## Example

**User:** "!rv" (after Agent proposed running a script)

**Agent:**
"Entering verification mode. Checking if `scripts/deploy.sh` exists and is executable..."
[Tool Call: `ls -l scripts/deploy.sh`] -> "No such file"
"**Correction:** I hallucinated `deploy.sh`. The actual script is `scripts/release.sh`. I will update my plan to use `release.sh`."

## Synergies (Skill Integration)

`doubt` is the "Emergency Brake" for the skill ecosystem:

- **+ `orchestrator`**: The Orchestrator activates `doubt` whenever the user signals skepticism or when a critical assumption lacks evidence.
- **+ `syneidesis`**: While `syneidesis` checks for *missing* considerations (gaps), `doubt` checks for *factual errors* in what is already stated.
- **+ `verification-before-completion`**: `doubt` is often a sub-step of the final verification process.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
