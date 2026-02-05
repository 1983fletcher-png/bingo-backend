# Deploy contract: one repo, Netlify + Railway

This is the **single source of truth** for where things deploy. When the live site shows the wrong UI or you need to “switch back,” follow this.

---

## The contract

| What        | Where in repo   | Deploys to        | Notes |
|------------|-----------------|-------------------|--------|
| **Backend**  | root `index.js` | **Railway**       | Connect Railway to this repo; root = project root. |
| **Frontend** | `frontend/`     | **Netlify**       | Netlify must build from **this repo** with base directory **frontend**. |

- **One repo:** **bingo-backend** (this repo). The Playroom UI (four-card home, calendar, Learn & Grow, Join/Create, etc.) lives in **frontend/**.
- **Netlify must not** build from **music-bingo-app** for the Playroom live site. If it does, the new UI will never appear.

---

## Netlify build settings (required)

When Netlify builds from this repo, these must be set (they are in **netlify.toml**; the UI can override, so confirm):

| Setting            | Value |
|--------------------|--------|
| **Repository**     | **bingo-backend** (`1983fletcher-png/bingo-backend`) |
| **Base directory** | `frontend` |
| **Build command**  | `npm ci && npm run build` |
| **Publish directory** | `dist` |
| **Branch**         | `main` |

---

## Fixing Netlify when the wrong UI appears

### Option A: Script (recommended when you have API tokens)

1. In **.env** set:
   - **NETLIFY_AUTH_TOKEN** — from Netlify → User settings → Applications → Personal access tokens.
   - **NETLIFY_SITE_ID** — from Netlify → Site → Site configuration → Site information → API ID (or from the site URL).
2. Run from repo root:
   ```bash
   source .env 2>/dev/null; ./scripts/ensure-netlify-builds-from-backend.sh
   ```
3. In Netlify: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**.
4. Hard refresh the live site (Cmd+Shift+R / Ctrl+Shift+R).

### Option B: Manual in Netlify UI

1. Netlify → your Playroom site → **Site configuration** → **Build & deploy** → **Build settings**.
2. **Link repository** or **Options** → **Edit settings**.
3. Set **Repository** to **bingo-backend** (`1983fletcher-png/bingo-backend`).
4. Set **Base directory** to `frontend`.
5. Set **Build command** to `npm ci && npm run build`.
6. Set **Publish directory** to `dist`.
7. Set **Branch** to `main`.
8. Save, then **Deploys** → **Trigger deploy** → **Clear cache and deploy site**.

---

## Environment variables

- **Netlify** (Site configuration → Environment variables):  
  **VITE_SOCKET_URL** = your Railway backend URL (e.g. `https://your-app.up.railway.app`, no trailing slash). Optionally **VITE_API_URL** = same.
- **Railway:** Set any backend env vars (e.g. `PORT`, `PUBLIC_ORIGIN`) as needed.

---

## Scripts reference

| Script | Purpose |
|--------|--------|
| **scripts/ensure-netlify-builds-from-backend.sh** | Set Netlify build settings to this repo + frontend (via API if tokens set; otherwise print manual steps). |
| **scripts/deploy-playroom.sh** | Commit if needed, push to GitHub (with token), build frontend, optionally deploy to Netlify (`DEPLOY_NETLIFY=1`). |
| **scripts/git-push-with-token.sh** | Push this repo to `origin main` using `GITHUB_TOKEN` from `.env`. |

---

## When to run what

- **Frontend or backend change in this repo:** Push (use token). Railway and Netlify will redeploy if they’re connected to this repo.
- **Live site still shows old UI:** Run **ensure-netlify-builds-from-backend.sh** (or do the manual steps above), then trigger a deploy and hard refresh.
- **First-time or re-link:** Connect Netlify to **bingo-backend** in the UI once; then the ensure script can keep build settings correct.
