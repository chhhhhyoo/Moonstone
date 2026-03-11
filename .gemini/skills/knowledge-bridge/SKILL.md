---
name: knowledge-bridge
description: The Obsidian Librarian. Use when you need to retrieve global engineering patterns, log architectural decisions (ADRs), or save daily work logs to the Obsidian Vault.
allowed-tools:
  - Read
  - Write
  - Exec
  - Glob
---

# Knowledge Bridge

## Philosophy
We treat documentation as a **Graph**, not a pile of files.
- **Local Context**: Belongs to the Project (Plans, Decisions, Logs).
- **Global Context**: Belongs to the User (Workflows, Patterns, Prompts).

## Commands

### 1. `retrieve`
**Goal**: Get context before starting work.
**Usage**: `bridge retrieve <topic> --scope <global|local>`

<instructions>
1.  **Read Config**: Read `.gemini/obsidian_config.json` to get `vault_root`.
2.  **Determine Search Path**:
    *   IF `scope == global`: Path is `{vault_root}/10_Global_Knowledge`.
    *   IF `scope == local`: Path is `docs`.
3.  **Search**:
    *   Run `grep -r "{topic}" {path}` to find matching files.
    *   Run `find {path} -name "*{topic}*"` to find matching filenames.
4.  **Display**:
    *   Present the list of matches.
    *   **Auto-Read**: If < 3 matches, automatically use `Read` on them.
    *   If > 3 matches, ask the user which one to read.
</instructions>

### 2. `log_decision`
**Goal**: Record an architectural choice (ADR).
**Usage**: `bridge log_decision "Title" "Context... Decision... Consequences..."`

<instructions>
1.  **Format Filename**: `YYYY-MM-DD-{Title_Kebab_Case}.md`.
2.  **Format Content**:
    ```markdown
    # {Title}
    **Date**: {YYYY-MM-DD}
    **Status**: Accepted

    ## Context
    {Context...}

    ## Decision
    {Decision...}

    ## Consequences
    {Consequences...}
    ```
3.  **Write**: Save to `docs/decisions/{Filename}`.
4.  **Confirm**: Output "✅ Recorded ADR: docs/decisions/{Filename}".
</instructions>

### 3. `daily_log`
**Goal**: Append progress to today's work log.
**Usage**: `bridge daily_log "Completed TODO-1. Verification passed."`

<instructions>
1.  **Determine Filename**: `docs/logs/{YYYY-MM-DD}.md`.
2.  **Format Entry**:
    ```markdown
    ## {HH:MM}
    - {Log Message}
    ```
3.  **Check Existence**:
    *   IF file exists: **Append** the entry.
    *   IF missing: Create file with `# Work Log - {YYYY-MM-DD}` header, then append entry.
4.  **Confirm**: Output "✅ Logged to docs/logs/{YYYY-MM-DD}.md".
</instructions>

### 4. `compound`
**Goal**: Crystallize a learning.
**Usage**: `bridge compound "Title" "Content" --type <pattern|workflow|project>`

<instructions>
1.  **Read Config**: Read `.gemini/obsidian_config.json` to get `vault_root`.
2.  **Determine Target Path**:
    *   IF `type == pattern`: `{vault_root}/10_Global_Knowledge/Engineering_Patterns/`.
    *   IF `type == workflow`: `{vault_root}/10_Global_Knowledge/Workflows/`.
    *   IF `type == project`: `docs/learnings.md` (Note: This is a single file for local learnings).
3.  **Execute Write**:
    *   **Global (Pattern/Workflow)**:
        *   Filename: `{Title}.md`.
        *   Content: Markdown with `# {Title}` and `{Content}`.
        *   Action: `Write` to target path.
    *   **Local (Project)**:
        *   Action: **Append** to `docs/learnings.md`.
        *   Format: `## {YYYY-MM-DD}: {Title}\n{Content}\n`.
4.  **Confirm**: Output the path where the knowledge was saved.
</instructions>

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
