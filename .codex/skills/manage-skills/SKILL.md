---
name: manage-skills
description: Audit local skill catalog quality, drift, and required coverage. Trigger once per milestone or when skill verification fails.
---

# manage-skills

## Purpose
Maintain a high-integrity, repo-specific skill catalog that ensures agent behavior is governed by durable protocols rather than ephemeral prompts.

## Protocol

### Phase 1: Quality Enforcement
1.  **Execute Gate**: Run `npm run check:skills` to identify shallow, broken, or non-compliant skills.
2.  **Rubric Validation**: Ensure every skill contains mandatory sections: `## Purpose`, `## Protocol`, and `## Exit Protocol`.
3.  **Durable Memory Check**: Verify that the `Exit Protocol` explicitly mandates updates to `docs/logs/` and `docs/learnings.md`.

### Phase 2: Catalog Audit
1.  **Orphan Detection**: Identify local skills that are no longer referenced by any workflow or command.
2.  **Drift Detection**: Compare local skill instructions against the SSOT (`VISION.md`/`SPEC.md`) to ensure architectural alignment (e.g., Durable Execution).

### Phase 3: Remediation
1.  **Scaffold missing sections** for skills that fail the automated gate.
2.  **Promote high-value patterns** discovered in `docs/learnings.md` into new or existing skills.

## Exit Protocol
1.  Verify that `npm run check:skills` passes.
2.  Document catalog changes in `docs/logs/YYYY-MM-DD.md`.
3.  Promote durable skill-governance lessons to `docs/learnings.md`.
