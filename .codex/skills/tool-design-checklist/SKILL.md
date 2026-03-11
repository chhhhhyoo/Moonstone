---
name: tool-design-checklist
description: Use when designing or modifying tool definitions. Ensures tools are token-efficient, type-safe, and have explicit intents.
---
# tool-design-checklist

## Purpose
Enforce a high standard of quality for project tools, ensuring they are reliable, easy for agents to use, and compliant with the "Durable Execution" boundary. It minimizes token usage and maximizes type safety.

## Protocol

### Step 1: Requirements Check
1.  Read `assets/DESIGN_PRINCIPLES.md`.
2.  Identify the explicit intent of the tool.

### Step 2: Input Validation
1.  Ensure all tool parameters have strict types and descriptive docstrings.
2.  Check for **Dual-Write** risks: does the tool perform both a database update and an external API call without a transaction?

### Step 3: Output Modeling
1.  Verify the tool returns structured data (JSON) rather than raw text.
2.  Ensure the tool returns an `OperationReceipt` if it performs a side-effect.

### Step 4: Efficiency Check
1.  Minimize return payload size to avoid LLM context bloat.

### Step 5: Verification
1.  Draft tool JSON.
2.  Run validator: `npm run tool:validate <path>`.

## Exit Protocol
1.  **Document**: Record tool audit in `findings.md`.
2.  **Log**: Update `docs/logs/YYYY-MM-DD.md`.
3.  **Learn**: Promote new tool design patterns to `docs/learnings.md`.
4.  **Handoff**: Chain next step via `activate_skill`.
