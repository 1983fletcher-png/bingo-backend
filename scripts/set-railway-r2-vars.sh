#!/usr/bin/env bash
# Push R2_* variables from local .env to Railway (backend service).
# Requires: Railway CLI installed, railway login, railway link to your backend service.
# Run from repo root: ./scripts/set-railway-r2-vars.sh
# Best practice: values stay in .env only; this script never echoes secrets.
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ ! -f "$REPO_ROOT/.env" ]]; then
  echo "No .env found. Add your R2_* variables to .env first (see docs/R2-SETUP.md)."
  exit 1
fi

# Use RAILWAY_CMD from parent script, or railway if in PATH, or npx (no global install)
if [[ -n "$RAILWAY_CMD" ]]; then
  :
elif command -v railway &>/dev/null; then
  RAILWAY_CMD="railway"
else
  RAILWAY_CMD="npx -y @railway/cli"
fi

if ! $RAILWAY_CMD status &>/dev/null; then
  echo "This folder is not linked to a Railway project (or you are not logged in)."
  echo "  Run: $RAILWAY_CMD login"
  echo "  Then: $RAILWAY_CMD link   (choose your backend service)"
  echo "  Then run this script again from the repo root."
  exit 1
fi

# R2_* lines only; strip trailing ' # comment' so we never send comment text as value
set_args=()
count=0
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  # Remove " # anything" from end of line (inline .env comments)
  line="${line%% #*}"
  set_args+=(--set "$line")
  echo "  will set ${line%%=*}"
  ((count++)) || true
done < <(grep -E '^R2_[A-Z_]+=' .env 2>/dev/null || true)

if [[ -z "${set_args[*]}" || $count -eq 0 ]]; then
  echo "No R2_* variables in .env. Add all six (see docs/R2-SETUP.md and docs/RAILWAY-R2-NEXT-STEPS.md)."
  exit 1
fi

echo "Setting $count R2 variable(s) on Railway..."
$RAILWAY_CMD variables "${set_args[@]}" || { echo "Failed to set variables."; exit 1; }

echo "Done. Railway will redeploy. Confirm at: $RAILWAY_CMD open (then Variables)."
