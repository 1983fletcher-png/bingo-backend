# Trivia / Host Room — Implementation Status (from master script)

This list is derived from **docs/TRIVIA-ROOM-IMPLEMENTATION.md** and the Host Room / Trivia flow script. Items implemented in the full backlog pass are marked **[x]**.

---

## Already done (reference)

- **Phase 1:** Models (TriviaPackModel, RoomState, etc.), implementation doc.
- **Phase 2:** Room store (`server/roomStore.js`), socket events (`room:join`, `room:host-create`, `room:host-set-state`, `room:host-next`, `room:host-toggle-setting`, `room:submit-response`, `room:host-dispute-resolve`), idempotent rejoin via `room:join` + playerId.
- **Phase 3:** Routes `/host/create`, `/room/:roomId?role=…`; HostCreateTrivia steps (type → pack → preview → options). *Note: “Choose pack & host” Start Hosting emits room:host-create and redirects to /room/:roomId?role=host (Room page).*
- **Phase 4 (partial):** One full seed pack (Weekly Bar Trivia – Classic, 45 Q, sources). Stub packs for all 8 presets. `getTriviaRoomPacks()`, `getPacks()`, `getPack(id)`.
- **Phase 5:** Shared components: QuestionCard, AnswerCard, TimerPill, LeaderboardList, QRCodePanel (`frontend/src/components/trivia-room/`).
- **Phase 6:** HostPanel (Start, Reveal, Next, End), toggles (leaderboards, MC tips, auto-advance), dispute tools (Confirm, Accept variant, Void). PlayerPanel with TimerPill, AnswerCard (44px, press animation), leaderboard by setting. DisplayPanel with TimerPill, leaderboard by setting.
- **Phase 7:** Anonymous → 2–3 part funny name (Play + Room). Reconnect with stored identity; room snapshot on rejoin.
- **Phase 8:** Speed bonus in `computePoints`; final wager in `room:submit-response`; dispute flow (`room:host-dispute-resolve`, `resolveDispute` in roomStore).
- **Phase 9:** Pack Verified / Review required badge in pack picker and preview; per-question “review” and source count in preview; host review gate (“I've reviewed flagged questions”) before Start Hosting when pack has review_required or any question needsReview.
- **Phase 10:** Display-only route `/display-only/:packId` with automated question → timer → answer → fun fact loop. Unit tests: `server/roomStore.test.js` (scoring, state transitions, dispute). Run: `npm run test:room`.
- **QR codes:** Host page and Display (waiting room + trivia) use current origin for join URL.
- **Code-based trivia:** Host toggles (leaderboards to players / on display), `host:trivia-settings`, settings + `questionStartAt` + `timeLimitSec` in getTriviaPayload; Display and Play show TimerPill and respect leaderboard visibility.

---

## 1. Waiting room / Display QR

- [x] **Status:** Done. Display (TV) waiting room and trivia QR use `window.location.origin + '/join/' + code`.

---

## 2. Pack library & presets (Phase 4)

- [x] **All 8 preset types** — Weekly Bar Classic, Weekly Bar Extended, Quick Happy Hour, Display Automated, Theme Night, Family-Friendly, Speed Trivia, Seasonal (stub packs in `stubPacks.ts`).
- [x] **Seed packs** — Weekly Bar Classic full; others stubs. Pack picker shows all 8.
- [x] **Storage** — `getPacks()`, `getPack(id)` in `triviaRoomPacks/index.ts`.

---

## 3. Shared UI components (Phase 5)

- [x] **QuestionCard** — `components/trivia-room/QuestionCard.tsx`.
- [x] **AnswerCard** — `components/trivia-room/AnswerCard.tsx` (A/B/C/D, tap/lock, press animation).
- [x] **TimerPill** — `components/trivia-room/TimerPill.tsx`.
- [x] **LeaderboardList** — `components/trivia-room/LeaderboardList.tsx`.
- [x] **QRCodePanel** — `components/trivia-room/QRCodePanel.tsx`.

---

## 4. Role UIs — gaps (Phase 6)

- [x] **HostPanel — toggles** — Leaderboards (players + display), MC tips, auto-advance in Room HostPanel; code-based Host has leaderboard toggles.
- [x] **HostPanel — live counts** — Players count, responses count; timer via TimerPill.
- [x] **HostPanel — Dispute (REVEAL only)** — Confirm, Accept variant, Void in Room HostPanel; backend `room:host-dispute-resolve`.
- [x] **PlayerPanel — timer** — TimerPill in Room PlayerPanel and code-based Play TriviaPlayerView.
- [x] **PlayerPanel — 44px / card animation** — AnswerCard minHeight 44, press animation.
- [x] **DisplayPanel — Leaderboard top 10** — When `leaderboardsVisibleOnDisplay`; Room and code-based Display.

---

## 5. Scoring & dispute (Phase 8)

- [x] **Speed bonus** — `computePoints()` in roomStore; used in `room:submit-response`.
- [x] **Final wager** — Last question: wager in payload; correct +wager, incorrect −wager (capped by finalWagerCap).
- [x] **Dispute flow** — REVEAL only: Confirm, Accept variant (persist to `acceptedVariants`), Void (subtract points).

---

## 6. Trust & verification (Phase 9)

- [x] **Per-question** — Preview shows “review” and source count for questions.
- [x] **Pack Verified badge** — Pack picker and preview show Verified | Review required from `verificationLevel`.
- [x] **Host review gate** — “I've reviewed flagged questions” checkbox required before Start Hosting when pack or any question needs review.

---

## 7. Display-only & tests (Phase 10)

- [x] **Display-only pack** — `/display-only/:packId` page; automated question → timer → answer → fun fact.
- [x] **Tests** — `npm run test:room` runs `server/roomStore.test.js` (computePoints, state transitions, recordResponse, resolveDispute, buildRoomSnapshot).

---

## 8. Acceptance checklist

- [x] **Toggle leaderboards off mid-game** — Room and code-based: toggles emit settings; players/display hide leaderboard when off.
- [x] **Dispute: host accepts variant** — Variant saved into question `acceptedVariants`; persists in room pack.
- [x] **Display-only pack** — Runs automatically at `/display-only/:packId`; no join required.

---

## Optional / future

- **Room flow as primary** — Currently “Choose pack & host” uses code-based game + Host page. A future step could make Room flow (`/room/:roomId`) the primary path with QR to `/room/:roomId?role=player`.
- **Extended packs** — Replace stub packs with full content for each preset.
- **Integration tests** — E2E or socket-level tests for full host/player/display flows.

---

*Last updated after full backlog implementation. Source: TRIVIA-ROOM-IMPLEMENTATION.md, HOST-ROOM-FLOW-SCRIPT.md.*
