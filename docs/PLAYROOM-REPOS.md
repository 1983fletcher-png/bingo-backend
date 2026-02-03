# Playroom: Which Repo Does What

## Canonical setup (recommended)

| Repo | Purpose | Deploys to |
|------|--------|------------|
| **music-bingo-app** (GitHub) | **Frontend only** — The Playroom UI (Host, Join, Roll Call, Bingo, Trivia, etc.) | **Netlify** → https://theplayroom.netlify.app |
| **bingo-backend** (this repo) | **Backend only** — Node + Express + Socket.io (games, waiting room, leaderboard) | **Railway** → your `*.up.railway.app` URL |

- Netlify **build command**: `npm run build` (or `npm ci && npm run build`)  
- Netlify **publish directory**: `dist`  
- Netlify **env**: `VITE_SOCKET_URL` = your Railway backend URL (no trailing slash)

---

## Why two repos?

- **music-bingo-app** = the “original” Playroom frontend. Netlify is connected to this repo; that’s what the live site uses.
- **bingo-backend** = API + game state. The **frontend/** folder inside this repo is a **reference copy** used to develop and test Roll Call, waiting room, and shared logic. It is **not** what Netlify deploys unless you point Netlify at this repo (see below).

---

## Keeping Roll Call and waiting room in sync

When we add or change Roll Call / waiting room code in **bingo-backend/frontend/**, you need those changes in **music-bingo-app** so the live site updates.

### Option A: Sync script (recommended)

From this repo (bingo-backend), run:

```bash
# Clone music-bingo-app next to Music Bingo Backend if you haven’t:
# cd "/Users/jasonfletcher/Documents/Cursor AI"
# git clone https://github.com/1983fletcher-png/music-bingo-app.git

# Sync Roll Call and waiting room files into music-bingo-app:
./scripts/sync-roll-call-to-music-bingo-app.sh "../music-bingo-app"
```

Then in **music-bingo-app**:

```bash
cd "/Users/jasonfletcher/Documents/Cursor AI/music-bingo-app"
git add src/components/RollCallGame.tsx src/components/WaitingRoomTiltMaze.tsx src/components/WaitingRoomView.tsx src/data/rollCallMaps.ts
git status   # review
git commit -m "Roll Call: playable maps, tilt maze, waiting room themes"
git push origin main
```

Netlify will deploy the new commit.

### Option B: One repo for both (alternative)

If you prefer a single repo:

1. In **Netlify**: point the site to **bingo-backend** (this repo).
2. **Build command**: `cd frontend && npm ci && npm run build`
3. **Publish directory**: `frontend/dist`
4. **Base directory**: leave empty (or set to repo root).

Then the live Playroom is built from **frontend/** in this repo and you no longer need to sync to music-bingo-app.

---

## Summary

- **Live Playroom UI** = whatever repo Netlify is connected to (today: **music-bingo-app**).
- **Backend** = **bingo-backend** on Railway.
- To get Roll Call / maze / waiting room updates live: copy the updated files into **music-bingo-app** (sync script or manually) and push that repo.
