#!/usr/bin/env bash
# Set Netlify build settings so the Playroom site builds from bingo-backend with base=frontend.
# With NETLIFY_AUTH_TOKEN + NETLIFY_SITE_ID in .env: PATCHes the site via API.
# Without: prints the exact manual steps from DEPLOY-CONTRACT.md.
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Load .env
if [[ -f "$REPO_ROOT/.env" ]]; then
  set -a; source "$REPO_ROOT/.env"; set +a
fi

GITHUB_REPO_URL="${GITHUB_REPO_URL:-https://github.com/1983fletcher-png/bingo-backend}"
BASE_DIR="frontend"
BUILD_CMD="npm ci && npm run build"
PUBLISH_DIR="dist"
BRANCH="main"

if [[ -n "$NETLIFY_AUTH_TOKEN" ]] && [[ -n "$NETLIFY_SITE_ID" ]]; then
  echo "▶ Setting Netlify build settings to this repo + frontend..."
  PAYLOAD=$(cat <<EOF
{
  "build_settings": {
    "repo_url": "$GITHUB_REPO_URL",
    "repo_branch": "$BRANCH",
    "base": "$BASE_DIR",
    "dir": "$PUBLISH_DIR",
    "cmd": "$BUILD_CMD"
  }
}
EOF
)
  HTTP=$(curl -s -w "%{http_code}" -o /tmp/netlify-patch.json \
    -X PATCH "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID" \
    -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")
  if [[ "$HTTP" == "200" ]]; then
    echo "✅ Netlify build settings updated (repo=$GITHUB_REPO_URL, base=$BASE_DIR, publish=$PUBLISH_DIR)."
    echo "   Trigger a deploy in Netlify (Clear cache and deploy site), then hard refresh the live site."
  else
    echo "   Netlify API returned HTTP $HTTP. Response:"
    cat /tmp/netlify-patch.json 2>/dev/null | head -20
    echo ""
    echo "   If repo linking must be done in the UI, do the manual steps below and re-run this script to set base/cmd/dir."
  fi
else
  echo "▶ Netlify API credentials not set. Do one of the following:"
  echo ""
  echo "  A) Set in .env and re-run this script:"
  echo "     NETLIFY_AUTH_TOKEN=your_token_from_netlify_user_settings"
  echo "     NETLIFY_SITE_ID=your_site_api_id"
  echo ""
  echo "  B) Fix manually in Netlify (Site configuration → Build & deploy → Build settings):"
  echo "     Repository:    bingo-backend ($GITHUB_REPO_URL)"
  echo "     Base directory: $BASE_DIR"
  echo "     Build command:  $BUILD_CMD"
  echo "     Publish directory: $PUBLISH_DIR"
  echo "     Branch:         $BRANCH"
  echo ""
  echo "  Then: Deploys → Trigger deploy → Clear cache and deploy site. Hard refresh the live site."
  echo ""
  echo "  Full steps: docs/DEPLOY-CONTRACT.md"
fi
