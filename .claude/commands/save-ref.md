# Reference Organizer

Analyze references (links, papers, text), classify them by utility/topic, and store them in the project knowledge base. Use when user shares a link or text and asks to "save this", "bookmark this", or "add to references".

## Workflow

### 1. Analysis

- **If URL**: Use `WebFetch` to get content and extract key insights
- **If local file**: Use `Read` to analyze
- **If text**: Analyze directly
- **Summarize**: Extract key insights, utility, and relevance to the project

### 2. Categorization

Classify into categories (or create new ones):
- **Architecture**: Patterns, System Design, Cloud Infrastructure
- **Frontend**: UI/UX, React/Frameworks, CSS
- **Backend**: API, Database, Server logic
- **DevOps**: CI/CD, Docker, Deployment
- **Tools**: Libraries, CLI tools, Utilities
- **Process**: Agile, Workflow, Management

### 3. Storage

Append to `docs/references.md` (create if missing):

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

Confirm to the user: "Reference saved and categorized under [Category] in docs/references.md"

## Synergies (Command Integration)

- **+ `/brainstorm`**: Save references discovered during brainstorming
- **+ `/dev-scan`**: Save notable community sources found during dev scanning
- **+ `/project-insight`**: Uses stored references for project context

$ARGUMENTS
