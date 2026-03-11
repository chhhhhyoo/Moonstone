#!/bin/bash
# verifier.sh - Mechanical Integrity Check
#
# Usage: echo $JSON | ./verifier.sh
# Input: JSON string with "acceptance_criteria" array
# Output: Standardized Verification Result
#
# The Lie Detector: It doesn't care what the agent says. It cares what the exit code is.

set -e

INPUT=$(cat)

# 1. Parse Criteria
# We expect input format: { "acceptance_criteria": [ { "id": "test1", "command": "npm test", ... } ] }
CRITERIA=$(echo "$INPUT" | jq -c '.acceptance_criteria[]' 2>/dev/null || echo "")

if [ -z "$CRITERIA" ]; then
    echo "No acceptance criteria found. Assuming MANUAL verification needed."
    echo "VERIFICATION_STATUS=MANUAL"
    exit 0
fi

PASS_COUNT=0
FAIL_COUNT=0
FAILED_DETAILS=""

echo "Starting Mechanical Verification..." >&2

# 2. Execute Each Command
IFS=$'\n'
for ITEM in $CRITERIA; do
    ID=$(echo "$ITEM" | jq -r '.id')
    CMD=$(echo "$ITEM" | jq -r '.command')
    DESC=$(echo "$ITEM" | jq -r '.description')

    echo "  Running [$ID]: $CMD" >&2

    # Run the command. We use eval to handle arguments/pipes.
    # Capture output to prevent spamming stdout, unless it fails.
    if eval "$CMD" > /dev/null 2>&1; then
        echo "  PASS: $ID" >&2
        PASS_COUNT=$((PASS_COUNT+1))
    else
        echo "  FAIL: $ID" >&2
        FAIL_COUNT=$((FAIL_COUNT+1))
        FAILED_DETAILS="${FAILED_DETAILS}\n- [$ID] Failed: $CMD"
    fi
done

# 3. Report Results
echo "----------------------------------------" >&2
echo "Summary: $PASS_COUNT Passed, $FAIL_COUNT Failed" >&2

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo "VERIFICATION_STATUS=PASSED"
    echo "MESSAGE=All $PASS_COUNT mechanical checks passed."
else
    echo "VERIFICATION_STATUS=FAILED"
    echo "FAILED_ITEMS=\"$FAILED_DETAILS\""
    # Force a non-zero exit to signal the agent
    exit 1
fi
