---
name: eval-suite-checklist
description: Validate test quality, scenario coverage, and conformance guard strength. Trigger when designing test suites, adding new agents, or verifying PR readiness.
---

# eval-suite-checklist

## Purpose
Ensure evaluation/conformance suites are coverage-complete, deterministic, and failure-aware across happy paths, edge cases, adversarial input, and system-failure behavior.

## Protocol

### Phase 1: Coverage Matrix (Mandatory)

Before adding/updating tests, define matrix coverage with all categories:

0. Start from `.codex/skills/eval-suite-checklist/assets/TEST_STRATEGY.md` so required categories/fields are not skipped.
1. Happy path: expected nominal behavior.
2. Edge cases: boundary inputs, empty/invalid shapes, timing boundaries.
3. Security/adversarial: malformed or malicious inputs and injection-style attempts.
4. System-failure behavior: provider outages, timeouts, retries, partial failure handling.
5. Durable execution semantics: crash/resume, idempotency, replay-safety guarantees.

If any category has no coverage, log it as a gap before implementation.

### Phase 2: Implementation Checklist

1. Place conformance tests under `test/integration/conformance/`.
2. Keep assertions deterministic and side-effect-safe.
3. Avoid shell-string command execution patterns in tests; use explicit argument arrays/process APIs.
4. Validate contract expectations against canonical runtime contracts when applicable (`src/core/contracts.mjs`).

### Phase 3: Verification

1. Run conformance structure lint:

```bash
npm run conformance:lint
```

2. Run targeted conformance suite:

```bash
npm run test:conformance
```

3. For release-level confidence or runtime-scope change, run strict gate:

```bash
npm run verify:strict
```

4. If new scenarios expose drift, record gaps in `findings.md` and route fixes through `systematic-debugging`.

### Phase 4: Quality Verdict

Summarize coverage status as:
1. Covered categories.
2. Remaining gaps.
3. Highest-risk untested failure mode.
4. Next validation step.

## Skill Synergy

1. With `test-driven-development`: convert matrix items into failing tests first.
2. With `systematic-debugging`: investigate non-deterministic or failing conformance cases.
3. With `ship`: ensure conformance quality is explicit before release proposals.
4. With non-migrated `finishing-a-development-branch`: use `ship` as local release-readiness fallback.

## Exit Protocol

1. Document new test gaps in `findings.md`.
2. Update `docs/logs/YYYY-MM-DD.md` with the coverage verdict and commands executed.
3. Promote durable testing patterns and anti-patterns to `docs/learnings.md`.
4. Update `task_plan.md` and `progress.md` when audit results change implementation scope.
