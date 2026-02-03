#!/usr/bin/env bash
# Copy the full frontend from Music Bingo Backend into music-bingo-app, then commit and push.
# Netlify will deploy the updated app (Print tab, Host, Play, Roll Call, trivia, etc.).
#
# Usage:
#   MUSIC_BINGO_APP_PATH=/path/to/app ./scripts/sync-full-frontend-and-push.sh
#   ./scripts/sync-full-frontend-and-push.sh /path/to/music-bingo-app
#   ./scripts/sync-full-frontend-and-push.sh   # tries MUSIC_BINGO_APP_PATH, then .. and ../music-bingo-app
#
# Requires: GITHUB_TOKEN set (so the script can push the app repo). See docs/GITHUB-PUSH-AND-SYNC-SETUP.md

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONTEND_SRC="$BACKEND_ROOT/frontend/src"

# Load .env or env so GITHUB_TOKEN is set (paste your token in one of those files once)
if [[ -f "$BACKEND_ROOT/.env" ]]; then
  set -a; source "$BACKEND_ROOT/.env"; set +a
elif [[ -f "$BACKEND_ROOT/env" ]]; then
  set -a; source "$BACKEND_ROOT/env"; set +a
fi

# Resolve target repo
if [[ -n "$MUSIC_BINGO_APP_PATH" ]]; then
  TARGET="$(cd "$BACKEND_ROOT" && cd "$MUSIC_BINGO_APP_PATH" && pwd)"
elif [[ -n "$1" ]]; then
  TARGET="$(cd "$BACKEND_ROOT" && cd "$1" && pwd)"
else
  for CANDIDATE in ".." "../music-bingo-app"; do
    TARGET="$(cd "$BACKEND_ROOT" && cd "$CANDIDATE" 2>/dev/null && pwd)"
    if [[ -d "$TARGET/src" ]] && [[ -f "$TARGET/package.json" ]]; then
      break
    fi
    TARGET=""
  done
  if [[ -z "$TARGET" ]]; then
    echo "Usage: $0 /path/to/music-bingo-app"
    echo "   or: MUSIC_BINGO_APP_PATH=/path ./scripts/sync-full-frontend-and-push.sh"
    echo "Could not find music-bingo-app (no src/ + package.json in .. or ../music-bingo-app)."
    exit 1
  fi
fi

TARGET_SRC="$TARGET/src"
if [[ ! -d "$TARGET_SRC" ]]; then
  echo "Error: No src/ in $TARGET"
  exit 1
fi

echo "▶ Syncing full frontend into music-bingo-app"
echo "  From: $FRONTEND_SRC"
echo "  To:   $TARGET_SRC"
echo ""

# Additive sync: copy all our files; don't delete files that exist only in the app
rsync -av --exclude='*.map' "$FRONTEND_SRC/" "$TARGET_SRC/"

echo ""
echo "▶ Committing and pushing in app repo..."
cd "$TARGET"
git add -A src/
if git diff --cached --quiet 2>/dev/null; then
  echo "  No changes to commit (files already match)."
else
  git commit -m "Sync full frontend from bingo-backend (Host, Play, Print, Roll Call, trivia)"
fi

echo ""
echo "▶ Pushing to origin main (Netlify will deploy)..."
(cd "$TARGET" && "$BACKEND_ROOT/scripts/git-push-with-token.sh")

echo ""
echo "✅ Done. The Playroom live site will update after Netlify finishes building."
