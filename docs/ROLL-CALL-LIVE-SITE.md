# Get the fixed Roll Call onto the live site (theplayroom.netlify.app)

The live site is built from the **music-bingo-app** repo. The **fixed** Roll Call (playable maps, no stuck ball, vibration off) lives in **bingo-backend/frontend/**. To ship it:

## One command (run from Music Bingo Backend)

You need the path to your **music-bingo-app** repo (the folder that has `src/`, `package.json`, and whose `git remote` is music-bingo-app).

```bash
cd "/Users/jasonfletcher/Documents/Cursor AI /Music Bingo Backend"
./scripts/sync-and-push-roll-call.sh "/path/to/music-bingo-app"
```

**Examples:**

- If **music-bingo-app** is a folder next to **Music Bingo Backend**:
  ```bash
  ./scripts/sync-and-push-roll-call.sh "../music-bingo-app"
  ```

- If the **parent** of Music Bingo Backend is the repo you push to as music-bingo-app (e.g. "Cursor AI" with `src/` at the top level):
  ```bash
  ./scripts/sync-and-push-roll-call.sh ".."
  ```

The script will:
1. Copy the four Roll Call files into that repo
2. Commit and push to `origin main`
3. Netlify will then build and deploy the updated Playroom

## What’s in the fix

- **rollCallMaps.ts** — Six playable maps (S-Curve, Music Note, Question Mark, Open Maze, Roundabout, Gentle Slope) with paths wide enough so the ball doesn’t get stuck.
- **RollCallGame.tsx** — Segment-based walls, push-out collision, multiple passes, speed cap, **vibration disabled**.
- **WaitingRoomTiltMaze.tsx** — Rect-based mazes with push-out, themes, music/brain/dna overlays, vibration off.
- **WaitingRoomView.tsx** — Uses the tilt maze for classic/eighties/trivia themes and RollCallGame for others.

After the push, wait for Netlify to finish building; then the waiting room Roll Call will use the new logic and maps.
