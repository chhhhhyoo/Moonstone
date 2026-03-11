#!/bin/bash

# This hook runs npm run lint:fix at the end of a session or agent turn.
# It reads input from stdin (as required by Gemini CLI hooks) and outputs a valid JSON.

# Read input (though we don't strictly need it for this simple hook)
cat > /dev/null

# Change to the project directory
cd "$GEMINI_PROJECT_DIR" || exit 1

# Run lint:fix and capture output to stderr to keep stdout clean for JSON
echo "Running npm run lint:fix..." >&2
npm run lint:fix >&2 2>&1

# Output mandatory JSON to stdout
echo '{"decision": "allow", "systemMessage": "Auto-linting completed via npm run lint:fix."}'
