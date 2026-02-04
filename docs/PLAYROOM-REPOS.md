# Playroom: One Repo, One Push

**Full checklist:** See **docs/DEPLOY-SETUP.md** for step-by-step Netlify link, env vars, and why the latest deploy might not include your push.

## Recommended: Single repo (no sync, no extra steps)

**This repo (bingo-backend)** is the single source of truth:

| What        | Where in repo | Deploys to |
|------------|----------------|------------|
| **Backend**  | root (`index.js`) | **Railway** → your `*.up.railway.app` URL |
| **Frontend** | `frontend/`       | **Netlify** → https://theplayroom.netlify.app |

- **One push** to `main` → Railway redeploys the backend, Netlify rebuilds and deploys the frontend.
- No second repo. No sync script. No duplicate commits.

---

## One-time Netlify switch

Point The Playroom site on Netlify at **this repo** instead of music-bingo-app:

1. **Netlify** → your site (The Playroom) → **Site configuration** → **Build & deploy** → **Build settings**.
2. **Link repository**: click **Options** → **Edit settings** → **Repository** → change to **bingo-backend** (GitHub: `1983fletcher-png/bingo-backend`).
3. **Build settings** (Netlify will read these from `netlify.toml` in the repo; confirm or set):
   - **Base directory:** `frontend`
   - **Build command:** `npm ci && npm run build`
   - **Publish directory:** `frontend/dist` (or `dist` with base directory `frontend`)
4. **Environment variables:** keep `VITE_SOCKET_URL` = your Railway backend URL (no trailing slash).
5. **Trigger deploy** (e.g. **Deploys** → **Trigger deploy** → **Deploy site**).

After that, every `git push origin main` from this repo updates both backend (Railway) and frontend (Netlify).

---

## Optional: Keep music-bingo-app

You can leave the **music-bingo-app** repo as-is (e.g. for a different site or archive). Once Netlify is connected to **bingo-backend** and building from `frontend/`, the live Playroom no longer depends on music-bingo-app. No need to rename or delete it unless you want to.
