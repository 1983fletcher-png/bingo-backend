# Routes, Theme, Survey Showdown — Quick Reference

## Routes (App.tsx)

| Path | Component | Notes |
|------|-----------|--------|
| `/theme-lab` | `ThemeLabPage` | Theme/scene/motion preview; uses ThemeProvider |
| `/host` | `Host` | Host lobby; create game then `/host/:gameType` |
| `/host/:gameType` | `Host` | e.g. `/host/feud`, `/host/market-match`, `/host/crowd-control-trivia` |
| `/join/:code` | `Play` | Player view; code = room code (e.g. ABC123) |
| `/player/:code` | `Play` | Same as join (alias) |
| `/display/:code` | `Display` | TV/projector view |
| `/display/:code/:gameType` | `Display` | Optional gameType in URL |

All above routes are defined in `frontend/src/App.tsx`.

---

## Theme

| File | Purpose |
|------|--------|
| `frontend/src/theme/ThemeProvider.tsx` | App root theme state (theme, scene, motion); `useTheme()` / `usePlayroomTheme()`; applies `data-theme`, `data-scene`, `data-motion` on `<html>` |
| `frontend/src/theme/themes.css` | Token definitions: `:root` base + `[data-theme="..."]`, `[data-scene="..."]`, `[data-motion="..."]` (classic, prestige, retro, retro-arcade; studio, mountains, arcadeCarpet; standard, calm, high-energy) |

Wiring: `frontend/src/main.tsx` wraps the app with `<ThemeProvider>` and imports `./theme/themes.css` (and `./theme/theme.css`).

---

## Survey Showdown (Feud) — Components

| Role | Component file | Wraps / re-exports |
|------|----------------|--------------------|
| Host | `frontend/src/games/feud/HostFeud.tsx` | `FeudHostPanel` (used in `Host.tsx` when `game.gameType === 'feud'`) |
| Player | `frontend/src/games/feud/PlayerFeud.tsx` | GameShell + prompt + `FeudPlayerForm` (submit form); can be used from `Play.tsx` |
| Display (TV) | `frontend/src/games/feud/DisplayFeud.tsx` | `FeudDisplay` (used in `Display.tsx` when `gameType === 'feud'`) |

Shared pieces:
- `frontend/src/components/FeudHostPanel.tsx` — host controls (checkpoints, prompt, lock, reveal, strike).
- `frontend/src/components/FeudDisplay.tsx` — TV view (standby, title, collect + live answers, board, summary).
- `frontend/src/components/FeudPlayerForm.tsx` — player submit form (1–3 answers; emits `feud:submit`).

Barrel: `frontend/src/games/feud/index.ts` exports `HostFeud`, `DisplayFeud`, `PlayerFeud`, and `./types`.

---

## Realtime — Socket (no fetch for feud state/submit)

- **Client:** `frontend/src/lib/socket.ts`  
  - `getSocket(): Socket` — single shared socket (io from socket.io-client).  
  - URL: `VITE_SOCKET_URL` or `VITE_API_URL` or `window.location.origin`.

**Survey Showdown events:**

| Direction | Event | Who | Payload / use |
|-----------|--------|-----|----------------|
| Client → server | `player:join` | Player | `{ code, name }` — join room (then receive `join:ok` with `feud` in payload) |
| Client → server | `feud:submit` | Player | `{ code, answers }` — submit 1–3 answers |
| Server → client | `join:ok` | Player | includes `feud: FeudState` |
| Server → client | `feud:state` | Player, Display, Host | full `FeudState` (checkpoint, prompt, submissions, topAnswers, locked, etc.) |
| Client → server | `display:subscribe` | Display | `{ code }` — then receives `display:ok` (includes `feud`) and subsequent `feud:state` |
| Server → client | `display:ok` | Display | includes `feud`, `gameType`, `eventConfig`, etc. |
| Client → server | `feud:set-checkpoint` | Host | `{ code, hostToken, checkpointId }` |
| Client → server | `feud:set-prompt` | Host | `{ code, hostToken, prompt }` |
| Client → server | `feud:lock` | Host | `{ code, hostToken }` |
| Client → server | `feud:reveal` | Host | `{ code, hostToken, index }` |
| Client → server | `feud:strike` | Host | `{ code, hostToken, index }` |
| Client → server | `feud:set-show-scores` | Host | `{ code, hostToken, showScores }` |
| Client → server | `feud:set-effects` | Host | `{ code, hostToken, cascadeEffect?, bottomDropEffect? }` |

There are **no** REST/fetch endpoints for feud submit or state; all realtime is over the socket.

---

## Feud state type

- **Authoritative (task) types:** `frontend/src/games/feud/types.ts` — `FeudPhase`, `FeudSubmission`, `FeudCluster`, `FeudSettings`, `FeudSessionState`.
- **Runtime (socket) type:** `frontend/src/types/feud.ts` — `FeudState`, `FeudCheckpointId`, `FEUD_CHECKPOINTS`, `feudCheckpointToPhase`, etc. Used by Host/Display/Play and server.
