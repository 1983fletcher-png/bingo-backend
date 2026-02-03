#!/usr/bin/env bash
# Copy Roll Call and waiting room frontend files from bingo-backend/frontend
# into the music-bingo-app repo so Netlify deploys the latest.
#
# Usage:
#   ./scripts/sync-roll-call-to-music-bingo-app.sh [TARGET_DIR]
#   # or
#   MUSIC_BINGO_APP=/path/to/music-bingo-app ./scripts/sync-roll-call-to-music-bingo-app.sh
#
# Example (music-bingo-app cloned next to Music Bingo Backend):
#   ./scripts/sync-roll-call-to-music-bingo-app.sh "../music-bingo-app"

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONTEND_SRC="$BACKEND_ROOT/frontend/src"
TARGET="${1:-$MUSIC_BINGO_APP}"

if [ -z "$TARGET" ] || [ ! -d "$TARGET" ]; then
  echo "Usage: $0 /path/to/music-bingo-app"
  echo "   or: MUSIC_BINGO_APP=/path/to/music-bingo-app $0"
  echo ""
  echo "music-bingo-app should be the repo connected to Netlify (the Playroom frontend)."
  exit 1
fi

TARGET_SRC="$TARGET/src"
if [ ! -d "$TARGET_SRC" ]; then
  echo "Expected to find src/ inside $TARGET. Not found."
  exit 1
fi

echo "Syncing from $FRONTEND_SRC to $TARGET_SRC ..."

mkdir -p "$TARGET_SRC/components" "$TARGET_SRC/data"

cp "$FRONTEND_SRC/components/RollCallGame.tsx"       "$TARGET_SRC/components/"
cp "$FRONTEND_SRC/components/WaitingRoomTiltMaze.tsx" "$TARGET_SRC/components/"
cp "$FRONTEND_SRC/components/WaitingRoomView.tsx"   "$TARGET_SRC/components/"
cp "$FRONTEND_SRC/data/rollCallMaps.ts"             "$TARGET_SRC/data/"

echo "Done. Copied:"
echo "  - src/components/RollCallGame.tsx"
echo "  - src/components/WaitingRoomTiltMaze.tsx"
echo "  - src/components/WaitingRoomView.tsx"
echo "  - src/data/rollCallMaps.ts"
echo ""
echo "Next: cd $TARGET && git status && git add src/components/RollCallGame.tsx src/components/WaitingRoomTiltMaze.tsx src/components/WaitingRoomView.tsx src/data/rollCallMaps.ts && git commit -m 'Sync Roll Call from bingo-backend' && git push origin main"
