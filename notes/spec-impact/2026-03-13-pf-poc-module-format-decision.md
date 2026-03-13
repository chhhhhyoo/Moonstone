---
status: accepted
changed_areas:
  - runtime-modules
  - build-toolchain
  - delivery-strategy
consulted_sources:
  - package.json
  - tsconfig.json
  - docs/strategy/PF-POC-019.md
decisions:
  - Keep `.mjs` as the dominant implementation format for active PF-POC runtime slices.
  - Reject ad-hoc mixed `.ts` + `.mjs` feature work during active product slices.
  - Defer TypeScript source migration to a dedicated milestone with explicit migration gates.
---

# 2026-03-13 POC Module Format Decision (MJS Now, TS Slice Later)

## Summary

Moonstone remains on a Node ESM `.mjs` runtime contract for current promptable-workflow POC delivery. TypeScript source-file migration is deferred intentionally to a dedicated future slice.

## Evidence Basis

1. Repo extension inventory at decision time:
   - `.mjs`: `113`
   - `.ts`: `0`
2. Toolchain contract:
   - `package.json` scripts execute Node directly over `.mjs` entrypoints.
   - `tsconfig.json` uses `allowJs: true`, `checkJs: true`, `noEmit: true`, and includes `.mjs` runtime paths.

## Decision Rationale

1. Current product risk is runtime capability and pilot signal, not transpilation architecture.
2. Piecemeal `.ts` introduction would create dual-runtime/tooling paths with low product value and high drift risk.
3. Existing strict `checkJs` path already provides meaningful type safety while preserving fast iteration.

## Enforceable Constraints

1. Active PF-POC feature slices continue in `.mjs`.
2. No opportunistic `.ts` file additions inside runtime-critical paths during ongoing POC slices.
3. Any TypeScript migration must be scoped as a dedicated milestone with:
   - explicit conversion boundaries,
   - CI/runtime gate parity,
   - no mixed-contract ambiguity at merge.

## Follow-Up Intent

1. Capture a dedicated TS migration milestone only when current POC product criteria are stable enough to absorb toolchain migration risk.
