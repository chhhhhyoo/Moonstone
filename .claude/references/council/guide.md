# Council Reference Guide

Reference documentation for `/council` command. Describes the federated multi-AI council workflow.

## Overview

- Gather responses from multiple AI agents on the same prompt
- Let the chairman (current session) synthesize the final response
- Reference: [Karpathy's LLM Council](https://github.com/karpathy/llm-council)

### Workflow (3 Stages)

1. **Send**: Same prompt dispatched to each council member (parallel `Agent` subagents)
2. **Collect**: Surface all member responses with attribution
3. **Synthesize**: Chairman synthesizes final answer from all perspectives

## Configuration

In Claude Code, the council is implemented using parallel `Agent` (general-purpose) subagents rather than external CLI calls. Each "member" is an Agent with a distinct perspective prompt.

### Default Members (Agent Perspectives)

| Member | Perspective | Focus |
|--------|------------|-------|
| Pragmatist | Ship fast, iterate | Simplicity, speed, MVP |
| Architect | Long-term quality | Scalability, maintainability, patterns |
| Skeptic | Challenge assumptions | Edge cases, risks, failure modes |
| User Advocate | End-user experience | UX, accessibility, clarity |

### Adding Custom Perspectives

Add members by defining a perspective prompt in the `/council` command invocation. Each member should have a clear role that doesn't overlap with others.

## Examples

### Technical Decision
```
"React vs Vue - which fits this project better? Summon the council."
```
Steps: Dispatch parallel agents → Collect perspectives → Synthesize recommendation

### Architecture Review
```
"Let's hear different perspectives on this design."
```
Steps: Summarize design → Query council → Analyze commonalities → Synthesize

## Safety

- Do **NOT** share sensitive information (API keys, credentials, secrets) in council prompts
- Council members are isolated subagents — treat their outputs as external opinions requiring synthesis

## Requirements

- No external CLI installation needed (uses Claude's native `Agent` tool)
- Each council member runs as a parallel `Agent` (general-purpose) subagent
- Node.js required only if using the legacy `council.sh` scripts from `.gemini/`
