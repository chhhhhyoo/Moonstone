#!/bin/bash

# Gemini CLI Hook: State-Aware Session Manager
# Purpose: Persist and recall active skill context across sessions using jq.

INPUT=$(cat)
STATE_FILE="$GEMINI_PROJECT_DIR/.gemini/state.json"

# Ensure state file exists with valid JSON
if [ ! -f "$STATE_FILE" ]; then
    echo '{"activeSkill": "none", "currentPhase": "none", "lastVerificationStatus": "0", "lastVerificationTime": 0}' > "$STATE_FILE"
fi

# Parse event type using jq
EVENT_TYPE=$(echo "$INPUT" | jq -r '.event')

# 1. Handle SessionStart (Recall)
if [ "$EVENT_TYPE" == "SessionStart" ]; then
    ACTIVE_SKILL=$(jq -r '.activeSkill // "none"' "$STATE_FILE")
    CURRENT_PHASE=$(jq -r '.currentPhase // "none"' "$STATE_FILE")
    
    if [ "$ACTIVE_SKILL" != "none" ] && [ "$ACTIVE_SKILL" != "null" ]; then
        MSG="[STATE RECALLED] You were previously using the '$ACTIVE_SKILL' skill. Please maintain this context."
        echo "{\"decision\": \"allow\", \"systemMessage\": \"$MSG\"}"
    else
        echo '{"decision": "allow"}'
    fi
    exit 0
fi

# 2. Handle AfterTool (Persist Skill)
if [ "$EVENT_TYPE" == "AfterTool" ]; then
    TOOL_NAME=$(echo "$INPUT" | jq -r '.tool')
    
    if [ "$TOOL_NAME" == "activate_skill" ]; then
        # Extract the skill name from the tool arguments
        # arguments might be a string or object depending on CLI version, robustly handle it
        NEW_SKILL=$(echo "$INPUT" | jq -r '.arguments.name // .arguments.skill // empty')
        
        if [ ! -z "$NEW_SKILL" ]; then
            # Update state using jq
            TMP_FILE=$(mktemp)
            jq --arg skill "$NEW_SKILL" '.activeSkill = $skill' "$STATE_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$STATE_FILE"
            echo "{\"decision\": \"allow\", \"systemMessage\": \"[STATE PERSISTED] Active skill set to: $NEW_SKILL\"}"
            exit 0
        fi
    fi
fi

# Default allow
echo '{"decision": "allow"}'