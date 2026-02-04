# Playroom: Deploy setup and verification

This doc is the **single checklist** to get the live site connected so one push updates everything and the app works (no parse errors, correct backend URL).

---

## Why your latest deploy didn’t include the recent push

If Netlify’s “latest deploy” (e.g. 5:06 PM) didn’t include the code you just pushed, it usually means:

- **Netlify is still building from a different repo** (e.g. **music-bingo-app**), not from **bingo-backend**. Pushes to bingo-backend then don’t trigger a new Playroom deploy.
- **Fix:** Point the Playroom site on Netlify at **this repo** (bingo-backend) and use the steps below. After that, every push to `main` on bingo-backend will trigger a new Netlify build.

---

## Recommended: One repo (bingo-backend) for everything

| What       | Where              | Deploys to |
|-----------|--------------------|------------|
| Backend   | root `index.js`     | **Railway** → your `*.up.railway.app` URL |
| Frontend  | `frontend/`        | **Netlify** → your Playroom URL |

- **One push** to `main` → Railway redeploys the backend, Netlify rebuilds and deploys the frontend (when Netlify is linked to this repo).

---

## One-time Netlify setup (connect Playroom to this repo)

Do this once so the live site is built from **bingo-backend** and gets every push.

1. **Netlify** → your site (The Playroom) → **Site configuration** → **Build & deploy** → **Build settings**.
2. **Link repository**
   - **Repository:** set to **bingo-backend**  
     - GitHub: `1983fletcher-png/bingo-backend`  
   - If it’s currently **music-bingo-app**, change it to **bingo-backend**.
3. **Build settings** (this repo’s `netlify.toml` supplies these; confirm in the UI):
   - **Base directory:** `frontend`
   - **Build command:** `npm ci && npm run build`
   - **Publish directory:** `dist` (relative to base, so `frontend/dist`)
4. **Environment variables** (Site configuration → Environment variables):
   - **`VITE_SOCKET_URL`** = your Railway backend URL, e.g. `https://your-app.up.railway.app` (no trailing slash).  
     Used for Socket.io and API base.
   - **`VITE_API_URL`** = same URL (optional; frontend falls back to `VITE_SOCKET_URL` if unset).
5. **Save** and trigger a deploy: **Deploys** → **Trigger deploy** → **Deploy site**.
6. After the deploy finishes, do a **hard refresh** on the live site (e.g. Cmd+Shift+R / Ctrl+Shift+R).

---

## Railway (backend)

- Connect Railway to the **same repo** (bingo-backend), root as project root, so each push to `main` redeploys the backend.
- Ensure the deployed backend URL is the one you set in Netlify as `VITE_SOCKET_URL` / `VITE_API_URL`.

---

## Verification checklist

After linking Netlify to bingo-backend and deploying:

| Check | How |
|-------|-----|
| New push triggers deploy | Push a commit to `main`; in Netlify **Deploys** you should see a new build within a minute or two. |
| Env vars in build | Netlify → Site configuration → Environment variables: `VITE_SOCKET_URL` (and optionally `VITE_API_URL`) set to Railway URL. |
| No “parse” error | On the live site, use any feature that calls the API (e.g. generate songs). You should see a clear message if the backend is wrong or down, not a raw JSON parse error. |
| Socket connects | Create/join a room on the live site; the app should connect to the backend (no “Connecting…” stuck). |

---

## Pushing from Cursor

Always use the token so push succeeds:

```bash
cd "/path/to/Music Bingo Backend"
[ -f .env ] && set -a && source .env && set +a
export GITHUB_TOKEN
./scripts/deploy-playroom.sh
```

See **docs/GITHUB-PUSH-AND-SYNC-SETUP.md** for token setup.

---

## If you keep using music-bingo-app for the live site

If you prefer the live site to stay built from **music-bingo-app** (different UI/source):

- Netlify stays linked to **music-bingo-app**.
- Any frontend fix (e.g. safe JSON parse) must be implemented or synced into music-bingo-app and that repo pushed; Netlify will then deploy that.
- This repo (bingo-backend) remains the backend and API; the app repo must call it using the same env vars (`VITE_SOCKET_URL` / `VITE_API_URL`).

For a single place to push and one deploy pipeline, the recommended setup is still: **Netlify builds from bingo-backend**, as above.
