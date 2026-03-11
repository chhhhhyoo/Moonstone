#!/bin/bash
# Hook: Refresh Cognitive Map
# Triggered by: activate_skill (see settings.json)

# Run the generator. Redirect stderr to keep stdout clean for JSON.
node "$GEMINI_PROJECT_DIR/.gemini/scripts/generate-cognitive-map.js" >&2 2>&1

# Output mandatory JSON to stdout
echo '{"decision": "allow", "systemMessage": "Passive Context Index (GEMINI.md) refreshed."}'
