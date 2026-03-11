# Workspace Safety Policy

## Purpose

Codify destructive-command and high-impact-command handling as a local governance artifact compatible with Codex-native workflows.

## Canonical Policy File

`config/governance/workspace-safety-policy.json`

## Enforcement

1. Policy integrity is checked by `npm run check:workspace-safety`.
2. Canonical verification pipeline (`npm run verify`) includes this check.
3. Runtime command execution controls still follow Codex permission and escalation model.

## Required Rule Classes

1. `deny_prefixes`: immediate-deny command prefixes.
2. `deny_regexes`: deny dangerous destructive command patterns.
3. `ask_user_regexes`: require explicit user consent for high-impact operations.
