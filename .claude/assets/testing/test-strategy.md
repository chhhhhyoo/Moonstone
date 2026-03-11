# Conformance Test Strategy

Required categories (at least 1 test each):
- **happy** — expected inputs produce expected outputs
- **bad_input** — invalid inputs handled gracefully
- **system_failure** — failures (network, disk, timeout) handled correctly
- **security** — injection, auth bypass, privilege escalation blocked

Each test must include:
- `command` array (no shell — prevents injection)
- `timeout_ms` — explicit timeout
- `exit_code` expectation — verify correct exit behavior
