#!/bin/bash

# Gemini CLI Hook: Epistemic Gate
# Purpose: Enforce Epistemic Protocol precedence globally.

INPUT=$(cat)
EVENT_TYPE=$(echo "$INPUT" | jq -r '.event')
PROJECT_DIR=$(echo "$INPUT" | jq -r '.project_dir')

if [ "$EVENT_TYPE" == "BeforeTool" ]; then
    TOOL=$(echo "$INPUT" | jq -r '.tool')
    
    # 1. Block Execution if Syneidesis gaps are unresolved
    if [[ "$TOOL" == "run_shell_command" || "$TOOL" == "write_file" || "$TOOL" == "replace" ]]; then
        if [ -f "$PROJECT_DIR/task_plan.md" ]; then
            UNRESOLVED_GAPS=$(grep -c "\[ \] \[Gap:" "$PROJECT_DIR/task_plan.md")
            if [ "$UNRESOLVED_GAPS" -gt 0 ]; then
                REJECTION="[EPISTEMIC GATE BLOCKED] There are $UNRESOLVED_GAPS unresolved epistemic gaps in 'task_plan.md'. You MUST address or dismiss these via the Syneidesis protocol before executing this tool."
                echo "{\"decision\": \"block\", \"systemMessage\": \"$REJECTION\"}"
                exit 0
            fi
        fi
    fi
fi

# 2. Suggest Katalepsis after significant changes
if [ "$EVENT_TYPE" == "AfterTool" ]; then
    TOOL=$(echo "$INPUT" | jq -r '.tool')
    EXIT_CODE=$(echo "$INPUT" | jq -r '.exit_code // 0')
    
    if [[ "$EXIT_CODE" -eq 0 && ("$TOOL" == "write_file" || "$TOOL" == "replace") ]]; then
        SUGGESTION="[EPISTEMIC GATE SUGGESTION] Significant changes were made. Consider activating 'katalepsis' to verify user comprehension."
        echo "{\"decision\": \"allow\", \"systemMessage\": \"$SUGGESTION\"}"
        exit 0
    fi
fi

echo '{"decision": "allow"}'
