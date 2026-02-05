# Playroom live site — one setup only (no more switching)

Use **one** Netlify setup for the Playroom. Do not switch between music-bingo-app and bingo-backend. Follow this once and leave it.

---

## 1. Netlify build settings (do once)

| Setting | Value |
|--------|--------|
| **Repository** | **bingo-backend** (`1983fletcher-png/bingo-backend`) |
| **Base directory** | `frontend` |
| **Build command** | `npm ci && npm run build` |
| **Publish directory** | `dist` |
| **Branch** | `main` |

The repo **bingo-backend** contains both the backend (root) and the frontend (`frontend/`). Netlify builds only the frontend. **Do not** point the Playroom site at **music-bingo-app** — that repo does not have the four-card home, full Host flow, or calendar from this codebase.

---

## 2. Netlify environment variables (required)

In **Site configuration** → **Environment variables**:

| Key | Value |
|-----|--------|
| **VITE_SOCKET_URL** | Your Railway backend URL, e.g. `https://bingo-backend-production-0ea0.up.railway.app` (no trailing slash) |
| **VITE_API_URL** | Same as above (optional but recommended) |

These are **baked in at build time**. If you add or change them, you **must** trigger a new deploy (Deploys → **Trigger deploy** → **Clear cache and deploy site**).

---

## 3. How to verify the live site

1. Open your Playroom URL (Netlify site) in a **private/incognito** window and hard refresh (Cmd+Shift+R).
2. Click **Host a room**.
3. Check the top of the Host page:
   - **"● Backend URL set in build"** and **"● Connected to server"** → backend is configured and connected. Click **Create Music Bingo**; you should get the full host UI (tabs, waiting room, call sheet).
   - **"⚠ Backend URL not set in this build"** or stuck on **"Connecting to server…"** → the last deploy did not have `VITE_SOCKET_URL`. Set it in Netlify (step 2), then **Clear cache and deploy site** again.

---

## 4. Never switch repos

- **Playroom live site** = Netlify building from **bingo-backend**, base **frontend**. One repo, one source of truth.
- **music-bingo-app** = older/different UI. Do **not** use it for the main Playroom site; you’ll lose the four-card home, full Host flow, and calendar.
- To update the live site: push to **bingo-backend** `main`. Netlify and Railway will both deploy from that.

---

## 5. If Host still goes “basic” after a deploy

1. Confirm **VITE_SOCKET_URL** is set in Netlify (step 2) and has **no trailing slash**.
2. Trigger **Clear cache and deploy site** (not just “Deploy”).
3. Wait for the deploy to finish, then open the site in a **new private window** and hard refresh.
4. On the Host page, look for **"● Backend URL set in build"**. If you see **"⚠ Backend URL not set"**, the build still didn’t get the variable — check variable scope (Production) and spelling (`VITE_SOCKET_URL`).
5. If backend is set but you still see “Connecting…”, check that your Railway service is up and the URL matches.

---

See **docs/DEPLOY-CONTRACT.md** and **docs/FRONTEND-BACKEND-LINKING.md** for more detail.
