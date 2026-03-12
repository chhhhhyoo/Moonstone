---
status: accepted
changed_areas:
  - poc-compiler
  - cli-compile
  - diagnostics-contract
  - strategy-tracking
consulted_sources:
  - specs/01-architecture.md
  - specs/02-workflows.md
  - docs/strategy/PF-POC-004.md
  - docs/strategy/2026-03-12-pf-poc-001-risk-register.md
decisions:
  - Add deterministic compile diagnostics payload with branch mode, inferred conditions, warnings, and generated node IDs.
  - Preserve backward compatibility by keeping `compilePromptToArtifact` and adding `compilePrompt` as diagnostics-capable API.
  - Surface fallback transparency at CLI layer via `poc:compile` diagnostics summary and optional diagnostics JSON output.
---

# 2026-03-12 PF-POC-004 Compile Diagnostics Impact

## Summary

This slice adds compile-time transparency so operators can see what heuristics were applied and when conditional intent falls back to a default graph.

## Runtime/Compiler Contract Impact

1. `compilePrompt` now returns `{ artifact, diagnostics }`.
2. Diagnostics include:
   - `branchMode` (`exists` | `comparator` | `default`)
   - inferred condition hints (`httpMethod`, failure branch, exists/comparator condition)
   - warning list for unsupported conditional phrasing fallback
   - generated node IDs
3. `compilePromptToArtifact` remains available and backward-compatible for existing callers.

## CLI Impact

1. `poc:compile` output now includes diagnostics summary.
2. Added optional `--diagnostics-out <path>` to emit full diagnostics JSON.

## Test Impact

1. Added diagnostics-focused compiler unit tests for:
   - supported comparator inference mode
   - unsupported conditional fallback warning mode

## Strategy Impact

1. Added PF-POC-004 milestone/action/risk tracking and plan updates.
2. Added daily log evidence for merge refresh and diagnostics slice implementation.
