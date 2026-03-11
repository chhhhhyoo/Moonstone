---
name: git-craft-commit
description: Smartly selects relevant files for a logical unit of work (from git status), stages them, and generates a Conventional Commit message based on the diff. Does not push.
---

# Git Craft Commit

Use this skill when the user asks to "prepare a commit", "stage changed files", or "write a commit message" for the current work session. It focuses on isolating logical changes and ensuring the commit message is descriptive and conventional.

## Workflow

### 1. Analyze Status & Clean Code

- Run `git status` to see all modified/untracked files.
- **Mandatory:** Run `npm run lint:fix` (or equivalent project linting command) to ensure code quality before staging.
- Run `git diff --stat` (and `git diff --cached --stat`) to understand the scope of changes.

### 2. Select Files (Logical Unit)

- Identify which files belong to the current task/fix.
- **Rule:** Do not blindly `git add .` unless explicitly asked or the workspace is clean.
- **Atomic Commits:** Prefer multiple small commits over one large one. If a task involves multiple layers (e.g., core fix, interface update, docs), commit them sequentially.
- **Exclude:** Temporary files (`.log`, `temp_test.ts`), and session artifacts (`task_plan.md`, `findings.md`, `progress.md`) unless explicitly asked to include them in the repo.
- **Group:** If multiple distinct fixes were made (e.g., "Fix API" and "Refactor Docs"), suggest splitting into separate commits if possible, or combine if they are tightly coupled.

### 3. Manage Artifacts (Project Intelligence)

- **Docs:** Include specification changes (`specs/`) and architecture docs alongside the code that implements them.
- **Tests:** Always include reproduction scripts or tests (`test/`) in the same commit as the fix.
- **New Features:** Group new services, controllers, and their registration logic into a single logical unit.

### 3. Generate Commit Message

- Follow **Conventional Commits** format: `type(scope): description`.
- **Types:**
  - `fix`: Bug fixes.
  - `feat`: New features.
  - `refactor`: Code change that neither fixes a bug nor adds a feature.
  - `docs`: Documentation only changes.
  - `test`: Adding missing tests or correcting existing tests.
  - `chore`: Changes to the build process or auxiliary tools.
- **Scope:** The module or component affected (e.g., `auth`, `infra`).
- **Body:** Bullet points explaining _what_ and _why_.

### 4. Execute (Stage Only)

- Run `git add <file1> <file2> ...` for the selected files.
- **Do not** run `git commit` automatically unless the user explicitly said "commit it". Instead, propose the command.
- **Never** push without explicit instruction.

## Example

**Scenario:** User fixed a regex bug in validation and updated tests.

**Action:**

1. `git status` shows: `src/utils/validator.ts`, `test/validator.test.ts`, `README.md`.
2. `git add src/utils/validator.ts test/validator.test.ts`
3. Propose message:

   ```bash
   git commit -m "fix(validation): correct email regex pattern

   - Update regex to support new TLDs
   - Add test cases for edge cases"
   ```

## Prompt Template for LLM Generation

When generating the message, use this mental template:

1. What was the _primary_ goal? (The Subject Line)
2. What distinct problems were solved? (The Body Bullets)
3. Are there breaking changes? (Footer)

## Synergies (Skill Integration)

`git-craft-commit` ensures the "Save Game" state is clean and descriptive:

- **+ `finishing-a-development-branch`**: This skill is often the final step before finishing a branch.
- **+ `systematic-debugging`**: After a fix is verified, `git-craft-commit` ensures the fix is isolated and described perfectly in the history.
- **+ `orchestrator`**: The Orchestrator calls this skill to "checkpoint" progress after a successful phase of work.

## Exit Protocol (Mandatory)

1.  **Reconcile Memory**: Turn discoveries in `findings.md` MUST be moved to cumulative logs in `docs/logs/YYYY-MM-DD.md`.
2.  **Crystallize Gems**: Extract high-value insights (ADRs, patterns, root causes) and append to `docs/learnings.md`.
3.  **Update Documentation**: Mark completed tasks in `task_plan.md` and `progress.md`.
4.  **Chain Next Step**: Hand off to the next appropriate expert via `activate_skill`.
