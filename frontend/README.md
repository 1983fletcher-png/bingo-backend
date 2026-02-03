# The Playroom — Frontend

React + Vite frontend for the Playroom (Music Bingo / Trivia). Includes the **waiting room** with **Roll Call** (marble tilt game).

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The dev server proxies `/socket.io` and `/api` to the backend (default `http://localhost:3001`). Run the backend in another terminal from the repo root: `npm start`.

## Build for production

```bash
npm run build
```

Output is in `dist/`. Set `VITE_SOCKET_URL` to your backend URL (e.g. Railway) before building, or at build time in Netlify.

## Deploy to Netlify

- **Build command:** `cd frontend && npm ci && npm run build`
- **Publish directory:** `frontend/dist`
- **Environment variable:** `VITE_SOCKET_URL` = your backend URL (no trailing slash)

## Waiting room & Roll Call

- When the host has not started the game, players see the waiting room: event title, host message, and **Roll Call** (tilt or arrow keys to roll the marble to the goal).
- Maps are designed with wide paths (≥48px) so the ball doesn’t get stuck. Collision uses push-out epsilon and multiple passes.
- On finish, the player’s best time is sent to the backend and the leaderboard updates.
