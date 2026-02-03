#!/usr/bin/env bash
# One-command deploy: push backend, build frontend, deploy to Netlify.
# Run from anywhere. Re-run anytime to ship updates.
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Load .env or env so GITHUB_TOKEN is set (paste your token in one of those files once)
if [[ -f "$REPO_ROOT/.env" ]]; then
  set -a; source "$REPO_ROOT/.env"; set +a
elif [[ -f "$REPO_ROOT/env" ]]; then
  set -a; source "$REPO_ROOT/env"; set +a
fi
export GITHUB_TOKEN

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
"$REPO_ROOT/scripts/git-push-with-token.sh"

# 2) Build frontend
echo ""
echo "▶ Building frontend..."
cd "$REPO_ROOT/frontend"
npm ci --silent
npm run build

# 3) Netlify deploy skipped by default — full Playroom UI lives in music-bingo-app; this repo's frontend is minimal.
#    To deploy this frontend anyway: DEPLOY_NETLIFY=1 ./scripts/deploy-playroom.sh
echo ""
if [[ -n "$DEPLOY_NETLIFY" ]]; then
  echo "▶ Deploying to Netlify..."
  cd "$REPO_ROOT"
  npx netlify-cli deploy --prod --dir=frontend/dist 2>/dev/null && echo "✅ Frontend deployed." || echo "  (Netlify deploy skipped or failed)"
fi
echo "✅ Done. Backend pushed. Frontend built at frontend/dist."
