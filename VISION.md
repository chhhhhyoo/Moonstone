# Moonstone Vision

Moonstone is a runtime-first orchestration platform for durable, promptable automation.
The user is the lead chef: they provide intent, taste, and feedback. Moonstone is the
kitchen: it decides workflow structure, picks tools, wires nodes, executes safely, and
returns for review and redirection. The user should not need to author node JSON.

## North Star

> Given high-level intent in natural language, Moonstone synthesizes and evolves the
> automation graph: what nodes/tools are needed, how they connect, how data flows,
> and how execution recovers. It runs that graph durably, surfaces auditable evidence,
> and incorporates directional feedback to improve outcomes.

## Lead-Chef Operating Model

The user operates at vision level:

1. states outcomes, constraints, and review direction,
2. inspects proposed/mutated workflow summaries and run evidence,
3. redirects intent without manually wiring nodes.

Moonstone operates at synthesis and execution level:

1. compiles/mutates workflow artifacts from prompt direction,
2. enforces deterministic, fail-closed graph validity and safety rules,
3. executes through command/receipt envelopes with append-only journaling,
4. returns inspect/replay evidence for review loops.

## Target Outcomes

1. **Promptable graph synthesis**:
   - `PromptCompiler` evolves from static prompt-to-artifact into iterative prompt-to-mutation capability.
2. **Promptable graph mutation**:
   - directable add/replace/connect/remove workflow operations from prompt intent with deterministic outputs.
3. **Durable execution core**:
   - `WorkflowRuntime` remains command/receipt/journal-driven with replay/resume guarantees after synthesis or mutation.
4. **Transport-agnostic boundaries**:
   - adapters normalize ingress to core contracts; no transport-specific orchestration logic in core.
5. **Fail-closed governance and verification**:
   - strategy/spec/verification gates catch drift before merge.
6. **Durable engineering memory**:
   - plan, log, and learning artifacts retain decision context and prevent repeat mistakes.

## Current Vs Next

Current (implemented):

1. prompt -> workflow compile and deterministic runtime execution,
2. webhook/http/openai connector lane with inspect/replay/resume,
3. comparator and upstream-status branching for compiled graphs.

Next (active roadmap direction):

1. prompt-driven direct-apply graph mutation (`poc:mutate`) with deterministic single-operation safety,
2. expanded review loop where users steer outcomes through prompt direction instead of manual graph edits,
3. iterative synthesis where prompt feedback reshapes workflow topology over multiple cycles.

## Non-Goals

1. No shell-monolith orchestration.
2. No transport-specific business logic in core runtime.
3. No external vault as canonical project memory.
4. No async side-effects inside Moonstone state transitions.
5. No mandatory manual node-by-node authoring for users in the target operating model.
