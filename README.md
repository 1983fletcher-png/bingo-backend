# Music Bingo Backend

Node.js + Express + Socket.io backend for the Music Bingo (Playroom) game. Handles room codes, host/player/display connections, song reveals, bingo wins, trivia, and AI song generation.

---

## What you need to do

| Goal | What to do |
|------|------------|
| **Run locally** | `npm install` then `npm start` (server on port 3001). |
| **Deploy** | Push this repo, then either: **Railway** — `railway login`, `railway init`, `railway up`; or **Render** — connect repo, build `npm install`, start `npm start`. |
| **Connect frontend** | Netlify builds the **music-bingo-app** repo. To sync this repo’s frontend (Roll Call, Host, Play, Print, trivia) to the live app: `./scripts/sync-full-frontend-and-push.sh` or `./scripts/sync-and-push-roll-call.sh /path/to/music-bingo-app`. See **docs/ROLL-CALL-LIVE-SITE.md**. |
| **Push from Cursor / CI** | Plain `git push` fails with *could not read Username for 'https://github.com': Device not configured*. Set **GITHUB_TOKEN** in `.env` and use **`./scripts/git-push-with-token.sh`** or **`./scripts/deploy-playroom.sh`** so push uses the token. See **docs/GITHUB-PUSH-AND-SYNC-SETUP.md**. |
| **Pre-push checks** | **docs/PRE-PUSH-TEST-REPORT.md** — build, lint, scrape API, `npm run smoke:observances` (observances lib). |
| **Menu & theming (backend)** | Phases A–C complete. Observances API, menu parse, permission flag. **docs/PHASE-A-B-AUDIT.md**, **docs/PHASE-C-THEMING-AND-CALENDAR.md**, **docs/MENU-AND-THEMING-VISION.md**. |
| **AI song generation** | Frontend sends `POST /api/generate-songs` with body `{ prompt, apiKey }` or you set `OPENAI_API_KEY` on the backend. |

---

## One-command deploy (push + build + deploy frontend)

Paste in terminal (run from anywhere):

```bash
cd "/Users/jasonfletcher/Documents/Cursor AI /Music Bingo Backend" && ./scripts/deploy-playroom.sh
```

Commits any uncommitted changes, pushes to `main`, builds the frontend, and deploys to Netlify. First time: run `npx netlify-cli login` and `npx netlify-cli link` in that folder so the script can deploy.

---

## Run locally

```bash
npm install
npm start
```

Server runs on `http://localhost:3001`. The frontend (Vite) should proxy `/socket.io` and `/api` to this port when developing.

## Deploy backend (Railway or Render)

Your frontend is on **Netlify**. Deploy this backend to **Railway** or **Render** so Host and Join work in production.

### Railway (no GitHub — deploy from your computer)

You don’t need to choose “Database”, “Template”, or “Docker” in the Railway UI. You can do everything from your computer with the CLI. Railway will ask you to **sign in** (Google, GitHub, or email) when you run `railway login`; that’s how your project gets saved.

**1. Open Terminal** and go to this backend folder:

```bash
cd "/Users/jasonfletcher/Documents/Cursor AI /Music Bingo Backend"
```

**2. Install the Railway CLI** (one-time):

```bash
npm install -g @railway/cli
```

**3. Log in** (a browser window will open; sign in there so the CLI is tied to your account):

```bash
railway login
```

**4. Create a new project** and link this folder to it:

```bash
railway init
```

- When it asks for a **name**, type something like `music-bingo-backend` and press Enter.
- If it asks for a team, pick your account.

**5. Deploy this folder:**

```bash
railway up
```

Wait until the build and deploy finish.

**6. Get your backend URL:**

- Go to [railway.app](https://railway.app) and open your project (e.g. `music-bingo-backend`).
- Click the **service** (the box for your app).
- Go to **Settings** → **Networking** → **Generate Domain** (or **Public Networking**). Copy the URL (e.g. `https://music-bingo-backend-production-xxxx.up.railway.app`).
- Use that URL in Netlify as `VITE_SOCKET_URL` (see “Connect Netlify frontend” below).

### Render

1. Push this folder to a Git repo.
2. In [Render](https://render.com): **New** → **Web Service**, connect the repo.
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. **Instance type:** Free (or paid). Render sets `PORT` for you.
6. Deploy. You’ll get a URL like `https://your-app.onrender.com`.

## Connect Netlify frontend to the backend

After the backend is deployed, your Netlify site must connect to it:

1. In **Netlify** → your site → **Site settings** → **Environment variables**.
2. Add:
   - **Key:** `VITE_SOCKET_URL`
   - **Value:** your backend URL, e.g. `https://your-app.up.railway.app` or `https://your-app.onrender.com` (no trailing slash).
3. **Redeploy** the site so the new env var is baked into the build.

The frontend uses `VITE_SOCKET_URL` in production to connect to this backend. Without it, “Host” will stay on “Connect” because the app would try to connect to Netlify (which has no Socket.io server).

## Endpoints

- `GET /health` — Health check (e.g. for Railway/Render).
- `GET /api/public-url` — Returns `PUBLIC_ORIGIN` if set.
- `GET /api/scrape-site?url=...` — Scrapes a URL for logo/theme (optional). The CLI `npm run scrape:site <url>` uses Puppeteer; run `npm install puppeteer` once locally (Puppeteer is not installed on Railway).
- **`POST /api/generate-songs`** — AI Music Bingo song list (75 songs, theme-aware). Body: `{ prompt?, familyFriendly?, count?, apiKey? }`. API key can also be sent as header `x-openai-api-key` or set as env `OPENAI_API_KEY`. Returns `{ songs: [{ artist, title }], raw }`.
- **Menu & theming (Phases A–C):** `GET /api/parse-menu-from-url?url=...`, `POST /api/parse-menu-from-file` (body: `{ file, mimeType }` — accepts **PDF, plain text, HTML, CSV**; image OCR roadmap). Observances: `GET /api/observances/upcoming`, `GET /api/observances/calendar`. See **docs/PHASE-C-THEMING-AND-CALENDAR.md**, **docs/ACCEPT-ANYTHING-VISION.md**.

Socket.io path: `/socket.io`. Events include `host:create`, `player:join`, `host:reveal`, `host:start`, trivia events, etc., matching the existing Playroom frontend.

### Waiting room (Roll Call)

When the main event has not started (`started === false`), the frontend can show a **waiting room** with an optional mini-game (e.g. Roll Call marble tilt).

- **Game state:** Each game has `waitingRoom: { game: 'roll-call' | null, theme: string, hostMessage: string }`. Defaults: `game: null`, `theme: 'default'`, `hostMessage: 'Starting soon'`.
- **Host:** Emit `host:set-waiting-room` with `{ code, game?, theme?, hostMessage? }` to enable/change the waiting room. Listen for `game:waiting-room-updated` with `{ waitingRoom }`.
- **Player join:** `join:ok` includes `started`, `waitingRoom`, and `rollCallLeaderboard`. If `!started && waitingRoom.game === 'roll-call'`, show the Roll Call game.
- **Start event:** Host emits `host:start`; server sets `started = true` and broadcasts `game:started`. Clients should leave the waiting room and show the main session.
- **Roll Call leaderboard:** Player emits `player:roll-call-score` with `{ code, timeMs }` when they finish a run. Server keeps best time per player and broadcasts `game:roll-call-leaderboard` with `{ leaderboard: [{ playerId, displayName, bestTimeMs }] }` (sorted by time ascending). `join:ok` and `display:ok` include `rollCallLeaderboard`.
