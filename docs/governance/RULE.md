# RULE

Canonical PR-record governance for Moonstone.

## Purpose

Preserve project history as high-signal, milestone-linked pull requests. Every material change must be reconstructable from PR title, body, and verification evidence.

## Canonical Sources

1. PR naming policy: `docs/governance/pr-branch-policy.md`
2. Machine-readable enforcement: `config/governance/pr-policy.json`
3. PR body structure: `.github/pull_request_template.md`

If sources conflict, fail closed and follow machine-enforced policy plus this rulebook.

## Required PR Title Rules

1. Title must match: `[PF-<STREAM>-<ID>] <summary>`
2. `<STREAM>` must be one of: `BOOT`, `RUNTIME`, `GOV`, `DOCS`, `INFRA`, `TEST`
3. `<ID>` must be 3 digits (e.g. `001`)
4. Summary must be specific and reviewer-meaningful (no generic “updates/fixes” phrasing)

## Required PR Template Rules

PR descriptions must include all required sections, in order:

1. `## Problem Framing`
2. `## Solution Shape`
3. `## Reviewer Focus`
4. `## Risk Surface`
5. `## Validation And Evidence`
6. `## Milestone And Follow-ups`
7. `## PR Tactics Checklist`

Each section must contain substantive content; empty shells are policy violations.
`## PR Tactics Checklist` items must be fully checked before merge.

## PR Tactics (Mandatory)

1. One dominant milestone identity per PR. Avoid mixed-purpose PRs.
2. Explain why the design is correct before listing file-level details.
3. Call out reviewer hotspots with explicit paths and what to challenge.
4. List concrete validation commands and outcomes.
5. State residual risks and confidence limits explicitly.
6. Link follow-up action IDs from `docs/strategy/FUTURE-ACTIONS.md` or declare `none`.

## Plan Discipline (Mandatory)

1. Every new implementation branch or materially new approach must have an explicit plan doc before coding begins.
2. Plan docs must live under `docs/strategy/` (milestone plan such as `PF-POC-*.md` or dated build-plan doc).
3. Execution must be plan-referenced: each material implementation step must map to a current plan item before the step starts.
4. If a material step is not represented in the active plan, update the plan first, then execute.
5. Plan status must be updated continuously during execution (not batch-updated at the end).
6. Immediately after each material step, append a plan update entry with concrete evidence (commands, tests, artifacts, or review references).
7. After every merge, trackers must be refreshed together: milestone status, linked future action status, and linked risk status.
8. Activating a next slice requires creating/updating the next plan doc in the same tracker refresh change set.

## Rejection Triggers

1. Title does not match naming policy.
2. PR body is missing required sections or has placeholder content.
3. Branch/PR/commit identities do not align.
4. Validation evidence is omitted or vague.
5. A material branch/approach has no corresponding active plan doc under `docs/strategy/`.
6. Implementation evidence does not reconcile against plan status updates.
7. Post-merge tracker refresh does not update milestone + action + risk together.
8. Material implementation steps were executed without pre-step plan mapping or immediate post-step evidence updates.

## Change Control

Any change to PR rules requires:

1. update to this file,
2. update to `docs/governance/pr-branch-policy.md` and/or `config/governance/pr-policy.json` when affected,
3. log entry in `docs/logs/YYYY-MM-DD.md`.
