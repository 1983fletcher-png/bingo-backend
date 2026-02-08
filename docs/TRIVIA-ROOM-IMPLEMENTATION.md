# Trivia Room — Full System Implementation Plan

This doc tracks the **Cursor-ready implementation script** for the Playroom Trivia system: state machine, packs, trust pipeline, card UI, and reliability.

## Current vs Target

| Current | Target |
|--------|--------|
| `/host`, `/join/:code`, `/display/:code` | `/room/:roomId?role=host\|player\|display` (new flow) + keep existing for Bingo |
| `game.started`, `game.trivia.currentIndex` | Canonical `RoomState`: WAITING_ROOM → READY_CHECK → ACTIVE_ROUND → REVEAL → LEADERBOARD → … |
| Simple TriviaQuestion (question, correctAnswer, points) | TriviaQuestionModel (type, prompt, answer spec, sources, flags, hostNotes) |
| host:trivia-start, game:started | JOIN_ROOM, ROOM_SNAPSHOT, HOST_SET_STATE |
| No pack verification/sources | Verified packs, sources, dispute flow |

Existing Music Bingo / Classic Bingo / current Trivia remain on the existing Host/Play/Display flow until the new Trivia flow is complete and we optionally migrate.

---

## Phases

### Phase 1 — Foundation ✅
- [x] **lib/models.ts** — TriviaPackModel, TriviaQuestionModel, RoomModel, RoomState, PlayerModel, ResponseModel, state transition helpers.
- [x] **docs/TRIVIA-ROOM-IMPLEMENTATION.md** — This plan.

### Phase 2 — Backend room store & socket
- [ ] **Room store** (e.g. `server/roomStore.js` or in `index.js`): `getRoom(roomId)`, `createRoom(packId, hostId, settings)`, `updateRoomState(roomId, nextState)`, `upsertPlayer`, `recordResponse`, `computeLeaderboard`. In-memory + optional JSON file for dev.
- [ ] **Socket events**: `room:join` (JOIN_ROOM) → validate → join socket to `room:${roomId}` → send `room:snapshot` (ROOM_SNAPSHOT). `host:set-state` (HOST_SET_STATE) → update store → broadcast `room:snapshot` or `room:patch`.
- [ ] **Idempotent rejoin**: On `room:join` with existing playerId, rehydrate and send snapshot so refresh never sticks.

### Phase 3 — Routes & role-based room page
- [ ] **Route** `/host/create` (or `/host/create/trivia`) — Step 1: Game type (Trivia). Step 2: “Play a Trivia Pack” (primary). Step 3: Pack picker (cards). Step 4: Pack preview (expand Q list, sources, Verified badge; CTA Load Pack). Step 5: Host options (leaderboards, MC tips, auto-advance, speed bonus, final wager). CTA “Start Hosting” → create room → redirect to `/room/:roomId?role=host`.
- [ ] **Route** `/room/:roomId` — Read `role` from query (`?role=host|player|display`). Fetch or subscribe to room snapshot; render HostPanel | PlayerPanel | DisplayPanel.
- [ ] **QR** points to `/room/:roomId?role=player`.

### Phase 4 — Pack library & seed data
- [ ] **Preset types** — All 8 presets (Weekly Bar Classic/Extended, Quick Happy Hour, Display Automated, Theme Night, Family-Friendly, Speed Trivia, Seasonal). Each preset card: duration, vibe, hosting required, audience.
- [ ] **Seed packs** — At least one pack per preset (or one “Weekly Bar Trivia – Classic”) with full structure: questions with `sources`, `retrievedAt`, `snippet`, `verificationLevel`, `flags`, MC options where applicable.
- [ ] **Storage** — In-repo JSON seed; later Cloudflare KV/D1 + R2 if needed. Storage abstraction: `getPacks()`, `getPack(id)`.

### Phase 5 — UI components (shared)
- [ ] **QuestionCard** — Big text, optional media.
- [ ] **AnswerCard** — MC option card with A/B/C/D badge; tap to select, second tap to lock; press animation.
- [ ] **TimerPill** — Countdown for ACTIVE_ROUND.
- [ ] **LeaderboardList** — Rank, name, score, % correct (player); Display top 10 only.
- [ ] **QRCodePanel** — Room join URL QR for host/display.

### Phase 6 — Role UIs
- [ ] **HostPanel** — Big buttons: Start (READY_CHECK→ACTIVE_ROUND or WAITING→READY_CHECK→Begin), Reveal, Next, Show Leaderboard, End. Live counts (players, responses, time). Toggles: leaderboards on/off, MC tips, auto-advance. Dispute tools only in REVEAL: Confirm, Accept variant, Void.
- [ ] **PlayerPanel** — Top bar: room name, round/question, timer. Question card; answer area (MC stacked cards with lock; short answer input; numeric/list as specified). 44px min tap targets; card press animation.
- [ ] **DisplayPanel** — Huge question card; 2x2 grid for MC; no correct answer until REVEAL; then highlight correct, fade wrong. Leaderboard top 10.

### Phase 7 — Identity & reconnect
- [ ] **Anonymous + funny name** — On join: enter name or “Join anonymously”. Anonymous → assign 2–3 word name (e.g. “Breezy Otter”); allow regenerate before lock; duplicate names get suffix. Store playerId + displayName + roomId in localStorage. Rejoin with same identity.
- [ ] **Reconnect** — Client sends JOIN_ROOM with stored playerId; server returns ROOM_SNAPSHOT; client renders from snapshot. No “stuck loading”.

### Phase 8 — Scoring & dispute
- [ ] **Scoring** — basePoints by difficulty (easy=1, medium=2, hard=3 or pack-configurable). Speed bonus: `floor((timeRemainingSec / timeLimitSec) * basePoints)`, cap at basePoints. Final wager: players submit wager + answer; correct +wager, incorrect −wager (or 0 per pack).
- [ ] **Dispute** — REVEAL only: Confirm official answer (show sources), Accept variant (persist to question acceptedVariants), Void question. Accepted variant persists into bank.

### Phase 9 — Trust & verification
- [ ] **Per-question** — ≥1 source; Verified requires (2 sources OR 1 Tier A) and if timeSensitive then asOfDate or stable phrasing; no ambiguity or host-approved variants.
- [ ] **Pack Verified** — All questions verified or host accepted review_required. Preview shows badges: Verified | Review required.
- [ ] **Host** must click “I’ve reviewed flagged questions” before start if any review_required.

### Phase 10 — Display-only & tests
- [ ] **Display-only pack** — Automated loop: question → timer → answer → fun fact; no join required by default.
- [ ] **Tests** — Unit: scoring (base, speed bonus, wager). Integration: state transitions (READY_CHECK → ACTIVE_ROUND → REVEAL → …).

---

## Acceptance Checklist (from spec)

- [ ] Create Trivia → select “Weekly Bar Trivia – Classic” → preview → load → host room created.
- [ ] Player joins via QR, chooses anonymous name; name persists after refresh.
- [ ] Host sees player count update live.
- [ ] READY_CHECK: Start/Begin button enabled and works.
- [ ] ACTIVE_ROUND: display shows question + answers as big cards; players see answer cards and can lock.
- [ ] REVEAL: correct answer shows; scoring updates; leaderboard can show on player and display.
- [ ] Toggle leaderboards off mid-game: players/display hide leaderboard instantly.
- [ ] Dispute: host accepts variant; variant saved into question acceptedVariants.
- [ ] Refresh host mid-game: host returns to same room state, controls work, no stuck loading.
- [ ] Display-only pack: runs automatically question→answer loop, no player join required.

---

## File Map

| Item | Location |
|------|----------|
| Canonical types & state machine | `frontend/src/lib/models.ts` |
| Seed packs (new format) | `frontend/src/data/triviaPacksRoom/` or `data/trivia-room-packs.json` |
| Room store (backend) | `index.js` (in-memory rooms) or `server/roomStore.js` |
| Host create flow (Trivia) | `frontend/src/pages/HostCreateTrivia.tsx` (or steps under `/host/create`) |
| Room runtime page | `frontend/src/pages/Room.tsx` (role-based) |
| Shared components | `frontend/src/components/trivia-room/` (QuestionCard, AnswerCard, TimerPill, LeaderboardList) |
| Host panel | `frontend/src/components/trivia-room/HostPanel.tsx` |
| Player panel | `frontend/src/components/trivia-room/PlayerPanel.tsx` |
| Display panel | `frontend/src/components/trivia-room/DisplayPanel.tsx` |

---

## Realtime Event Names (align with existing socket.io)

Use a **room** namespace or prefix so they don’t clash with existing `host:create`, `game:started`:

- **Client → Server:** `room:join`, `room:host-set-state`, `room:submit-response`, `room:host-reveal`, `room:host-next`, `room:host-toggle-setting`, `room:host-dispute-resolve`
- **Server → Client:** `room:snapshot`, `room:patch`, `room:error`

On any join/reconnect, server sends `room:snapshot` immediately.
