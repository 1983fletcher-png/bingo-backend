#!/usr/bin/env bash
# Copy fixed Roll Call (maps + collision + vibration off) into music-bingo-app and push to deploy.
# Run from Music Bingo Backend. Pass the path to your music-bingo-app repo (the one Netlify builds).
#
# Usage:
#   ./scripts/sync-and-push-roll-call.sh /path/to/music-bingo-app
#   MUSIC_BINGO_APP_PATH=/path ./scripts/sync-and-push-roll-call.sh   # no args
#
# Example if music-bingo-app is next to Music Bingo Backend:
#   ./scripts/sync-and-push-roll-call.sh "../music-bingo-app"

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

if [[ -n "$MUSIC_BINGO_APP_PATH" ]]; then
  TARGET="$(cd "$BACKEND_ROOT" && cd "$MUSIC_BINGO_APP_PATH" && pwd)"
elif [[ -n "$1" ]]; then
  TARGET="$(cd "$BACKEND_ROOT" && cd "$1" && pwd)"
else
  echo "Usage: $0 /path/to/music-bingo-app   or   MUSIC_BINGO_APP_PATH=/path $0"
  exit 1
fi
TARGET_SRC="$TARGET/src"

if [ ! -d "$TARGET_SRC" ]; then
  echo "Error: No src/ in $TARGET (expected a React/Vite app)."
  exit 1
fi

echo "▶ Syncing Roll Call into music-bingo-app"
echo "  From: $FRONTEND_SRC"
echo "  To:   $TARGET_SRC"
echo ""

mkdir -p "$TARGET_SRC/components" "$TARGET_SRC/data"
cp "$FRONTEND_SRC/components/RollCallGame.tsx"         "$TARGET_SRC/components/"
cp "$FRONTEND_SRC/components/WaitingRoomTiltMaze.tsx"  "$TARGET_SRC/components/"
cp "$FRONTEND_SRC/components/WaitingRoomView.tsx"      "$TARGET_SRC/components/"
cp "$FRONTEND_SRC/data/rollCallMaps.ts"                "$TARGET_SRC/data/"

echo "  Copied: RollCallGame, WaitingRoomTiltMaze, WaitingRoomView, rollCallMaps.ts"
echo ""

# Commit and push in the app repo
cd "$TARGET"
git add src/components/RollCallGame.tsx src/components/WaitingRoomTiltMaze.tsx \
        src/components/WaitingRoomView.tsx src/data/rollCallMaps.ts 2>/dev/null || true

# If WaitingRoomTiltMaze is new, ensure it's added
git add src/components/WaitingRoomTiltMaze.tsx 2>/dev/null || true

if git diff --cached --quiet 2>/dev/null; then
  echo "  No changes to commit (files already match)."
else
  git commit -m "Roll Call: playable maps, push-out collision, vibration off, tilt maze option"
fi

echo ""
echo "▶ Pushing to origin main (Netlify will deploy)..."
(cd "$TARGET" && "$BACKEND_ROOT/scripts/git-push-with-token.sh")

echo ""
echo "✅ Done. The Playroom will update after Netlify finishes building."
