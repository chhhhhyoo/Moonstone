---
name: write
description: Write blog posts from session insights with multi-perspective analysis. Trigger when user says "write a blog post", "newsletter", "convert to essay", or wants to publish insights.
user-invocable: true
---

# Write Skill (Gemini Edition)

Transform session insights and conceptual explorations into structured, publishable content through multi-perspective analysis and iterative refinement.

## Workflow Overview

```
PROTHESIS → FORMAT → DRAFT → REFINE → SYNEIDESIS → FINALIZE
```

| Phase | Skill/Pattern | Description |
|-------|---------------|-------------|
| **Prothesis** | `prothesis` | Context-derived perspectives and parallel inquiry. |
| **Format** | Interactive Pause | Select output type and language. |
| **Draft** | `write_file` | Generate initial draft to `notes/drafts/`. |
| **Refine** | `replace` | Iterate based on user feedback. |
| **Syneidesis** | `syneidesis` | Final gap detection and validation. |

## Core Principle

**Crystallization of Thought**: Convert complex session deliberations into clear, structured, and publishable content.

## Integration

This skill is a consumer of the Epistemic Protocols:
- **Calls `prothesis`**: To ensure the content is grounded in multi-perspective analysis.
- **Calls `syneidesis`**: To check for blind spots before finalization.

## Phase Execution

### 1. Prothesis Protocol
Invoke the `prothesis` skill to analyze the session context and topic. Use the synthesized Lens L as the foundation for the content.

### 2. Format Decision (Interactive Pause)
Present output options to the user.

```
### 📝 Write: Format Selection
How should this content be formatted?

**Options:**
1. **Blog Post** (Korean/English)
2. **Essay**
3. **Newsletter**
4. **Social Thread**
```

### 3. Draft Generation
Write the initial draft to `notes/drafts/YYYY-MM-DD-{topic-slug}.md`.
Structure: Hook → Context → Framework → Application → Implications.

### 4. Iterative Refinement
Use the `replace` tool to refine sections based on user feedback.

### 5. Gap Detection (Syneidesis)
Invoke the `syneidesis` skill for final validation. Check for:
- Procedural gaps (Missing references).
- Consideration gaps (Unaddressed perspectives).

### 6. Finalization
Apply final edits and move the file to the final destination (e.g., `notes/blog/`).

## Rules

1. **Epistemic Grounding**: Content MUST be based on the convergence/divergence findings from the Prothesis phase.
2. **Interactive Pause**: Stop for format selection and refinement approval.
3. **Tool Hygiene**: Do not include tool logs or debugging steps in the final content.
4. **Quality Gates**: Concepts per section ≤ 3; Framework components ≤ 5.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
