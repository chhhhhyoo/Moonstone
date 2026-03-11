#!/bin/bash

# Gemini CLI Hook: Skill Cross-Linker
# Purpose: Ensure logical flow between dependent skills (e.g., Plan -> Execute).

INPUT=$(cat)
EVENT_TYPE=$(echo "$INPUT" | jq -r '.event')

if [ "$EVENT_TYPE" == "BeforeTool" ]; then
    TOOL=$(echo "$INPUT" | jq -r '.tool')
    
    if [ "$TOOL" == "activate_skill" ]; then
        TARGET_SKILL=$(echo "$INPUT" | jq -r '.arguments.name // .arguments.skill')
        
        # LOGIC 1: Executing-plans needs a plan file
        if [ "$TARGET_SKILL" == "executing-plans" ]; then
            PLAN_COUNT=$(ls "$GEMINI_PROJECT_DIR/docs/plans/"*.md 2>/dev/null | wc -l)
            if [ "$PLAN_COUNT" -eq 0 ]; then
                REJECTION="[SKILL LINKER BLOCKED] You are trying to activate 'executing-plans', but no plan files were found in 'docs/plans/'. You MUST run 'writing-plans' first."
                echo "{\"decision\": \"block\", \"systemMessage\": \"$REJECTION\"}"
                exit 0
            fi
        fi

        # LOGIC 2: Build-agent-from-scratch needs an updated technical handbook
        if [ "$TARGET_SKILL" == "build-agent-from-scratch" ]; then
            if [ ! -f "$GEMINI_PROJECT_DIR/docs/TECHNICAL_HANDBOOK.md" ]; then
                REJECTION="[SKILL LINKER BLOCKED] You cannot build a new agent without a TECHNICAL_HANDBOOK.md present. Please create/update documentation first."
                echo "{\"decision\": \"block\", \"systemMessage\": \"$REJECTION\"}"
                exit 0
            fi
        fi
    fi
fi

echo '{"decision": "allow"}'