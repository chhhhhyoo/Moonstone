# Moonstone

`Moonstone` is the NASA-family seed repo for the v2 orchestrator runtime plane.

It combines:

- Lisa-style runtime orchestration and Moonstone agents
- Plutus-style governance, verification, and memory discipline

## Core Position

- Runtime core is transport-agnostic.
- Adapters own Slack/REST/Teams protocol details.
- Domain behavior lives in Moonstone agents.
- Provider proxies own protocol calls.
- Governance and auditability run around runtime via receipts and verification.

## Commands

- `npm run verify`: stage-0 hard gates
- `npm run verify:strict`: stage-0 + stage-1/2 strict gates
- `npm run poc:compile -- --prompt "..."`
- `npm run poc:validate -- --artifact <path>`
- `npm run poc:run -- --artifact <path> --input <path|json>`
- `npm run poc:serve -- --artifact <path>`
- `npm run poc:replay -- --run-id <id>`
- `npm run poc:inspect -- --run-id <id>`
- `npm run check:strategy`: validate milestones/actions schema, IDs, and linkage
- `npm run check:text-hygiene`: tabs/trailing whitespace/EOF newline checks
- `npm run check:type`: TypeScript compile gate (`tsc --noEmit`)
- `npm run check:lint`: ESLint strict gate for runtime JS scope
- `npm run check:contracts`: required runtime contract export integrity
- `npm run docs:index`: regenerate passive context index
- `npm run test:conformance`: run provider/proxy conformance tests

## Canonical Docs

- [SPEC.md](SPEC.md)
- [docs/governance/agent-rulebook.md](docs/governance/agent-rulebook.md)
- [docs/governance/local-skill-routing.md](docs/governance/local-skill-routing.md)
- [docs/governance/pr-branch-policy.md](docs/governance/pr-branch-policy.md)
- [docs/governance/verification-tier-policy.md](docs/governance/verification-tier-policy.md)
- [docs/orchestrator-overview.md](docs/orchestrator-overview.md)
