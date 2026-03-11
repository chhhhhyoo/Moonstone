#!/bin/bash

# Gemini CLI Hook: Quality Gate (The "No-Lies" Validator)
# Purpose: Prevent claiming success without running verification.

INPUT=$(cat)
STATE_FILE="$GEMINI_PROJECT_DIR/.gemini/state.json"

# Ensure state file exists
if [ ! -f "$STATE_FILE" ]; then
    echo '{"activeSkill": "none", "currentPhase": "none", "lastVerificationStatus": "0", "lastVerificationTime": 0}' > "$STATE_FILE"
fi

EVENT_TYPE=$(echo "$INPUT" | jq -r '.event')

# 1. Capture commands being run (AfterTool)
if [ "$EVENT_TYPE" == "AfterTool" ]; then
    TOOL=$(echo "$INPUT" | jq -r '.tool')
    
    if [ "$TOOL" == "exec" ] || [ "$TOOL" == "run_shell_command" ]; then
        COMMAND=$(echo "$INPUT" | jq -r '.command // .arguments.command')
        EXIT_CODE=$(echo "$INPUT" | jq -r '.exitCode // 0') # Default to 0 if not present, but usually is
        
        # Check if command is a verification command
        if [[ "$COMMAND" =~ (test|lint|verify|spec:validate|build) ]]; then
            TIMESTAMP=$(date +%s)
            
            # Update state using jq
            TMP_FILE=$(mktemp)
            jq --arg code "$EXIT_CODE" --argjson time "$TIMESTAMP" \
               '.lastVerificationStatus = $code | .lastVerificationTime = $time'
               "$STATE_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$STATE_FILE"
        fi
    fi
    echo '{"decision": "allow"}'
    exit 0
fi

# 2. Validate Agent Response (AfterModel)
if [ "$EVENT_TYPE" == "AfterModel" ]; then
    RESPONSE=$(echo "$INPUT" | jq -r '.content // empty')
    
    # Keywords that imply success
    if echo "$RESPONSE" | grep -Ei -q "(test passed|verification complete|ready to commit|successfully verified|tests passed|linting passed)"; then
        
        LAST_STATUS=$(jq -r '.lastVerificationStatus // "1"' "$STATE_FILE")
        LAST_TIME=$(jq -r '.lastVerificationTime // 0' "$STATE_FILE")
        NOW=$(date +%s)
        DIFF=$((NOW - LAST_TIME))
        
        # If last verification failed (!= 0) or is older than 5 minutes (300s)
        if [ "$LAST_STATUS" != "0" ] || [ "$DIFF" -gt 300 ]; then
            REJECTION="[QUALITY GATE BLOCKED] You are claiming verification success, but no passing test/lint command was detected in the last 5 minutes (Last status: $LAST_STATUS, Time ago: ${DIFF}s). You MUST run the verification command before making this claim."
            echo "{\"decision\": \"block\", \"systemMessage\": \"$REJECTION\"}"
            exit 0
        fi
    fi
fi

echo '{"decision": "allow"}'