# Session Automation Policy

## Purpose

Capture `.gemini/settings.json` lifecycle-hook intent as an explicit Codex-native governance contract.

## Canonical Policy File

`config/governance/session-automation-policy.json`

## Enforcement

1. Policy integrity is checked by `npm run check:session-automation`.
2. Canonical verification pipeline (`npm run verify`) includes this check.
3. Lifecycle behavior is protocol-driven in Codex (skills + commands + governance docs), not runtime hook callbacks.

## Required Mapping Coverage

1. `SessionStart` -> state recall controls
2. `SessionEnd` -> lint hygiene controls
3. `BeforeTool` (`activate_skill`) -> sequencing preflight controls
4. `AfterAgent` -> lint hygiene controls
5. `AfterTool` (`exec`) -> verification tracking controls
6. `AfterTool` (`activate_skill`) -> state and context-index refresh controls
7. `AfterModel` -> evidence freshness controls

## Policy Invariants

1. `disabled` list must remain empty unless exceptions are explicitly approved and documented.
2. Every mapped command must resolve to an existing `npm run <script>` command.
3. Every mapped doc/skill reference must resolve to local files.
