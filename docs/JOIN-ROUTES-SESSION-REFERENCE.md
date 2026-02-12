# Join / Display Routes, Session Store & Key Components

Quick reference for ThemeLab, BackgroundScene, GameShell, join/session routing, and the session store.

---

## 1. ThemeLab (page)

| What | Path |
|------|------|
| **Page component** | `frontend/src/pages/theme-lab/ThemeLabPage.tsx` |
| **Route** | `/theme-lab` → `ThemeLabPage` (in `App.tsx`) |

- Dev-only: preview theme, scene, motion, sample chrome (MarqueeHeader, StageFrame, Tile, AnswerPlate).
- Uses `GameShell` and `BackgroundScene` in constrained boxes; has a "Click debug (outline + console)" toggle.

---

## 2. BackgroundScene (component + CSS)

| What | Path |
|------|------|
| **Component** | `frontend/src/theme/scenes/BackgroundScene.tsx` |
| **CSS** | `frontend/src/theme/scenes/BackgroundScene.css` |

- Renders a full-bleed scene layer: `pr-scene`, `pr-scene-{sceneId}` (e.g. `arcadeCarpet`, `studio`, `mountains`).
- Scene variants: ArcadeCarpet, Studio, Mountains (noise + vignette).
- **Pointer-events:** `.pr-scene` and all scene layers use `pointer-events: none` (also enforced in `theme/theme.css` globally) so they never block clicks.

---

## 3. GameShell (component + CSS)

| What | Path |
|------|------|
| **Component** | `frontend/src/games/shared/GameShell.tsx` |
| **CSS** | `frontend/src/games/shared/GameShell.css` |
| **Chrome** | `frontend/src/games/shared/chrome/` (MarqueeHeader, StageFrame, StatusBar, etc.) |

- Wraps Display / Player / Host views: background scene, header, stage (main slot), optional sidebar, optional status bar.
- Uses `BackgroundScene` with class `pr-gameshell__scene` (also `pointer-events: none`).
- **Session theme:** `frontend/src/games/shared/sessionTheme.ts` — `GameKey`, default scene per game, `getSessionThemeSettings()`.

---

## 4. Join / Session routing and state store

| What | Where |
|------|--------|
| **Routes** | `frontend/src/App.tsx` |
| **Player (join) page** | `frontend/src/pages/Play.tsx` — used for both `/join/:code` and `/player/:code` |
| **Session store** | In-memory React state in `Play.tsx`: `joinState` (set from `join:ok` and game/feud/cct socket events). No separate Redux/context; single source is socket payloads. |
| **Persisted for rejoin** | `sessionStorage`: key `playroom_join_${CODE}` → `{ name }`. Used to re-emit `player:join` on refresh. |
| **Socket** | `frontend/src/lib/socket.ts` — `getSocket()` (singleton `io(url, { path: '/socket.io', ... })`). |

---

## 5. Routes for join, play, display (and variants)

Defined in **`frontend/src/App.tsx`**:

| Route | Component | Purpose |
|-------|-----------|---------|
| `/join` | `JoinEntry` | Entry: enter code (no code in URL). |
| `/join/:code` | `Play` | Join by code; after submit → `player:join` → `join:ok` → render game view by `gameType`. |
| `/player/:code` | `Play` | Same as `/join/:code` (alternate URL for player). |
| `/display/:code` | `Display` | TV/display for room `code`. |
| `/display/:code/:gameType` | `Display` | Same component; optional `gameType` in URL for consistency. |

- **Query variants:** Host uses `?type=...` or path `/host/:gameType` (see Host.tsx `getTypeFromHostUrl`). Join/Play do not use query for game type; `gameType` comes from `join:ok`.

---

## 6. Session store / socket hookup (gameCode, gameType, state)

- **gameCode:** From URL param `code` in `Play.tsx` (`useParams()`) and stored in `joinState.code` after `join:ok`.
- **gameType:** Comes only from server: `join:ok` payload `JoinState.gameType`. Play branches on `gameType` to pick view (music-bingo, feud, market-match, crowd-control-trivia, trivia, etc.).
- **State:** All in `joinState` in `Play.tsx`:
  - Set once by `join:ok` (code, gameType, started, eventConfig, waitingRoom, songPool, revealed, feud, marketMatch, crowdControl, trivia, …).
  - Updated by socket listeners: `game:started`, `game:waiting-room-updated`, `game:trivia-state`, `game:trivia-reveal`, `feud:state`, `market-match:state`, `cct:state`, etc.
- **Socket:** One `getSocket()` in `lib/socket.ts`. Play.tsx does `const s = getSocket()` and subscribes to `join:ok`, `join:error`, `game:*`, `feud:state`, `market-match:state`, `cct:state` in a `useEffect` keyed by `code`. No dedicated "session store" module; `joinState` is the session for the player.

**Rejoin after refresh:** On load, if `sessionStorage` has `playroom_join_${code}` with a name, Play sets `rejoining` and, when socket connects, emits `player:join` with that name. Second `join:ok` repopulates `joinState` (including `gameType`), so the same game view is shown.
