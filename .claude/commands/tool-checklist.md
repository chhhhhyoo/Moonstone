# Tool Design Checklist

Use when designing or modifying tool definitions. Ensures tools are token-efficient, type-safe, and have explicit intents.

## Workflow

1. **Read Design Principles**: Read `.claude/assets/tool-design/design-principles.md` for tool design standards
2. **Draft tool JSON/schema**: Follow the principles below
3. **Validate**: Run `.claude/scripts/validate-tool.ts <path>` to check the tool definition

## Design Principles

### Token Efficiency
- Keep descriptions concise but unambiguous
- Use enums over free-text where possible
- Minimize required parameters — default what you can

### Type Safety
- Every parameter must have an explicit type
- Use union types for constrained values
- Provide `description` for every parameter

### Explicit Intent
- Tool name should describe the action (verb + noun)
- Description should state WHEN to use, not just WHAT it does
- Include examples in the description for ambiguous tools

### Checklist

- [ ] Name is verb+noun (e.g., `createUser`, `fetchLogs`)
- [ ] Description includes "when to use" guidance
- [ ] All parameters typed with descriptions
- [ ] Required vs optional correctly set
- [ ] Defaults provided where sensible
- [ ] Enum values used for constrained inputs
- [ ] Error responses documented
- [ ] Token budget considered (description length)

## Synergies (Command Integration)

- **+ `/build-agent`**: Use this checklist when designing tools for new agents
- **+ `/capture`**: Capture new tool patterns as reusable templates

## Exit Protocol (Mandatory)

1. Reconcile findings to `docs/logs/YYYY-MM-DD.md`
2. Crystallize insights to `docs/learnings.md`
3. Update `task_plan.md`
4. Chain Next Step: Recommend the next appropriate `/command`

$ARGUMENTS
