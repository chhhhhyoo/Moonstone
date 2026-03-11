---
name: reference-organizer
description: Analyzes references (links, papers, text), classifies them by utility/topic, and stores them in the project knowledge base. Use when user shares a link or text and asks to "save this", "bookmark this", or "add to references".
---

# Reference Organizer

Organize external knowledge into the project's memory.

## Workflow

### 1. Analysis
- **If URL:** Use `WebFetch` (or `read_file` if local) to get content.
- **If Text:** Analyze directly.
- **Summarize:** Extract key insights, utility, and relevance to the project.

### 2. Categorization
Classify the reference into one of the following categories (or a new one if necessary):
- **Architecture:** Patterns, System Design, Cloud Infrastructure
- **Frontend:** UI/UX, React/Frameworks, CSS
- **Backend:** API, Database, Server logic
- **DevOps:** CI/CD, Docker, Deployment
- **Tools:** Libraries, CLI tools, Utilities
- **Process:** Agile, Workflow, Management

### 3. Storage
Append the entry to `docs/references.md` (create if missing) in the following format:

```markdown
## [Title of Reference](URL)
**Category:** [Category]
**Date:** [YYYY-MM-DD]
**Summary:**
[Concise summary of content]

**Relevance:**
[Why is this useful for THIS project?]

**Tags:** #[tag1] #[tag2]
---
```

### 4. Confirmation
Confirm to the user that the reference has been saved and categorized.

## Synergies (Skill Integration)

`reference-organizer` builds the long-term knowledge base:

- **+ `docs-researcher`**: The primary source of new references. When `docs-researcher` finds a valuable link, use `reference-organizer` to save it.
- **+ `writing-plans`**: When writing a plan, query the references organized by this skill to ensure best practices are followed.
- **+ `project-insight`**: Uses the references stored in `docs/references.md` to build a complete picture of the project's external dependencies.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
