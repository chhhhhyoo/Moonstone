# Validation

## Goals

Detect drift early and fail closed on missing contracts.

## Immediate Gate Set

`npm run verify` executes:

1. passive index regeneration
2. skill presence checks
3. spec and governance existence checks
4. strategy tracker integrity checks
5. markdown link checks
6. symlink boundary checks
7. memory gitignore checks
8. text-hygiene gate
9. TypeScript compile gate (`tsc --noEmit`)
10. ESLint strict gate
11. contract export integrity gate
12. unit tests
13. POC runtime unit tests (artifact contract, retry/idempotency, runtime transitions)

`npm run verify:strict` adds:

1. one-machine-one-component parity check
2. passive-index freshness check
3. scope-classifier deterministic tests
4. branch naming policy check
5. strategy tracker integrity re-check
6. conformance tests
7. POC connector + replay/webhook conformance suites

## Drift Policy

Guarded code changes must include `notes/spec-impact/*.md` with required frontmatter.

## PR Governance Policy

1. Branch and PR naming are fail-closed by `docs/governance/pr-branch-policy.md`.
2. Scope routing (`docs_only`, `governance`, `runtime`) is config-driven and defaults to `runtime` on unknown paths.
