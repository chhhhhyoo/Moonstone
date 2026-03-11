# Moonstone Orchestration - Claude Project Instructions

## Cognitive Hub (Context Map)

IMPORTANT: Prefer retrieval-led reasoning over pre-training-led. Read referenced files for specialized logic before acting.

### Skills
Root: `.claude/skills/` — each skill in its own directory with `SKILL.md`

| Command | Purpose | Key Synergies |
|---------|---------|---------------|
| `/orchestrate` | Master workflow router — epistemic protocol + strategy + execution | All commands |
| `/brainstorm` | Multi-perspective design with parallel agents | `/clarify`, `/write-plan` |
| `/clarify` | Socratic questioning to resolve ambiguity | `/brainstorm`, `/orchestrate` |
| `/write-plan` | Implementation specs with gap detection | `/syneidesis`, `/tech-decide` |
| `/execute-plan` | Batch execution with freshness checks | `/write-plan`, `/tdd` |
| `/subagent-dev` | Fresh Agent per task + two-stage review | `/write-plan`, `/tdd` |
| `/ultrawork` | Drift-proof DAG execution with mechanical verification | `/write-plan`, `/council` |
| `/tdd` | Red-Green-Refactor with Iron Law | `/debug`, `/verify-complete` |
| `/debug` | 4-phase root cause investigation | `/tdd`, `/reflect` |
| `/commit` | High-integrity commits with clustering | `/verify-complete`, `/self-review` |
| `/self-review` | Diff analysis + 6-pillar checklist | `/commit`, `/finish-branch` |
| `/review-pr` | Receive PR reviews with technical rigor | `/self-review` |
| `/finish-branch` | Branch completion (merge/PR/keep/discard) | `/self-review`, `/ship` |
| `/ship` | Verify + summarize vs SPEC + propose ship | `/verify-complete`, `/finish-branch` |
| `/verify` | Spec lint + conformance + SSOT check | `/verify-strict`, `/ship` |
| `/verify-strict` | Full strict verification gate | `/verify`, `/debug` |
| `/verify-complete` | Evidence before claims — the truth gate | `/commit`, `/tdd` |
| `/council` | Multi-AI federated council for complex decisions | `/brainstorm`, `/tech-decide` |
| `/tech-decide` | Deep parallel research for A-vs-B decisions | `/dev-scan`, `/write-plan` |
| `/dev-scan` | Community sentiment research (Reddit, HN, Dev.to) | `/tech-decide`, `/council` |
| `/syneidesis` | Gap surfacing at decision points | `/write-plan`, `/orchestrate` |
| `/doubt` | Self-verification of claims against evidence | `/syneidesis`, `/verify-complete` |
| `/katalepsis` | Socratic comprehension verification | `/clarify` |
| `/reflect` | 3-agent insight extraction + crystallization | `/wrap`, `/bridge` |
| `/wrap` | 6-phase session closure protocol | `/reflect`, `/commit` |
| `/bridge` | Knowledge base operations (retrieve/log/daily) | `/reflect`, `/wrap` |
| `/capture` | Capture workflows as reusable commands | `/manage-commands` |
| `/manage-commands` | Command library management | `/capture` |
| `/build-agent` | Design + scaffold new agents | `/tool-checklist` |
| `/factory-init` | Manus-style planning setup (task_plan, findings, progress) | `/write-plan` |
| `/factory-scaffold` | Scaffold new Factory artifacts | `/vault`, `/write-plan` |
| `/project-insight` | Git history + planning context analysis | `/orchestrate` |
| `/session-check` | Plan vs artifact verification | `/wrap`, `/execute-plan` |
| `/save-ref` | Save and categorize reference materials | `/bridge` |
| `/crash-inspect` | NTSB-style crash documentation | `/debug` |
| `/eval-checklist` | Test matrix: happy/edge/security/failure | `/tdd` |
| `/moonstone-transform` | XState JSON → TypeScript + Zod + tests | `/tdd` |
| `/launch` | 3-phase product launch pipeline | `/write-plan`, `/ship` |
| `/write-content` | Transform insights into publishable content | `/brainstorm`, `/syneidesis` |
| `/vault` | Read project standards before decisions | `/bridge`, `/write-plan` |
| `/tool-checklist` | Tool design validation checklist | `/build-agent` |
| `/worktree` | Isolated git worktree setup | `/execute-plan`, `/finish-branch` |
| `/run-local` | Run server locally in instance mode | — |

### Supporting Files Directory (`.claude/`)

```
.claude/
├── skills/                # 43 skills — auto-activate by context or invoke via /name
│   ├── debug/SKILL.md     # (one directory per skill, each with SKILL.md)
│   ├── tdd/SKILL.md
│   └── ... (43 total)
├── commands/              # Legacy slash commands (kept for backward compat)
├── hooks/                 # Git and tool hook scripts
├── settings.json          # Hook configuration
├── templates/             # Scaffolding & output templates
│   ├── command.md         # New command template
│   ├── task-plan.md       # Planning template (Manus-style)
│   ├── findings.md        # Findings & decisions template
│   ├── progress.md        # Progress log template
│   ├── dag-plan.md        # Strict DAG plan (/ultrawork)
│   ├── moonstone-machine.ts.hbs # XState machine Handlebars template
│   ├── moonstone-schema.ts.hbs  # Zod schema Handlebars template
│   └── moonstone-service.ts.hbs # Service class Handlebars template
├── prompts/               # Agent subagent dispatch prompts
│   ├── reflect/           # /reflect subagents (insight-extractor, knowledge-finder, session-summarizer)
│   ├── tech-decide/       # /tech-decide subagents (codebase-explorer, docs-researcher, tradeoff-analyzer, decision-synthesizer)
│   ├── subagent-dev/      # /subagent-dev agents (implementer, spec-reviewer, code-quality-reviewer)
│   └── shared/            # Shared prompts (code-reviewer — used by /self-review, /subagent-dev, /review-pr)
├── references/            # Decision guides & checklists
│   ├── council/guide.md           # Council workflow reference
│   ├── tech-decide/               # Evaluation criteria & report templates
│   ├── build-agent/               # Spec questionnaire & rubric
│   ├── command-quality-checklist.md
│   ├── multi-agent-patterns.md    # Orchestration patterns (parallel, sequential, 2-phase)
│   └── vault-index.md             # Obsidian vault catalog
├── assets/                # Technical knowledge bases
│   ├── debugging/         # Root-cause tracing, defense-in-depth, condition-based waiting, pressure tests
│   ├── testing/           # Anti-patterns catalog, test strategy
│   ├── planning/          # Manus reference, planning examples
│   └── tool-design/       # Design principles
└── scripts/               # Executable utility scripts
    ├── init-session.sh          # Planning file scaffolding
    ├── check-complete.sh        # Phase completion checker
    ├── verifier.sh              # Mechanical verification harness
    ├── find-polluter.sh         # Test pollution bisection
    ├── scan-commands.cjs        # Command registry scanner
    ├── lint-spec.ts             # Spec placeholder/format linter
    ├── scaffold-specs.ts        # Spec directory scaffolder
    ├── validate-spec.ts         # Spec structure validator
    ├── lint-conformance.ts      # Conformance test linter
    ├── run-conformance.ts       # Conformance test runner (shell=false safety)
    ├── validate-tool.ts         # Tool schema validator
    └── condition-based-waiting-example.ts  # Reference: flaky test fix patterns
```

### Key Documentation
- `docs/` - Project documentation, decisions, learnings
- `docs/plans/` - Implementation plans
- `docs/logs/` - Transparency logs (YYYY-MM-DD.md)
- `docs/learnings.md` - Crystallized insights
- `docs/decisions/` - Technical decision records
- `specs/` - Specification files
- `notes/` - Playbooks and factory run logs

### Working Memory Files (Manus-style)
- `task_plan.md` - Current plan with tasks, phases, and epistemic gaps
- `findings.md` - Turn-level discoveries (reconcile to docs/logs/ at session end)
- `progress.md` - Session progress tracking

## Safety Policy

These rules are enforced at all times:

1. **NEVER** run destructive commands (`rm -rf`, `dd if=`, `mkfs`, fork bombs, raw `/dev/sd*`)
2. **NEVER** run `sudo` commands
3. **ALWAYS ask before**: `git push`, `npm publish`, `docker push`, `kubectl apply`
4. **ALWAYS ask before**: `npm install`, `pip install`, `cargo add` (dependency changes)

## Epistemic Protocol

The epistemic protocol stack ensures rigorous reasoning:

1. **Hermeneia** (Intent Clarification) → embedded in `/clarify` and `/brainstorm`
2. **Prothesis** (Multi-Perspective Analysis) → embedded in `/brainstorm` and `/write-content`
3. **Syneidesis** (Gap Surfacing) → `/syneidesis` — MANDATORY before finalizing plans
4. **Katalepsis** (Comprehension Verification) → `/katalepsis`

Before executing code changes:
1. Check `task_plan.md` for unresolved epistemic gaps (lines matching `[ ] [Gap:`)
2. If gaps exist, address them before proceeding with implementation
3. After significant file changes, consider whether the user needs a comprehension check

## Quality Gate (No-Lies Validator)

- NEVER claim "tests passed" or "verification complete" without actually running the verification commands
- If you claim success, you must have run the relevant test/lint/build commands in the same session
- When in doubt, re-run verification before claiming success
- See `/verify-complete` for the full evidence-before-claims protocol

## Session Discipline

- When finishing a task, run `/wrap` to crystallize insights and update project documentation
- Reconcile discoveries into `docs/logs/` and `docs/learnings.md`
- Update `task_plan.md` and `progress.md` when completing work

## Verification Commands

Standard verification suite:
```bash
npm run lint:fix          # Auto-fix lint issues
npm run verify            # Basic verification
npm run spec:lint         # Spec lint
npm run spec:validate     # Spec validation
npm run conformance       # Conformance checks
npm run moonstone:ssot:check    # Moonstone single-source-of-truth check
npm run spec:guard        # Spec guard
npm run module:parity     # Module parity check
npm run test:model        # Model tests
```

## Coding Standards

### TypeScript Strict Mode (Mandatory)

- **NEVER use `any`** — `@typescript-eslint/no-explicit-any` is enforced
- Use `unknown` for truly unknown types, then narrow with type guards
- Use generics `<T>` for reusable, type-safe components
- Use union types `A | B` for finite sets of possibilities
- Use discriminated unions for complex state machines
- Use `Record<K, V>` for dynamic objects
- Always type empty arrays: `const items: string[] = []`
- Use Zod or type guards for runtime validation of external data

### General
- Follow existing patterns in the codebase
- TDD: Write tests alongside or before implementation (see `/tdd`)
- Keep changes bounded and failure-aware
- Run `npm run lint:fix` after making code changes
- DRY, YAGNI — no speculative abstractions

### TypeORM Entity Typing
- ALWAYS define column types explicitly for MySQL/SQLite compatibility
- Use non-null assertion (`!`) for TypeORM-initialized properties

## Command Auto-Suggest Rules

IMPORTANT: When you detect any of the situations below, proactively suggest the relevant command to the user. Do not silently proceed without offering the workflow. Say: "This looks like a good use case for `/command` — want me to run it?"

### Debugging & Fixing
| Situation | Suggest |
|-----------|---------|
| Bug, test failure, unexpected behavior, error encountered | `/debug` |
| Test won't pass after 2-3 attempts during debugging | `/debug` (escalate to architecture review) |
| Crash, stack trace, production incident | `/crash-inspect` |

### Building & Implementing
| Situation | Suggest |
|-----------|---------|
| New feature, new functionality requested | `/tdd` |
| Bug fix needed | `/tdd` + `/debug` |
| Multi-step task (3+ steps or multiple files) | `/write-plan` |
| Ambiguous or vague requirements | `/clarify` |
| "Build X", "Design X", open-ended feature request | `/brainstorm` |
| Complex feature needing isolation | `/worktree` |
| XState or Moonstone JSON to convert | `/moonstone-transform` |
| Creating a new tool, skill, or agent artifact | `/factory-scaffold` |
| Designing a new agent from scratch | `/build-agent` |

### Planning & Decisions
| Situation | Suggest |
|-----------|---------|
| "Should I use X or Y?", "A vs B", tech comparison | `/tech-decide` |
| Need community opinions, library sentiment | `/dev-scan` |
| Complex decision needing multiple perspectives | `/council` |
| About to finalize a plan or make irreversible decision | `/syneidesis` |
| Starting a new project phase or large feature | `/factory-init` |
| Need to understand project context first | `/project-insight` |
| Need to check project standards before deciding | `/vault` |

### Quality & Verification
| Situation | Suggest |
|-----------|---------|
| About to claim "done", "fixed", "passing" | `/verify-complete` |
| About to commit code | `/commit` |
| After completing a feature, before merge | `/self-review` |
| Ready to push / ship to production | `/ship` |
| Need full verification suite | `/verify` or `/verify-strict` |
| Reviewing a PR from someone else | `/review-pr` |
| Need test coverage matrix for a feature | `/eval-checklist` |

### Execution & Workflow
| Situation | Suggest |
|-----------|---------|
| Have a plan, ready to execute tasks | `/execute-plan` or `/subagent-dev` |
| Need highest-discipline, zero-drift execution | `/ultrawork` |
| Finishing work on a branch | `/finish-branch` |
| Product ready for launch | `/launch` |
| Running server locally for development | `/run-local` |

### Knowledge & Session
| Situation | Suggest |
|-----------|---------|
| End of session or significant work block | `/wrap` |
| Want to extract insights from session | `/reflect` |
| Need to verify completed tasks match plan | `/session-check` |
| Want to check if claims are actually true | `/doubt` |
| After explaining something complex, check understanding | `/katalepsis` |
| Found a useful URL or reference to save | `/save-ref` |
| Discovered a reusable workflow pattern | `/capture` |
| Want to write a blog post, essay, or newsletter | `/write-content` |
| Need to search or log to knowledge base | `/bridge` |
| Managing the command library | `/manage-commands` |

## Command Dependency Rules

- `/execute-plan` requires plan files in `docs/plans/` — run `/write-plan` first if none exist
- `/build-agent` requires `docs/TECHNICAL_HANDBOOK.md` to exist
- `/write-plan` MUST run `/syneidesis` gap check before finalization
- `/ship` MUST run `/verify` before proposing ship
- `/commit` MUST run verification before committing (Iron Gate)
