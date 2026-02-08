# Railway connection verification

Quick checks to confirm the backend is connected and responding.

## What was verified (run date)

| Check | Result |
|-------|--------|
| **CLI link** | `railway status` (or `npx -y @railway/cli status`) → Project **worthy-beauty**, Environment **production**, Service **bingo-backend** |
| **Domain** | `railway domain` → **https://bingo-backend-production-0ea0.up.railway.app** |
| **Health** | `GET /health` → `{"ok":true}` (HTTP 200) |
| **API** | `GET /api/public-url` → HTTP 200 |

## Re-run these checks

From the repo root:

```bash
# 1. Confirm this folder is linked to Railway
npx -y @railway/cli status

# 2. Get the public URL (if you need to set Netlify VITE_SOCKET_URL)
npx -y @railway/cli domain

# 3. Test the backend (replace with your URL if different)
curl -s https://bingo-backend-production-0ea0.up.railway.app/health
```

## Netlify must use this URL

In **Netlify** → Site configuration → **Environment variables**:

- **VITE_SOCKET_URL** = `https://bingo-backend-production-0ea0.up.railway.app` (no trailing slash)
- **VITE_API_URL** = same (optional)

If you change the Railway URL or create a new domain, update these and trigger **Clear cache and deploy site**.

## If Railway shows “disconnected” or deploy fails

1. **Railway dashboard** → [railway.app](https://railway.app) → open project **worthy-beauty** → service **bingo-backend**.
2. Confirm the repo is connected: **Settings** → **Source** should be **bingo-backend** (or your fork), branch **main**.
3. **Redeploy:** Deploys → **Redeploy** (or push a commit to `main` to trigger a new deploy).
4. **Variables:** Service → **Variables** — ensure **PORT** is set if required (Railway often injects it). Add **PUBLIC_ORIGIN** if you want join URLs to use a specific origin.
5. **Networking:** **Settings** → **Networking** → **Generate Domain** if no domain is shown.

## If the live site still shows “Connecting…” or “Backend URL not set”

- Backend is up but **Netlify** is not using the right URL: set **VITE_SOCKET_URL** in Netlify and **Clear cache and deploy site**.
- Backend is down: check Railway dashboard for failed deploys or sleep/crash; trigger a redeploy.
