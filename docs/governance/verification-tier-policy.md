# Verification Tier Policy

## Stage 0 (Immediate Hard Gates)

Blocking now:

1. canonical governance docs and specs exist
2. `AGENTS.md` points to canonical governance docs
3. required local skills exist
4. markdown links resolve
5. no external-doc symlink source-of-truth pattern
6. ephemeral planning files are gitignored
7. text-hygiene gate passes
8. TypeScript compile gate passes
9. ESLint strict gate passes
10. PR governance policy/config artifacts are present and valid
11. PR title/body governance checks pass (identity + insight-first description contract)
12. strategy tracker schema/status/link integrity checks pass
13. contract-export integrity gate passes
14. unit tests pass
15. epistemic unresolved-gap guard passes (`task_plan.md` has no open `[Gap:]` blockers)
16. completion claims use fresh verification evidence (status pass and recency within policy window)
17. workspace safety policy integrity check passes
18. session automation policy integrity check passes

## Stage 1 (Runtime Structure Gates)

Blocking when first active Moonstone agent exists:

1. one-machine-one-component parity
2. orchestrator overview exists and reflects runtime
3. spec-impact records are present and valid
4. passive-context-index freshness gate passes
5. verification scope classifier tests pass

## Stage 2 (Contract/Conformance Gates)

Blocking when first real provider proxy ships:

1. provider/proxy conformance tests pass
2. conformance fixtures exist under `test/integration/conformance`
3. receipt generation/validation is active for side effects

## Pull Request Scope Routing

Scope classes:

1. `docs_only`
2. `governance`
3. `runtime`

Rules:

1. Unknown file paths classify as `runtime` (fail closed).
2. `runtime` scope requires full strict verification in PR.
3. `docs_only` and `governance` may use tiered PR checks.
4. Pushes to `main` and nightly schedule always run full strict verification.
