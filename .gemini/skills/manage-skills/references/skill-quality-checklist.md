# Skill Quality Checklist & Rubric

Use this checklist when supervising, auditing, or updating other skills.

## 1. Metadata & Discoverability (Frontmatter)
- [ ] **Name**: Lowercase, hyphen-separated, < 64 chars (e.g., `git-helper`).
- [ ] **Description**: Single-line string. Describes *what* it does and *when* to use it.
- [ ] **Triggering**: Does the description contain unique keywords that distinguish it from other skills?

## 2. Structure & Organization
- [ ] **SKILL.md**: Exists and follows the standard format.
- [ ] **Resources**:
    - Scripts in `scripts/` (executable, independent).
    - References in `references/` (docs loaded on demand).
    - Assets in `assets/` (templates, output files).
- [ ] **No Clutter**: No README.md, CHANGELOG, or hidden files in the root.

## 3. Content Quality (SKILL.md)
- [ ] **Conciseness**: Instructions are minimal and token-efficient. "Does Gemini need this explanation?"
- [ ] **Progressive Disclosure**:
    - High-level workflow in `SKILL.md`.
    - Detailed schemas, lists, or large docs moved to `references/`.
- [ ] **Action-Oriented**: Instructions use imperative verbs ("Run this," "Check that").
- [ ] **Context-Aware**: References `available_resources` or `project_root` correctly.

## 4. Functionality & Logic
- [ ] **Completeness**: Does the skill handle the full workflow it claims?
- [ ] **Robustness**: Do scripts handle errors gracefully?
- [ ] **Safety**: Do file operations verify paths? Are destructive actions confirmed?

## 5. Allocation/Router Readiness
- [ ] **Independence**: Can this skill be used as part of a larger chain?
- [ ] **Outputs**: Does it produce clear outputs (files or logs) that other skills can consume?
