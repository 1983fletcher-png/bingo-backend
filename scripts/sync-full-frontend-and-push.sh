#!/usr/bin/env bash
# FULL SYNC IS DISABLED. Do not use this script to overwrite music-bingo-app.
#
# music-bingo-app is the single source of truth for the live site's UI/UX.
# Syncing this repo's frontend/ into the app would replace the app's design system,
# GlobalNav, themes, and layout with the minimal backend reference UI.
#
# See: docs/FRONTEND-ARCHITECTURE.md
# Use: sync-and-push-roll-call.sh for Roll Call only; port other features by hand into music-bingo-app.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo "❌ FULL FRONTEND SYNC IS DISABLED"
echo ""
echo "  The live site (theplayroom.netlify.app) is built from music-bingo-app."
echo "  That repo owns the UI: design system, nav, themes, landing page."
echo "  Syncing this backend's frontend/ into it would overwrite that design."
echo ""
echo "  Do this instead:"
echo "  • Landing page / copy / UI changes → Edit music-bingo-app directly."
echo "  • New API or socket behavior → Implement here; use from the app with its UI."
echo "  • Roll Call updates only → ./scripts/sync-and-push-roll-call.sh"
echo ""
echo "  Details: $BACKEND_ROOT/docs/FRONTEND-ARCHITECTURE.md"
echo ""
exit 1
