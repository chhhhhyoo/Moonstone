# Command Quality Checklist & Rubric

Use this checklist when creating, auditing, or updating Claude Code commands.

## 1. Metadata & Discoverability

- [ ] **Filename**: Lowercase, hyphen-separated, < 64 chars (e.g., `git-helper.md`).
- [ ] **Location**: Inside `.claude/commands/` directory.
- [ ] **Arguments**: Uses `$ARGUMENTS` placeholder if accepting user input.
- [ ] **Triggering**: Listed in CLAUDE.md auto-suggest rules with clear situation triggers.

## 2. Structure & Organization

- [ ] **Command File**: `.claude/commands/<name>.md` exists and follows standard format.
- [ ] **Supporting Files**:
    - Templates in `.claude/templates/` (scaffolding, output formats).
    - Agent prompts in `.claude/prompts/` (subagent dispatch instructions).
    - References in `.claude/references/` (decision guides, checklists).
    - Assets in `.claude/assets/` (technical knowledge, examples).
    - Scripts in `.claude/scripts/` (executable utilities).
- [ ] **No Clutter**: No README.md, CHANGELOG, or hidden files in command directory.

## 3. Content Quality

- [ ] **Conciseness**: Instructions are minimal and token-efficient. "Does Claude need this explanation?"
- [ ] **Progressive Disclosure**:
    - High-level workflow in command `.md` file.
    - Detailed schemas, lists, or large docs referenced from `.claude/references/` or `.claude/assets/`.
- [ ] **Action-Oriented**: Instructions use imperative verbs ("Run this," "Check that").
- [ ] **Tool-Aware**: References correct Claude tools (`Agent`, `WebSearch`, `Bash`, `AskUserQuestion`, etc.).

## 4. Functionality & Logic

- [ ] **Completeness**: Does the command handle the full workflow it claims?
- [ ] **Robustness**: Do referenced scripts handle errors gracefully?
- [ ] **Safety**: Do file operations verify paths? Are destructive actions confirmed via `AskUserQuestion`?
- [ ] **Quality Gates**: Does the command include verification before claiming success?

## 5. Integration & Composability

- [ ] **Independence**: Can this command be used as part of a larger chain?
- [ ] **Outputs**: Does it produce clear outputs (files or logs) that other commands can consume?
- [ ] **Cross-References**: Does it reference related commands where appropriate?
- [ ] **Auto-Suggest**: Is there a matching entry in CLAUDE.md's Command Auto-Suggest Rules?
