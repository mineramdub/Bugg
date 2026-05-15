#!/usr/bin/env bash
# setup-and-push.sh
# Run this ONCE from your Mac terminal (in this folder) to:
#   1. Re-init git (the sandbox left a locked .git)
#   2. Commit everything
#   3. Create a fresh GitHub repo and push
#   4. Deploy to Vercel
#
# Usage:
#   chmod +x setup-and-push.sh
#   ./setup-and-push.sh                         # default repo name 'bugg', public, prod deploy
#   ./setup-and-push.sh my-repo-name --private  # custom name, private repo
#
# Prerequisites:
#   • gh CLI authenticated:      brew install gh && gh auth login
#   • vercel CLI authenticated:  npm i -g vercel && vercel login
#
# If a step fails or a CLI is missing, the script prints a manual fallback.

set -euo pipefail

REPO_NAME="${1:-bugg}"
VISIBILITY="${2:---public}"
cd "$(dirname "$0")"
echo "→ Working in: $(pwd)"

# ── 1. Reset .git the sandbox left in a half-broken state ─────────────────
if [ -d .git ]; then
  echo "→ Removing existing .git"
  chmod -R u+w .git 2>/dev/null || true
  rm -rf .git
fi

# ── 2. Fresh init + commit ─────────────────────────────────────────────────
echo "→ git init + commit"
git init -q -b main
git add .
git -c user.name="Rafifi" -c user.email="raphaelledubrulle03@gmail.com" \
    commit -q -m "Initial commit: Bugg frontend + Supabase backend

- Frontend: original React-in-the-browser UI (3 visual directions, challenge & result screens)
- Backend: Supabase project 'bugg' (eu-west-3, id: cyfzahgqjphvzltxhgbk)
  - Schema: devices (anon device-id auth), bugs (catalogue), submissions (history)
  - Seed: 5 progressive C bugs (loop overflow, =/==, dangling pointer, leak, div-by-zero)
  - Edge Function 'api' with 3 routes: /bug-of-the-day, /submit, /stats
  - Server-side regex validation; XP & streak persisted in DB
- bugg-api.js: drop-in client with anonymous device-id auth (localStorage UUID)
- vercel.json: serve frontend/ as the site root"
git log --oneline | head -3
echo

# ── 3. GitHub repo + push ──────────────────────────────────────────────────
if command -v gh >/dev/null 2>&1; then
  echo "→ Creating GitHub repo '$REPO_NAME' ($VISIBILITY) and pushing"
  gh repo create "$REPO_NAME" "$VISIBILITY" \
    --source=. --push \
    --description "Le bug C du jour — daily C debugging challenge (frontend + Supabase backend)"
  REPO_URL="$(gh repo view "$REPO_NAME" --json url -q .url)"
  echo "✓ GitHub: $REPO_URL"
else
  echo "⚠️  gh CLI not found — skipping GitHub push."
  echo "   Install with: brew install gh && gh auth login"
  echo "   Then: gh repo create $REPO_NAME $VISIBILITY --source=. --push"
fi
echo

# ── 4. Vercel deploy ───────────────────────────────────────────────────────
if command -v vercel >/dev/null 2>&1; then
  echo "→ Deploying to Vercel"
  # First deployment: link + deploy. --yes accepts defaults.
  vercel --yes
  echo
  echo "→ Promoting to production"
  vercel deploy --prod --yes
else
  echo "⚠️  vercel CLI not found — skipping deploy."
  echo "   Install with: npm i -g vercel && vercel login"
  echo "   Then run from this folder: vercel --prod"
fi

echo
echo "✓ All done. The Supabase backend is already live at:"
echo "    https://cyfzahgqjphvzltxhgbk.supabase.co/functions/v1/api"
