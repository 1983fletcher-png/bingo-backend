# Frontend architecture: keep the UI world-class

## Rule

**music-bingo-app** is the **single source of truth** for the live site’s UI and UX.  
**Music Bingo Backend** is the API and socket server. Its `frontend/` folder is a **minimal reference** for logic and types, not the live UI.

- **Do not** run a full sync from backend `frontend/` into music-bingo-app. That overwrites the app’s design system, GlobalNav, themes, and layout.
- **Do** implement or port new features **inside music-bingo-app**, using its design system (e.g. `design-system.css`, `--accent`, `.card`, etc.).
- **Do** use the backend for: new API routes, socket events, game logic, and data contracts. Then update the app to call them and render with its own UI.

---

## Where things live

**Recommended (one push):** Netlify builds the live site from **this repo** (bingo-backend), `frontend/` directory. See **docs/DEPLOY-SETUP.md** for the exact Netlify link and env vars. One push to `main` updates both backend (Railway) and frontend (Netlify).

**Alternative:** The live site can instead be built from **music-bingo-app** (Netlify linked to that repo). Then design system, nav, and UX live in music-bingo-app; this repo is API/socket only.

| What | Where |
|------|--------|
| **Live site (e.g. theplayroom.netlify.app)** | Built from **bingo-backend** (recommended) or **music-bingo-app** (Netlify). See **DEPLOY-SETUP.md**. |
| **Backend API + Socket.io** | **Music Bingo Backend** (e.g. Railway). |
| **New API/socket behavior** | Implement in backend; document; then use from the app or from this repo’s `frontend/`. |
| **New UI or UX (if using music-bingo-app)** | Implement in **music-bingo-app** using its components and CSS variables. |

---

## Safe ways to update the app from the backend

1. **Selective sync (waiting room + mini-games)**  
   Use **`./scripts/sync-and-push-roll-call.sh`** to copy the waiting-room experience only:
   - `RollCallGame.tsx` — marble maze mini-game
   - `WaitingRoomTiltMaze.tsx` — tilt maze mini-game
   - `StretchyLogoFidget.tsx` — stretchy logo fidget (default Playroom logo, venue/scrape logo, or load your own image)
   - `WaitingRoomView.tsx` — waiting screen that hosts Roll Call, Tilt Maze, or Stretchy
   - `rollCallMaps.ts` — maps/data for Roll Call  
   So **only the waiting room and its mini-games** are synced by script. The rest of the live site (landing, host control room, event/venue scrape, display chrome, advertising) lives in **music-bingo-app** and is the single source of truth for that UI.

2. **Port features by hand**  
   For anything beyond Roll Call (e.g. Print tab, new Host flow, new trivia packs):
   - Implement or adapt the feature **in music-bingo-app**.
   - Use the app’s existing components and classes (e.g. `host__*`, `card`, design-system vars).
   - Reuse backend types/contracts where it helps, but keep all UI and copy in the app.

3. **Landing page and copy**  
   Edit **music-bingo-app** only (e.g. `Home.tsx`, any copy or meta). No sync from backend.

### Changing the landing page

When you want to change what the site says or how the landing looks:

- Open the **music-bingo-app** repo (the one that deploys to theplayroom.netlify.app).
- Edit the landing page component (e.g. `Home.tsx` or equivalent) and any design tokens/CSS it uses.
- Change taglines, CTAs, or sections there; the design system (colors, typography, spacing) lives in that repo.
- Commit and push music-bingo-app; Netlify deploys. The UI stays consistent because you are editing the single source of truth.

---

## What *not* to do

- **Do not** run `sync-full-frontend-and-push.sh` to “deploy” the backend frontend. It replaces the app’s UI with the minimal backend UI and breaks the design.
- **Do not** assume backend `frontend/` and music-bingo-app `src/` are interchangeable. They are not; the app has more structure and styling.

---

## When you add something new

- **Backend (API/socket, logic):** Implement in this repo. Document new endpoints or events (e.g. in this doc or in code comments). Deploy backend as usual.
- **App (UI, copy, flow):** Implement in **music-bingo-app**, using its design system. Commit and push the app; Netlify deploys.  
Result: new behavior with the same high-quality UI unless you intentionally change the design.
