# Memory And Documentation

## Memory Layers

1. Ephemeral session memory: `task_plan.md`, `findings.md`, `progress.md` (gitignored)
2. Daily execution log: `docs/logs/YYYY-MM-DD.md`
3. Durable lessons: `docs/learnings.md`
4. Architectural decisions: `docs/decisions/YYYY-MM-DD-*.md`
5. Reusable standards/playbooks: `notes/*.md`
6. Strategy and risk plans: `docs/strategy/*`

## Mandatory Rules

1. `findings.md` is transient; reconcile before closeout.
2. Durable lessons must be promoted to `docs/learnings.md`.
3. ADR files contain decisions, not status updates.
4. External user vaults cannot be canonical documentation.

## Passive Context Index

`docs/index/passive-context-index.md` is generated from repo sources and checked for freshness in strict verification.
