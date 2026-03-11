---
name: run-local
description: Run local development validation loops for this repository before/while implementing changes. Trigger on "run local", "/run_local", or requests to execute a local instance workflow.
---

# run-local

Codex-native migration of Gemini `/run_local`.

## Purpose

Execute the closest equivalent of "local instance mode" for this repo by running local checks and focused runtime tests before claiming readiness.

## Protocol

### Step 1: Runtime Entry Preflight

1. Inspect `package.json` scripts for runnable local entrypoints.
2. If no app server entrypoint exists, switch to verification-driven local loop.
3. Report any mismatch between requested runtime flags and actual repo capabilities.

### Step 2: Local Loop Selection

Use the smallest command that proves the intended change safely:

1. Focused behavior checks (preferred while iterating):
   - `npm run test:unit`
   - `npm run test:conformance` (only when provider/proxy behavior changed)
2. Full local gate before handoff:
   - `npm run verify`
3. Strict release-like local gate when requested:
   - `npm run verify:strict`

### Step 3: Evidence Capture

1. Record command + result in `progress.md`.
2. If failures occur, capture root-cause notes in `findings.md` and route to `systematic-debugging`.

### Step 4: Readiness Statement Rules

Do not claim readiness unless corresponding command(s) actually passed in this session.

## Compatibility Mapping

Source command expected:

`STAGE=local MODE=instance npm run ts-node src/main.ts`

Repo-native replacement:

1. No `ts-node` runtime script exists in this repo.
2. Primary local execution truth is the verification/test command set in `package.json`.

## Enhancements Over Source Command

1. Adds explicit capability detection instead of assuming a server entrypoint.
2. Enforces minimum command selection to keep iteration fast and deterministic.
3. Integrates failure routing to `systematic-debugging`.

## Skill Synergy

1. With `doubt`: use when readiness claims are challenged.
2. With `verification-before-completion`: use to finalize command evidence.
3. With `systematic-debugging`: immediate handoff on persistent command failures.

## Exit Protocol

1. Record local run evidence in `progress.md`.
2. Log material run risks/outcomes in `docs/logs/YYYY-MM-DD.md`.
3. Promote durable run-loop lessons into `docs/learnings.md`.
