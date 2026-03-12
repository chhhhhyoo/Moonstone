# PR And Branch Policy

## Purpose

This document is the canonical naming and review-quality policy for Moonstone branches, pull requests, and milestone-linked delivery IDs.

Companion operational rulebook: `docs/governance/RULE.md`.

## Canonical Rules

1. Branch pattern (required): `codex/pf-<stream>-<id>-<slug>`
2. PR title pattern (required): `[PF-<STREAM>-<ID>] <summary>`
3. Feature commit subject pattern: `PF-<STREAM>-<ID>: <summary>`
4. ID format: 3 digits (`001`, `002`, ...)
5. Allowed stream tokens:
   - branch form: `boot`, `runtime`, `gov`, `docs`, `infra`, `test`
   - PR/commit form: `BOOT`, `RUNTIME`, `GOV`, `DOCS`, `INFRA`, `TEST`
6. PR body must follow the insight-first structure defined in `.github/pull_request_template.md`.
7. PR body must focus on non-obvious logic: design choices, tradeoffs, risk surface, and reviewer hotspots.

## PR Description Quality Contract

Required sections (in this order):

1. `## Problem Framing`
2. `## Solution Shape`
3. `## Reviewer Focus`
4. `## Risk Surface`
5. `## Validation And Evidence`
6. `## Milestone And Follow-ups`
7. `## PR Tactics Checklist`

Required content behavior:

1. Explain why this approach is correct, not just what files changed.
2. Include at least one concrete reviewer hotspot with file-level focus.
3. State realistic regression risk and mitigation, including known unknowns.
4. Include validation evidence and confidence limits.
5. Mark all `## PR Tactics Checklist` items as completed (`[x]`) before merge.

Forbidden low-signal patterns:

1. Placeholder or TODO-style content (`tbd`, `todo`, template placeholders).
2. Trivial recap language (`same as title`, `as shown in diff`, `misc updates`).
3. Section shells with no substantive content.

## PR Record Tactics

1. Keep one dominant milestone identity per PR.
2. Prioritize reviewer hotspots and design rationale over file recap.
3. Always include concrete verification command outcomes.
4. Explicitly state residual risk and confidence limits.
5. Link follow-up action IDs from `docs/strategy/FUTURE-ACTIONS.md` (or `none`).

## First Bootstrap Naming

1. Branch: `codex/pf-boot-001-moonstone-bootstrap`
2. PR title: `[PF-BOOT-001] Bootstrap Moonstone governance and runtime seed`

## Rejection Criteria (Fail Closed)

1. Branch name does not match required pattern.
2. PR title does not match required pattern.
3. Branch identity and PR identity do not match.
4. Unknown stream token appears in branch, PR title, or commit subject.
5. Required PR template sections are missing.
6. PR body does not follow required section structure.
7. PR body includes forbidden low-signal content.

## Exception Policy

Allowed exception branches:

1. `main`

No additional exceptions are allowed without:

1. update to `config/governance/pr-policy.json`,
2. update to this policy file,
3. log entry in `docs/logs/YYYY-MM-DD.md`.
