#!/usr/bin/env bash
# Push current repo to origin main. Uses GITHUB_TOKEN if set (for Cursor/CI); else normal git push.
# Run from the repo root you want to push.
set -e

if [[ -z "$GITHUB_TOKEN" ]]; then
  git push origin main
  exit $?
fi

# Build HTTPS URL with token so push works without interactive auth
ORIGIN="$(git remote get-url origin)"
if [[ "$ORIGIN" =~ ^https://github\.com/ ]]; then
  # https://github.com/owner/repo -> https://TOKEN@github.com/owner/repo
  PUSH_URL="${ORIGIN#https://}"
  PUSH_URL="https://${GITHUB_TOKEN}@${PUSH_URL}"
elif [[ "$ORIGIN" =~ ^git@github\.com: ]]; then
  # git@github.com:owner/repo.git -> https://TOKEN@github.com/owner/repo
  SUFFIX="${ORIGIN#git@github.com:}"
  SUFFIX="${SUFFIX%.git}"
  PUSH_URL="https://${GITHUB_TOKEN}@github.com/${SUFFIX}"
else
  echo "Unsupported remote: $ORIGIN"
  exit 1
fi

git push "$PUSH_URL" main
