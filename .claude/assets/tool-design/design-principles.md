# Tool Design Principles

Core principles for designing safe, ergonomic tools:

- **Explicit intent** via `x-tool-type` (read/write/action)
- **Bounded payloads** — limit + pagination + fields selection
- **Safety levers** for write/action tools — `dryRun` and `confirm` parameters
- **Ergonomics** — enums and booleans over free-form strings
