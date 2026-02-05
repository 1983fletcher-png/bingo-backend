# Frontend–Backend linking (tightly governed)

This doc is the **single source of truth** for how the frontend and backend are tied together. Follow it for all UI updates and deployment so connections work correctly.

---

## One backend URL

- The **backend** runs in one place (e.g. **Railway** → `https://your-app.up.railway.app`).
- **Format:** HTTPS in production, **no trailing slash** (e.g. `https://your-app.up.railway.app`).
- That same URL is used for:
  - **Socket.io** (real-time: create/join room, game state).
  - **REST API** (e.g. `/api/learn/cards`, `/api/observances/calendar`, `/api/generate-songs`, `/api/scrape-site`, `/api/public-url`).

---

## What the frontend expects

The frontend is built with **Vite**. It bakes in the backend URL at **build time** via environment variables.

| Variable | Required | Purpose |
|----------|----------|---------|
| **VITE_SOCKET_URL** | Yes (production) | Backend URL for Socket.io **and** for API requests. No trailing slash. |
| **VITE_API_URL** | No | If set, used as fallback for API base when VITE_SOCKET_URL is missing. Same format. |

**Resolution order:** `VITE_SOCKET_URL` → `VITE_API_URL` → in dev: `''` (proxy), in prod: `window.location.origin` (wrong if frontend and backend are different hosts).

- **Development:** Vite proxy in `vite.config.ts` sends `/api` and `/socket.io` to the local backend (e.g. port 3001). Env vars optional.
- **Production:** **VITE_SOCKET_URL must be set** to the Railway (or backend) URL when Netlify builds the frontend. Otherwise the built app will try to talk to the wrong host.

---

## Where each is set

| Who | Where | What to set |
|-----|--------|-------------|
| **Netlify** (builds frontend) | Site configuration → Environment variables | **VITE_SOCKET_URL** = backend URL (e.g. `https://your-app.up.railway.app`). Optionally **VITE_API_URL** = same. No trailing slash. |
| **Railway** (runs backend) | Service → Variables | **PORT** (if needed), **PUBLIC_ORIGIN** (optional; for join URLs). Backend CORS allows the Netlify origin. |

After changing **VITE_SOCKET_URL** (or VITE_API_URL) in Netlify, **trigger a new deploy** so the frontend is rebuilt with the correct URL.

---

## Connection checklist (before going forward)

Use this before considering the UI “correct” or moving on:

1. **Backend URL is one place:** Railway (or your backend host) URL is fixed and known (e.g. `https://your-app.up.railway.app`). No trailing slash.
2. **Netlify env:** `VITE_SOCKET_URL` = that backend URL. Redeploy after changing.
3. **Netlify build source:** Repository = **bingo-backend**, Base directory = **frontend** (so the built UI is from this repo). See **docs/DEPLOY-CONTRACT.md**.
4. **Backend is up:** Railway (or backend) service is running and returns JSON from `/api/*` and serves Socket.io at `/socket.io`.
5. **Live site:** Open the Netlify site → create/join room, calendar, Learn & Grow, etc. All should hit the backend; no “wrong URL” or HTML-instead-of-JSON errors.

---

## Files that implement the link

| Layer | File | Role |
|-------|------|------|
| Frontend – Socket | `frontend/src/lib/socket.ts` | Uses `VITE_SOCKET_URL` (or dev proxy) for `io(url)`. |
| Frontend – API | `frontend/src/pages/Host.tsx`, `Learn.tsx`, `LearnCard.tsx`, `ActivityCalendar.tsx`, `SongFactPopUp.tsx` | Use `VITE_SOCKET_URL` \|\| `VITE_API_URL` as API base. |
| Frontend – safe fetch | `frontend/src/lib/safeFetch.ts` | Error message references VITE_SOCKET_URL / VITE_API_URL when response is not JSON. |
| Backend | `index.js` | CORS open; serves `/api/*` and Socket.io. |
| Deploy | **docs/DEPLOY-CONTRACT.md** | Netlify + Railway setup; references this linking. |

---

## Summary

- **Backend and frontend are tied by one URL:** the backend base URL (e.g. Railway). Same URL for Socket.io and REST.
- **Frontend is linked at build time:** Netlify must have **VITE_SOCKET_URL** set to that URL and must build from **bingo-backend** with base **frontend**.
- **Format:** URL with no trailing slash; HTTPS in production. Keep this format everywhere (env vars, docs, scripts).
