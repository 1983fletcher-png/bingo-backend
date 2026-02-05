#!/usr/bin/env bash
# One-command deploy: push backend, build frontend, optionally deploy to Netlify.
# Netlify should build from this repo with base=frontend. See docs/DEPLOY-CONTRACT.md.
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Load .env or env so GITHUB_TOKEN (and optionally Netlify tokens) are set
if [[ -f "$REPO_ROOT/.env" ]]; then
  set -a; source "$REPO_ROOT/.env"; set +a
fi
if [[ -z "$GITHUB_TOKEN" ]] && [[ -f "$REPO_ROOT/env" ]]; then
  set -a; source "$REPO_ROOT/env"; set +a
fi
export GITHUB_TOKEN

echo "▶ Playroom deploy"
echo "  $REPO_ROOT"
echo ""

# 0) Ensure Netlify is set to build from this repo + frontend (if API creds set)
if [[ -n "$NETLIFY_AUTH_TOKEN" ]] && [[ -n "$NETLIFY_SITE_ID" ]]; then
  "$REPO_ROOT/scripts/ensure-netlify-builds-from-backend.sh" || true
  echo ""
fi

# 1) Commit and push
if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
  echo "▶ Committing changes..."
  git add -A
  git commit -m "deploy: $(date +%Y-%m-%d-%H%M)" || true
fi

echo "▶ Pushing to origin main..."
"$REPO_ROOT/scripts/git-push-with-token.sh"

# 2) Build frontend
echo ""
echo "▶ Building frontend..."
cd "$REPO_ROOT/frontend"
npm ci --silent
npm run build

# 3) Netlify: deploy built frontend when DEPLOY_NETLIFY=1 (full UI lives in this repo's frontend/)
echo ""
if [[ -n "$DEPLOY_NETLIFY" ]]; then
  echo "▶ Deploying to Netlify..."
  cd "$REPO_ROOT"
  npx netlify-cli deploy --prod --dir=frontend/dist 2>/dev/null && echo "✅ Frontend deployed." || echo "  (Netlify deploy skipped or failed)"
fi
echo "✅ Done. Backend pushed. Frontend built at frontend/dist."
