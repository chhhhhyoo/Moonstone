# Local Skill Routing

## Policy

1. Local `.codex/skills` is primary.
2. Global/system skills are fallback only.
3. Missing required local skills is a hard verification failure.

## Stage Routing

| Stage | Skills | Output |
|---|---|---|
| Intent crystallization | `clarify`, `hermeneia` | resolved requirement ambiguities and explicit intent contract |
| Idea shaping (pre-implementation design) | `brainstorming`, `prothesis`, `agent-council` | evidence-backed design options, validated strawman, and chosen direction |
| Community sentiment scan | `dev-scan`, `prothesis`, `brainstorming` | source-cited practitioner consensus/controversy map to de-risk design choices |
| New capability factory (agent/service from zero) | `build-agent-from-scratch`, `factory-scaffold`, `writing-plans` | interview-backed spec package with safety policy and explicit implementation handoff |
| Deliberation (when options conflict) | `agent-council`, `prothesis` | explicit tradeoff debate and chosen decision record |
| Factory blueprint (new artifacts) | `factory-scaffold`, `moonstone-transformer`, `writing-plans` | artifact spec + model-to-runtime scaffold mapping + pre-code blueprint approval |
| Plan bootstrap | `factory-init`, `planning-with-files`, `writing-plans` | initialized memory files plus bounded execution plan and tracked findings |
| Clarification and structure | `orchestrator`, `prothesis`, `syneidesis` | explicit tradeoffs and selected approach |
| Parallel decomposition | `dispatching-parallel-agents`, `orchestrator`, `systematic-debugging` | independent work packets with conflict-gated parallel investigation and integration plan |
| Implementation | `executing-plans`, `run-local`, `test-driven-development`, `tool-design-checklist`, `systematic-debugging` | testable implementation slices with local run evidence |
| Incident response | `crash-inspector`, `systematic-debugging`, `orchestrator` | timestamped crash report plus explicit recovery handoff before further retries |
| Verification | `verify`, `verify-strict`, `doubt`, `verification-before-completion`, `eval-suite-checklist` | gate execution, strict conformance checks, and claim re-validation |
| Comprehension closure | `katalepsis`, `wrap` | user-verified understanding of delivered changes before final session closeout |
| Commit preparation | `git-craft-commit`, `high-integrity-commit`, `ship` | atomic staged diff plus gate-backed Conventional Commit execution proposal before release context |
| Release readiness | `ship`, `finishing-a-development-branch` | scope-aware verification proof plus explicit branch closeout decision path (merge/PR/keep/discard) |
| Wrap and memory | `wrap`, `reflexion`, `capture-skill`, `manage-skills` | zero-loss closeout, promoted learnings, reusable skill capture, and catalog integrity |

## Usage Rules

1. Use the minimum skill set that fully covers the task.
2. For new complex tasks without planning files, run `factory-init` before `planning-with-files`.
3. For new tool/skill/agent work, run `factory-scaffold` before coding.
4. Run `manage-skills` at least once per milestone.
5. For high-stakes ambiguous asks, run `clarify` before writing plans or executing code changes.
6. For contested strategic choices, run `agent-council` before locking plans.
7. When implementation needs local execution evidence, run `run-local` and capture command results.
8. When claims are challenged or uncertain, run `doubt` before proceeding.
9. Run `verify` before any completion claim unless strict tier is explicitly required.
10. Use `verify-strict` for runtime-scope release claims or when strict-gate assurance is required.
11. Before push/PR/merge decisions, run `ship` to produce a scope-aware ship proposal.
12. `wrap` is mandatory before ending material sessions to avoid context-loss and stale memory.
13. For resumed sessions, recall persisted state first (`npm run state:recall`).
14. Resolve or explicitly dismiss any `[Gap:]` blockers in `task_plan.md` before final verification.
15. Before `executing-plans`, run `npm run check:skill-prereqs -- --skill executing-plans`.
16. Before completion/ship claims, run `npm run check:verification-fresh`.
17. Use `skill-creator` only when a repeated workflow is worth codifying.
18. Use `skill-installer` only for curated bootstrap into local `.codex/skills`.
19. When lifecycle workflow controls are edited, run `npm run check:session-automation`.
20. For idea-first requests without a design contract, run `brainstorming` before `writing-plans` or `executing-plans`.
21. For new agent/service builds from zero, run `build-agent-from-scratch` before implementation execution.
22. When a command/tool fails repeatedly or the user cancels due to hang, run `crash-inspector` before additional retries.
23. When a session produces reusable workflow knowledge, run `capture-skill` before final wrap.
24. For requests asking "developer opinions/community reactions," run `dev-scan` before locking strategy conclusions.
25. When 2+ failures are independent and non-overlapping, run `dispatching-parallel-agents` before assigning investigations.
26. When creating or revising conformance/eval suites, run `eval-suite-checklist` before final verification claims.
27. When implementation is complete and branch integration choice is needed, run `finishing-a-development-branch` after `ship`.
28. When transforming Moonstone model definitions into runtime agent scaffolding, run `moonstone-transformer` before manual wiring edits.
29. When the user asks to stage/prepare commits, run `git-craft-commit` before branch closeout.
30. When the user explicitly asks to execute commits with strict quality gates, run `high-integrity-commit`.
31. When the user asks to understand or walk through delivered changes, run `katalepsis` before final wrap.
