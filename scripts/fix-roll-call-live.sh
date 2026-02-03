#!/usr/bin/env bash
# One-command fix: find music-bingo-app and sync + push Roll Call so the live site gets the update.
# Run from anywhere. No arguments needed.
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$BACKEND_ROOT"

# Try likely locations for music-bingo-app (the repo Netlify builds)
for CANDIDATE in ".." "../music-bingo-app"; do
  TARGET="$(cd "$BACKEND_ROOT" && cd "$CANDIDATE" 2>/dev/null && pwd)"
  if [ -d "$TARGET/src" ] && [ -f "$TARGET/package.json" ]; then
    echo "Found app at: $TARGET"
    exec "$BACKEND_ROOT/scripts/sync-and-push-roll-call.sh" "$CANDIDATE"
  fi
done

echo "Could not find music-bingo-app (no src/ + package.json in .. or ../music-bingo-app)."
echo "Clone it next to Music Bingo Backend, then run:"
echo "  ./scripts/sync-and-push-roll-call.sh ../music-bingo-app"
echo "Or if your app repo is elsewhere:"
echo "  ./scripts/sync-and-push-roll-call.sh /path/to/music-bingo-app"
exit 1
