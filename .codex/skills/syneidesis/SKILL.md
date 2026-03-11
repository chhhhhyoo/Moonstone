---
name: syneidesis
description: Gap surfacing before decisions. Raises procedural, consideration, assumption, and alternative gaps as questions to transform unknown unknowns into known considerations. Trigger before decisions, delete, push, or "check for gaps".
user-invocable: true
---
# syneidesis

## Purpose
Surface potential gaps—procedural, consideration, assumption, or alternative—at decision points. It enables the user to notice blind spots through structured questioning, transforming unrecognized risks into evaluated considerations.

## Protocol (The "Conscience" Loop)

### Phase 0: Detection (Silent)
1. **Stakes Assessment**: Categorize by impact and reversibility (Low, Med, High).
2. **Gap Scan**: Check taxonomy (Procedural, Consideration, Assumption, Alternative) against the stated plan.
3. **Filter**: Surface only gaps with observable evidence.

### Phase 1: Registration
Register ALL detected gaps in `task_plan.md` under a "## Epistemic Gaps" section. Format: `- [ ] [Gap:Type] Question (Rationale: ...)`.

### Phase 2: Surfacing (Interactive Pause)
Select the first gap and present it via **Interactive Pause**. Ask "was X considered?" rather than asserting "you missed X."
- **Options**: 1. Address, 2. Dismiss, 3. Defer.

### Phase 3: Adjustment
Integrate the response into `task_plan.md` or `findings.md`. Re-scan for new gaps revealed by the response. Loop until all gaps are addressed.

## Rules
- **Question > Assertion**: Frame gaps as maieutic questions.
- **Interactive Pause**: You MUST stop after presenting a gap. No tool calls until response.
- **User Authority**: Dismissal is final.
- **Stakes Calibration**: High stakes = Block until answered.

## Synergies (Skill Integration)
- **+ `writing-plans`**: MANDATORY. Every plan must pass a `syneidesis` scan before finalization.
- **+ `orchestrator`**: Triggered before irreversible or high-stakes commands.
- **+ `doubt`**: `syneidesis` asks "What did we miss?", while `doubt` asks "Is what we said true?".

## Exit Protocol
1.  **Memory**: Move discoveries to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallization**: Promote durable "gap detection" patterns to `docs/learnings.md`.
3.  **Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Handoff**: Chain next step via `activate_skill`.
