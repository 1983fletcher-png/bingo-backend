# Survey Showdown — Full Code Reference

All files, connections, socket events, and data flow for Survey Showdown (Feud).

---

## 1. Routes & entry points

| Route | Page | Purpose |
|-------|------|--------|
| `/host` or `/host?type=feud` | `Host.tsx` | Host creates feud game, sees FeudHostPanel |
| `/host/:code` (after create) | `Host.tsx` | Host controls: prompt, lock, reveal, strike |
| `/display/:code` | `Display.tsx` | TV/projector view: FeudDisplay (checkpoint-driven) |
| `/join/:code` | `Play.tsx` | Player: submit answers or see FeudPlayerReveal |

- **Activity entry:** `ActivityRoomBuildTonight.tsx` links “Survey Showdown (Feud)” → `/host?type=feud`.

---

## 2. Type system & state shape

### Authoritative types: `frontend/src/types/feud.ts`

- **FeudPhase:** `'SET_PROMPT' | 'COLLECTING' | 'LOCKED' | 'REVEALING' | 'SUMMARY'`
- **FeudCheckpointId:** `'STANDBY' | 'R1_TITLE' | 'R1_COLLECT' | 'R1_LOCKED' | 'R1_BOARD_0' … 'R1_BOARD_8' | 'R1_SUMMARY'`
- **FeudBoardItem:** `{ answer, count, points?, revealed, strike? }`
- **FeudState:**
  - `roundIndex`, `checkpointId`, `prompt`
  - `submissions: { playerId, displayName, answers: string[] }[]`
  - `locked`, `topAnswers: FeudBoardItem[]`, `showScores`
  - `cascadeEffect?`, `bottomDropEffect?`
- **DEFAULT_FEUD_STATE:** `checkpointId: 'R1_TITLE'`, `prompt: ''`, `submissions: []`, `locked: false`, `topAnswers: []`
- **feudCheckpointToPhase(checkpointId)** maps checkpoint → phase for UI labels.

### Legacy/alternate types: `frontend/src/games/feud/types.ts`

- FeudSessionState, FeudSubmission, FeudCluster, etc. — not used by the main flow; main flow uses `types/feud.ts`.

---

## 3. Backend (index.js)

### Game creation

- **host:create** with `gameType: 'feud'` → `createGame()` sets `game.feud`:
  - `roundIndex: 1`, `checkpointId: 'R1_TITLE'`, `prompt: ''`, `submissions: []`, `locked: false`, `topAnswers: []`, `showScores: true`, `cascadeEffect: false`, `bottomDropEffect: false`
- Default `eventConfig.playroomThemeId = 'game-show'` when gameType is feud.

### Helpers

- **feudRecomputeTopAnswers(game)** — aggregates submissions into top 8 (lowercase, trim, count), fills `game.feud.topAnswers` (answer, count, points 8→1, revealed: false, strike: false).
- **getFeudStateForEmit(game)** — returns deep clone of `game.feud`; if at board checkpoint and locked with submissions but no topAnswers, calls `feudRecomputeTopAnswers` first.
- **FEUD_CHECKPOINTS** — array of valid checkpoint IDs (same as frontend).

### Socket events (server listens)

| Event | Handler | Effect |
|-------|---------|--------|
| **host:create** `{ gameType: 'feud', … }` | createGame | New game with `game.feud` initial state; emit **game:created** (includes feud) |
| **host:resume** `{ code, hostToken }` | getGame, assert | Emit **host:resume:ok** + **game:created** with feud |
| **display:join** `{ code }` | getGame | Join `game:${code}`, emit **display:ok** with `feud: getFeudStateForEmit(game)` |
| **player:join** (then **join:ok**) | getGame | **join:ok** includes `feud: getFeudStateForEmit(game)` |
| **feud:set-checkpoint** `{ code, hostToken, checkpointId }` | assertHost | `game.feud.checkpointId = checkpointId`, emit **feud:state** |
| **feud:set-prompt** `{ code, hostToken, prompt }` | assertHost | `game.feud.prompt = prompt`, emit **feud:state** |
| **feud:set-effects** `{ code, hostToken, cascadeEffect, bottomDropEffect }` | assertHost | Update effects, emit **feud:state** |
| **feud:set-show-scores** `{ code, hostToken, showScores }` | assertHost | `game.feud.showScores = showScores`, emit **feud:state** |
| **feud:submit** `{ code, answers }` | getGame, player in room | Push `{ playerId, displayName, answers }` to `game.feud.submissions`, emit **feud:state** (ignored if locked) |
| **feud:lock** `{ code, hostToken }` | assertHost | `game.feud.locked = true`, `checkpointId = 'R1_LOCKED'`, compute topAnswers (same logic as feudRecomputeTopAnswers), emit **feud:state** |
| **feud:reveal** `{ code, hostToken, index }` | assertHost | `game.feud.topAnswers[index].revealed = true`, emit **feud:state** |
| **feud:strike** `{ code, hostToken, index }` | assertHost | `game.feud.topAnswers[index].strike = true`, emit **feud:state** |

All **feud:state** emissions go to `io.to(\`game:${game.code}\`)` (host, display, and all players in that game).

---

## 4. Frontend — components

### Display (TV) path

- **Display.tsx**
  - Uses `code` from route; emits **display:join** `{ code }` on mount and on socket connect.
  - Listens: **display:ok** (sets feudState, gameType, etc.), **feud:state** (sets feudState).
  - When `gameType === 'feud'`: renders `<GameShell gameKey="survey_showdown" …><FeudDisplay … /></GameShell>` with `feud={feudState ?? DEFAULT_FEUD_STATE}`.

- **FeudDisplay** (`components/FeudDisplay.tsx`)
  - Props: `feud`, `joinUrl`, `code`, `eventTitle`, `theme`, `calmMode?`
  - Renders by **checkpointId**:
    - **STANDBY** → “Host reviewing — next question starting soon.”
    - **R1_TITLE** → Game name + “Round N”
    - **R1_COLLECT** → Prompt, “Submissions open”, QR, submission/answer counts, optional live answer list
    - **R1_LOCKED** (no topAnswers yet) → “Answers locked” / “Revealing top answers…”
    - **R1_LOCKED** (with topAnswers) / **R1_BOARD_*** / **R1_SUMMARY** → Board view: **SurveyShowdownFrame** (tv) + **SurveyShowdownBoard** (tv) with prompt HUD
  - Uses **SurveyShowdownFrame** and **SurveyShowdownBoard** for the 8-tile board.

- **SurveyShowdownFrame** (`games/feud/SurveyShowdownFrame.tsx`)
  - Props: `variant: 'tv' | 'player'`, `children`
  - Renders frame image from **surveyShowdownConstants** (FRAME_ASSETS), safe-area overlay (TV_SAFE_AREA / PLAYER_SAFE_AREA). Children (e.g. board) go inside safe area.
  - CSS: `SurveyShowdownFrame.css`

- **SurveyShowdownBoard** (`games/feud/SurveyShowdownBoard.tsx`)
  - Props: `feud`, `variant: 'tv' | 'player'`
  - Derives revealed count from `feud.checkpointId` (R1_SUMMARY → 8, R1_BOARD_N → N, R1_LOCKED → 0); normalizes `feud.topAnswers` to 8 items.
  - Renders 8× **SurveyShowdownTile** (rank, text, count, revealed).
  - CSS: `SurveyShowdownBoard.css`

- **SurveyShowdownTile** (`games/feud/SurveyShowdownTile.tsx`)
  - Props: `text`, `count`, `revealed`, `rank`
  - Shows rank badge; when revealed shows answer text and count.
  - CSS: `SurveyShowdownTile.css`

### Host path

- **Host.tsx**
  - Create flow: “Survey Showdown” button sets `createMode === 'feud'`; Create triggers `createGame('feud')` → **host:create** `{ gameType: 'feud', eventConfig: { …, playroomThemeId: 'game-show' }, options? }`.
  - Listens **game:created** (sets game including feud), **feud:state** (updates `game.feud`).
  - When `game.gameType === 'feud'`: renders `<GameShell><FeudHostPanel … /></GameShell>` with `feud={game.feud ?? DEFAULT_FEUD_STATE}`, `onFeudState`, `socket`, `gameCode`, `joinUrl`, `displayUrl`, `onEndSession`.

- **FeudHostPanel** (`components/FeudHostPanel.tsx`)
  - Props: `gameCode`, `feud`, `onFeudState`, `socket`, `joinUrl`, `displayUrl`, `onEndSession`
  - **Emits:**  
    - **feud:set-checkpoint** (e.g. STANDBY, R1_COLLECT, R1_BOARD_N, R1_SUMMARY)  
    - **feud:set-prompt**  
    - **feud:lock**  
    - **feud:reveal** (index)  
    - **feud:strike** (index)  
    - **feud:set-show-scores**  
    - **feud:set-effects** (cascadeEffect, bottomDropEffect)
  - UI: TransportBar (back/next/jump/reset), “Start round / Open submissions” → R1_COLLECT, “Lock submissions” → feud:lock, prompt input + ideas, “Reveal”/“Strike” per top answer, toggles for scores and effects, audio settings, links to Player view and Display.
  - Listens **feud:state** (dev debug only).

### Player path

- **Play.tsx**
  - Join: **player:join** with code/name; listens **join:ok** (sets joinState including `gameType`, `feud`), **feud:state** (updates `joinState.feud`).
  - When `gameType === 'feud'` and (started or feud round active): chooses among:
    - **FeudPlayerReveal** (frame + board) when locked and in reveal/summary phase
    - **PlayerFeud**-style form when can submit (R1_COLLECT / R1_TITLE, not locked)
    - Waiting / “Thanks” states
  - Uses **GameShell** with `gameKey="survey_showdown"`, `feudView`: `'reveal' | 'waiting' | 'answer'`.

- **FeudPlayerForm** (`components/FeudPlayerForm.tsx`)
  - Props: `code`, `socket`
  - Three inputs (answer 1–3), Submit → **feud:submit** `{ code, answers }` (up to 3 non-empty strings). Shows “Thanks! Your answers are in.” after submit.

- **PlayerFeud** (`games/feud/PlayerFeud.tsx`)
  - Props: `code`, `socket`, `feud`, `themeId?`
  - Wraps **GameShell** + prompt text + either “Answers locked…” or **FeudPlayerForm** or “Wait for the host…”.

- **FeudPlayerReveal** (`games/feud/FeudPlayerReveal.tsx`)
  - Props: `feud`
  - Renders prompt + **SurveyShowdownFrame** (player) + **SurveyShowdownBoard** (player). CSS: `feud-player-reveal.css`.

---

## 5. Constants & assets

- **surveyShowdownConstants.ts**
  - **TV_SAFE_AREA** / **PLAYER_SAFE_AREA** (x, y, w, h 0..1)
  - **FRAME_ASSETS**: `tv: '/themes/survey-showdown/survey-showdown-tv-frame.png'`, `player: '/themes/survey-showdown/survey-showdown-player-frame.png'`
  - **isSurveyShowdownDebug()** — `?debug=1` or `localStorage playroom_debug=1` for debug outlines.

- **Theme assets (expected in build):**
  - `public/themes/survey-showdown/survey-showdown-tv-frame.png`
  - `public/themes/survey-showdown/survey-showdown-player-frame.png`  
  (Directory may also contain player-answer.png, player-reveal.png, etc.; frame components use the two names above.)

- **themes.css** — Survey Showdown game-show theme references same frame paths for backgrounds where used.

---

## 6. State helpers

- **feudState.ts** (`games/feud/feudState.ts`)
  - **applyFeudState(current, payload)** — returns payload (replace).
  - **hasSubmissions(state)**, **isSlotRevealed(state, index)**.

---

## 7. GameShell / theme

- **GameShell** (`components/GameShell.tsx`, `games/shared/GameShell.tsx`) — used with `gameKey="survey_showdown"` for host, display, and player to apply theme (e.g. game-show).
- **sessionTheme.ts** — `survey_showdown` → arcadeCarpet (or theme mapping).
- **Display** uses `displayPlayroomThemeId` from eventConfig (e.g. game-show) for FeudDisplay theme.

---

## 8. Socket event summary (client ↔ server)

| Client → Server | Server → Room (game:code) |
|-----------------|---------------------------|
| **host:create** `{ gameType: 'feud', eventConfig, options? }` | **game:created** (includes feud) |
| **host:resume** `{ code, hostToken }` | **host:resume:ok** + **game:created** (includes feud) |
| **display:join** `{ code }` | **display:ok** (includes feud) |
| **player:join** `{ code, name }` | **join:ok** (includes gameType, feud) |
| **feud:set-checkpoint** `{ code, hostToken, checkpointId }` | **feud:state** |
| **feud:set-prompt** `{ code, hostToken, prompt }` | **feud:state** |
| **feud:lock** `{ code, hostToken }` | **feud:state** |
| **feud:reveal** `{ code, hostToken, index }` | **feud:state** |
| **feud:strike** `{ code, hostToken, index }` | **feud:state** |
| **feud:set-show-scores** `{ code, hostToken, showScores }` | **feud:state** |
| **feud:set-effects** `{ code, hostToken, cascadeEffect, bottomDropEffect }` | **feud:state** |
| **feud:submit** `{ code, answers }` (player) | **feud:state** |

Everyone in the same game room (host, display, players) receives **feud:state** and **display:ok** / **join:ok** with the same feud snapshot.

---

## 9. File list (Survey Showdown–related)

**Frontend**

- `frontend/src/types/feud.ts` — FeudState, checkpoints, phases, DEFAULT_FEUD_STATE
- `frontend/src/games/feud/surveyShowdownConstants.ts` — safe areas, frame asset paths, debug
- `frontend/src/games/feud/SurveyShowdownFrame.tsx` + `.css`
- `frontend/src/games/feud/SurveyShowdownBoard.tsx` + `.css`
- `frontend/src/games/feud/SurveyShowdownTile.tsx` + `.css`
- `frontend/src/games/feud/FeudPlayerReveal.tsx` + `feud-player-reveal.css`
- `frontend/src/games/feud/PlayerFeud.tsx`
- `frontend/src/games/feud/feudState.ts`
- `frontend/src/games/feud/types.ts` (legacy/alternate)
- `frontend/src/games/feud/index.ts` — re-exports HostFeud, DisplayFeud, PlayerFeud
- `frontend/src/games/feud/HostFeud.tsx` — re-export FeudHostPanel
- `frontend/src/games/feud/DisplayFeud.tsx` — re-export FeudDisplay
- `frontend/src/components/FeudDisplay.tsx`
- `frontend/src/components/FeudHostPanel.tsx`
- `frontend/src/components/FeudPlayerForm.tsx`
- `frontend/src/components/GameShell.tsx` (gameKey survey_showdown)
- `frontend/src/games/shared/GameShell.tsx`
- `frontend/src/styles/feud-display.css`
- `frontend/src/pages/Host.tsx` — create feud, feud:state, FeudHostPanel
- `frontend/src/pages/Display.tsx` — display:join, feud:state, FeudDisplay
- `frontend/src/pages/Play.tsx` — join:ok, feud:state, PlayerFeud / FeudPlayerReveal / FeudPlayerForm
- `frontend/src/pages/ActivityRoomBuildTonight.tsx` — link to /host?type=feud
- `frontend/src/theme/themes.css` — survey-showdown frame refs
- `frontend/public/themes/survey-showdown/` — frame PNGs (see constants for exact names)

**Backend**

- `index.js` — createGame feud, display:join, join:ok, game:created, host:resume, feud:* handlers, getFeudStateForEmit, feudRecomputeTopAnswers

**Print / extras**

- `frontend/src/pages/ActivityRoomPrintables.tsx` — feud prompt card
- `frontend/src/lib/printMaterials.ts` — buildFeudPromptCardDocument

---

## 10. Checkpoint flow (quick reference)

1. **STANDBY** — Host reviewing.
2. **R1_TITLE** — Round title only.
3. **R1_COLLECT** — Submissions open; display shows prompt + QR + counts; players submit via **feud:submit**.
4. **R1_LOCKED** — Host clicked Lock; server computes topAnswers, emits **feud:state**; display can show “Revealing…” or board with 0 revealed.
5. **R1_BOARD_0 … R1_BOARD_8** — Host reveals/strikes; each **feud:reveal** / **feud:strike** updates topAnswers and emits **feud:state**. Board uses `topAnswers[i].revealed` (and strike) for display.
6. **R1_SUMMARY** — All 8 revealed (or host jumps to summary); display shows full board.

Host can jump checkpoints via TransportBar or **feud:set-checkpoint**; server only validates checkpointId is in FEUD_CHECKPOINTS.
