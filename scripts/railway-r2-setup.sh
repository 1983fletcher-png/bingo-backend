#!/usr/bin/env bash
# One script to run the full Railway R2 setup: install CLI (if needed), login, link, push R2 vars.
# Paste into terminal (from anywhere): bash -c 'cd "/Users/jasonfletcher/Documents/Cursor AI /Music Bingo Backend" && ./scripts/railway-r2-setup.sh'
# Or from repo root: ./scripts/railway-r2-setup.sh
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "== Railway R2 setup =="

if [[ ! -f "$REPO_ROOT/.env" ]]; then
  echo "No .env found. Add your R2_* variables to .env first (see docs/R2-SETUP.md)."
  exit 1
fi

if ! grep -q -E '^R2_[A-Z_]+=' .env 2>/dev/null; then
  echo "No R2_* variables in .env. Add all six (see docs/R2-SETUP.md), then run this script again."
  exit 1
fi

# Use npx so we don't need global install (avoids EACCES on npm install -g)
if command -v railway &>/dev/null; then
  RAILWAY_CMD="railway"
else
  RAILWAY_CMD="npx -y @railway/cli"
  echo "Using: $RAILWAY_CMD (no global install required)"
fi
export RAILWAY_CMD

echo ""
echo "1. Logging in to Railway (browser will open if needed)..."
$RAILWAY_CMD login

echo ""
echo "2. Linking to your project (choose: workspace → project → backend service)..."
$RAILWAY_CMD link

echo ""
echo "3. Pushing R2 variables from .env to Railway..."
RAILWAY_CMD="$RAILWAY_CMD" "$REPO_ROOT/scripts/set-railway-r2-vars.sh"

echo ""
echo "All set. Railway will redeploy with R2. Confirm: $RAILWAY_CMD open → Variables"
