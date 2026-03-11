#!/bin/bash

# Claude Code Hook: Post-Task Lint
# Runs npm run lint:fix after tool use or session end.
# Migrated from: .gemini/hooks/post-task-lint.sh

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 0

# Only run if package.json exists and has the lint:fix script
if [ -f "package.json" ] && grep -q '"lint:fix"' package.json 2>/dev/null; then
  npm run lint:fix --silent 2>/dev/null || true
fi
