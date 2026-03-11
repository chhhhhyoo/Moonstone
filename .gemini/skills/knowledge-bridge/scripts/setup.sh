#!/bin/bash
# setup.sh - Connects the Project to the Obsidian Vault
# Usage: ./setup.sh <PATH_TO_OBSIDIAN_VAULT>

set -e

VAULT_PATH="$1"
PROJECT_NAME="Team-JNP-Lisa-V2"
LOCAL_LINK_DIR="docs/obsidian"

if [ -z "$VAULT_PATH" ]; then
    echo "Usage: $0 <PATH_TO_OBSIDIAN_VAULT>"
    exit 1
fi

if [ ! -d "$VAULT_PATH" ]; then
    echo "Error: Vault path '$VAULT_PATH' does not exist."
    exit 1
fi

echo "🔗 Connecting to Obsidian Vault at: $VAULT_PATH"

# 1. Scaffold Global Structure (if missing)
mkdir -p "$VAULT_PATH/00_Meta/Templates"
mkdir -p "$VAULT_PATH/10_Global_Knowledge/Workflows"
mkdir -p "$VAULT_PATH/10_Global_Knowledge/Engineering_Patterns"
mkdir -p "$VAULT_PATH/20_Projects/$PROJECT_NAME"

# 2. Scaffold Project Structure in Vault
mkdir -p "$VAULT_PATH/20_Projects/$PROJECT_NAME/Plans"
mkdir -p "$VAULT_PATH/20_Projects/$PROJECT_NAME/Decisions"
mkdir -p "$VAULT_PATH/20_Projects/$PROJECT_NAME/Work_Logs"

# 3. Create Reverse Symlink (Repo-Centric)
# We link the Repo's 'docs' folder INTO the Vault.
# This makes the Repo the source of truth, but visible in Obsidian.
TARGET_LINK="$VAULT_PATH/20_Projects/$PROJECT_NAME/Repo_Docs"

if [ -L "$TARGET_LINK" ]; then
    rm "$TARGET_LINK"
fi

# Ensure local docs exist
mkdir -p docs/decisions
mkdir -p docs/plans
mkdir -p docs/logs

ln -s "$(pwd)/docs" "$TARGET_LINK"

# 4. Create Global Config
echo "{\"vault_root\": \"$VAULT_PATH\", \"project_root\": \"20_Projects/$PROJECT_NAME\"}" > .gemini/obsidian_config.json

echo "✅ Connection Established!"
echo "Obsidian Access: $TARGET_LINK -> $(pwd)/docs"
echo "Config Saved: .gemini/obsidian_config.json"
