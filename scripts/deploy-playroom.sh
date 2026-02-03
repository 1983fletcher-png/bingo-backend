#!/usr/bin/env bash
# One-command deploy: push backend, build frontend, deploy to Netlify.
# Run from anywhere. Re-run anytime to ship updates.
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "▶ Playroom deploy"
echo "  $REPO_ROOT"
echo ""

# 1) Commit and push
if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
  echo "▶ Committing changes..."
  git add -A
  git commit -m "deploy: $(date +%Y-%m-%d-%H%M)" || true
fi

echo "▶ Pushing to origin main..."
git push origin main

# 2) Build frontend
echo ""
echo "▶ Building frontend..."
cd "$REPO_ROOT/frontend"
npm ci --silent
npm run build

# 3) Deploy to Netlify
echo ""
echo "▶ Deploying to Netlify..."
cd "$REPO_ROOT"
if npx netlify-cli deploy --prod --dir=frontend/dist 2>/dev/null; then
  echo ""
  echo "✅ Done. Backend pushed. Frontend deployed."
else
  echo ""
  echo "⚠ Netlify CLI deploy skipped. To enable:"
  echo "   npx netlify-cli login"
  echo "   npx netlify-cli link   # in this repo, pick your Playroom site"
  echo "  Then re-run this script. Or link repo bingo-backend in Netlify UI for auto-deploy on push."
  echo "✅ Backend pushed. Frontend built at frontend/dist."
fi
