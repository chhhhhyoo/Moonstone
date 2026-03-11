---
name: run-local
description: Use to start the development server locally for testing and development in instance mode.
user-invocable: true
allowed-tools: Bash, Read
---

# Run Local

Run the boilerplate server locally in instance mode for agent development.

## Command

```bash
STAGE=local MODE=instance npm run ts-node src/main.ts
```

## Requirements

- Must be in the `boilerplate-be` directory
- `MODE=instance` is required — the app configures for Lambda and exits without it
- `STAGE=local` sets local development environment
- No `USE_Moonstone` flag (Moonstone-only mode)

## Usage

Provide the task context when invoking:

```
/run-local [agent-name] development
```

The server will start locally for the specified agent development workflow.

## Troubleshooting

- **App exits immediately**: Check that `MODE=instance` is set
- **Port in use**: Kill existing process or change port
- **Missing dependencies**: Run `npm install` first

$ARGUMENTS
