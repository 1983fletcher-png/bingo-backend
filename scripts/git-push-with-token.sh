#!/usr/bin/env bash
# Push current repo to origin main. Auto-loads GITHUB_TOKEN from .env or env in repo root so Cursor/CI can push.
# Run from the repo root you want to push (or from anywhere; script will cd to repo root).
set -e

# Find repo root (directory containing .git)
GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || true
if [[ -n "$GIT_ROOT" ]]; then
  cd "$GIT_ROOT"
  # Load token from .env or env (gitignored; never commit)
  if [[ -f "$GIT_ROOT/.env" ]]; then
    set -a
    # shellcheck source=/dev/null
    source "$GIT_ROOT/.env"
    set +a
  elif [[ -f "$GIT_ROOT/env" ]]; then
    set -a
    # shellcheck source=/dev/null
    source "$GIT_ROOT/env"
    set +a
  fi
fi

if [[ -z "$GITHUB_TOKEN" ]]; then
  echo "GITHUB_TOKEN not set. Add GITHUB_TOKEN=ghp_... to this repo's .env or env file (see .env.example)."
  git push origin main
  exit $?
fi

# Build HTTPS URL with token so push works without interactive auth
ORIGIN="$(git remote get-url origin)"
if [[ "$ORIGIN" =~ ^https://github\.com/ ]]; then
  # https://github.com/owner/repo -> https://TOKEN@github.com/owner/repo
  PUSH_URL="${ORIGIN#https://}"
  PUSH_URL="https://${GITHUB_TOKEN}@${PUSH_URL}"
elif [[ "$ORIGIN" =~ ^https://[^@]+@github\.com/(.+)$ ]]; then
  # https://token@github.com/owner/repo[.git] -> https://TOKEN@github.com/owner/repo
  SUFFIX="${BASH_REMATCH[1]}"
  SUFFIX="${SUFFIX%.git}"
  PUSH_URL="https://${GITHUB_TOKEN}@github.com/${SUFFIX}"
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
