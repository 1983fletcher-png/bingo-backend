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

### Phase 2 — Backend room store & socket ✅
- [x] **Room store** (`server/roomStore.js`): `getRoom(roomId)`, `createRoom(pack, hostId, settings)`, `updateRoomState`, `upsertPlayer`, `recordResponse`, `computeLeaderboard`, `computePoints`, `resolveDispute`, `updateRoomSetting`. In-memory.
- [x] **Socket events**: `room:join`, `room:host-create`, `room:host-set-state`, `room:host-next`, `room:host-toggle-setting`, `room:submit-response`, `room:host-dispute-resolve`; broadcast `room:snapshot`.
- [x] **Idempotent rejoin**: On `room:join` with existing playerId, rehydrate and send snapshot.

### Phase 3 — Routes & role-based room page ✅
- [x] **Route** `/host/create` — HostCreateTrivia: type → pack picker → preview → options → Start Hosting → `room:host-create` → redirect to `/room/:roomId?role=host`.
- [x] **Route** `/room/:roomId` — Role from query; HostPanel | PlayerPanel | DisplayPanel.
- [x] **QR** for Room flow points to `/room/:roomId`; code-based uses `/join/:code`.

### Phase 4 — Pack library & seed data ✅
- [x] **Preset types** — All 8 presets; stub packs in `stubPacks.ts`; Weekly Bar Classic full.
- [x] **Seed packs** — Weekly Bar Classic 45 Q with sources; others stubs.
- [x] **Storage** — `getPacks()`, `getPack(id)` in `triviaRoomPacks/index.ts`.

### Phase 5 — UI components (shared) ✅
- [x] **QuestionCard** — `components/trivia-room/QuestionCard.tsx`.
- [x] **AnswerCard** — MC with A/B/C/D, tap/lock, press animation.
- [x] **TimerPill** — Countdown for ACTIVE_ROUND.
- [x] **LeaderboardList** — Rank, name, score, % correct.
- [x] **QRCodePanel** — Room join URL QR.

### Phase 6 — Role UIs ✅
- [x] **HostPanel** — Start, Reveal, Next, End; toggles (leaderboards, MC tips, auto-advance); dispute (Confirm, Accept variant, Void); live counts; TimerPill.
- [x] **PlayerPanel** — Question card, timer, MC/short answer (44px, press animation), leaderboard by setting.
- [x] **DisplayPanel** — Question card, 2x2 MC, REVEAL highlight, leaderboard by setting, TimerPill.

### Phase 7 — Identity & reconnect ✅
- [x] **Anonymous + funny name** — Play and Room; regenerate before lock; store in localStorage.
- [x] **Reconnect** — room:join with playerId; room:snapshot; no stuck loading.

### Phase 8 — Scoring & dispute ✅
- [x] **Scoring** — basePoints; speed bonus via `computePoints`; final wager in `room:submit-response`.
- [x] **Dispute** — REVEAL: Confirm, Accept variant (acceptedVariants), Void (subtract points).

### Phase 9 — Trust & verification ✅
- [x] **Per-question** — Preview shows source count and “review” badge.
- [x] **Pack Verified** — Verified | Review required in picker and preview.
- [x] **Host** — “I've reviewed flagged questions” gate before start when review_required.

### Phase 10 — Display-only & tests ✅
- [x] **Display-only pack** — `/display-only/:packId`; automated question → timer → answer → fun fact.
- [x] **Tests** — `npm run test:room` (server/roomStore.test.js): scoring, state transitions, dispute.

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
- **Server → Client:** `room:snapshot`, `room:error`, `room:created` (on room:host-create only). Full state is sent via `room:snapshot`; `room:patch` is not used.

On any join/reconnect, server sends `room:snapshot` immediately.
