# Restore the full Playroom site (theplayroom.netlify.app)

If the live site shows only a basic "Host a game — create a room" page, Netlify is building from **bingo-backend** (minimal frontend). The full, polished UI is in **music-bingo-app**.

## Fix: Point Netlify back at music-bingo-app

1. Go to **https://app.netlify.com** → open the site **theplayroom** (or your Playroom site).
2. **Site configuration** (or **Site settings**) → **Build & deploy** → **Build settings**.
3. **Repository**: click **Link repository** or **Options** → **Edit settings**.
4. Change the linked repo from **bingo-backend** to **music-bingo-app**  
   (GitHub: `1983fletcher-png/music-bingo-app`).
5. **Build command:** leave as-is (e.g. `npm run build` or whatever that repo uses).
6. **Publish directory:** `dist` (or whatever music-bingo-app uses).
7. Save.
8. **Deploys** → **Trigger deploy** → **Deploy site** (or **Clear cache and deploy**).

The full landing page and features will return after the deploy finishes.

**Env vars:** In Netlify, set **VITE_SOCKET_URL** (and optionally **VITE_API_URL**) to your Railway backend URL (e.g. `https://your-app.up.railway.app`, no trailing slash), then trigger a new deploy. The music-bingo-app repo now includes the same **parse fix** (safe JSON handling for API responses), so you get the full UI and no "JSON.parse" errors when the backend is correct.

---

## Why this happened

- **music-bingo-app** = full Playroom (landing, Music Bingo, Trivia, Edutainment, Icebreakers, sleek UI).
- **bingo-backend/frontend/** = minimal reference (Roll Call, basic Host/Play; used for testing and for the one-repo deploy script).

If Netlify was linked to bingo-backend (or the deploy script deployed bingo-backend’s `frontend/dist` to the Playroom site), the live site served the minimal app.

Going forward: keep Netlify linked to **music-bingo-app** for the main site. Use the deploy script only to push the backend and build locally, or unlink the Netlify CLI from the Playroom site when in the bingo-backend folder so the script doesn’t overwrite the live site.
