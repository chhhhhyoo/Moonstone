#!/bin/bash

# Gemini CLI Hook: Session Wrap Enforcer
# Purpose: Ensure the session is never closed without running /wrap.

INPUT=$(cat)
EVENT_TYPE=$(echo "$INPUT" | jq -r '.event')

if [ "$EVENT_TYPE" == "AfterModel" ]; then
    RESPONSE=$(echo "$INPUT" | jq -r '.response')
    
    # Detect completion signals
    if [[ "$RESPONSE" =~ "Complete" || "$RESPONSE" =~ "Finished" || "$RESPONSE" =~ "done" || "$RESPONSE" =~ "successfully" ]]; then
        # Check if /wrap was recently mentioned or session-wrap was activated
        # This is a heuristic reminder
        SUGGESTION="[WRAP ENFORCER] It looks like you've finished a task. **MANDATORY**: You MUST run \`/wrap\` before ending this session to crystallize insights and update the project graph."
        echo "{\"decision\": \"allow\", \"systemMessage\": \"$SUGGESTION\"}"
        exit 0
    fi
fi

echo '{"decision": "allow"}'
