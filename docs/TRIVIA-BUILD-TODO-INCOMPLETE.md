# Trivia Build — Incomplete / Not Yet Done (To-Do List)

This list tracked everything from the trivia build script that was **not completed or not implemented**. Items that have been **implemented** in this pass are marked **[x]** below. What **remains** is at the end.

---

## 1. Room UI — Navigation links (from HOST-ROOM-FLOW-SCRIPT §10) — **[x] Done**

- [x] **Room PlayerPanel:** Added “Leave room” link → `/` at top of panel.
- [x] **Room DisplayPanel:** Added “Leave room” link → `/` (positioned top-left).

*(HostPanel already had “← Back to host” → `/host?type=trivia`.)*

---

## 2. Backend / realtime (from TRIVIA-ROOM-IMPLEMENTATION.md) — **[x] Done**

- [x] **room:patch:** Doc updated. Implementation uses full `room:snapshot` only; `room:patch` is not used. TRIVIA-ROOM-IMPLEMENTATION.md now lists Server → Client: `room:snapshot`, `room:error`, `room:created`, and states that full state is sent via `room:snapshot`.

---

## 3. Code-based trivia (old flow) — **[x] Done**

- [x] **Display.tsx — MC tip:** When code-based trivia is running, MC tip is shown when `triviaState.settings?.mcTipsEnabled` and the current question has `mcTip`. Backend `getTriviaPayload` (forAudience) now includes `mcTip` on the current question when `settings.mcTipsEnabled` and `q.hostNotes?.mcTip`. Display.tsx renders the “MC tip:” block when present.

---

## 4. Documentation updates — **[x] Done**

- [x] **TRIVIA-STILL-TO-DO-AND-CONFIRM.md:** Rewritten. Items 1–5 and 6 marked done; acceptance checklist first bullet now says “redirects to `/room/:roomId?role=host`”; “Room flow as primary” noted as done.
- [x] **TRIVIA-ROOM-IMPLEMENTATION.md:** Phase 3 updated to “Start Hosting → `room:host-create` → redirect to `/room/:roomId?role=host`.” Realtime events section updated (room:patch note).
- [x] **TRIVIA-NOT-IMPLEMENTED-LIST.md:** Phase 3 note updated to state HostCreateTrivia emits `room:host-create` and redirects to Room.

---

## 5. Manual confirmation (acceptance checklist)

These are **implemented in code** but must be **confirmed by manual test**. They are not “unimplemented”; they require a human to run through the flows.

- [ ] **Create Trivia → host room created:** HostCreateTrivia → pick “Weekly Bar Trivia – Classic” → preview → options → Start Hosting → redirects to `/room/:roomId?role=host` and host sees HostPanel.
- [ ] **Player join + anonymous name persists:** Join via QR or join URL, choose anonymous, get funny name; refresh; same name and role.
- [ ] **Host sees player count live:** Second device joins; host sees player count and responses count update.
- [ ] **READY_CHECK → ACTIVE_ROUND:** WAITING_ROOM → Start ready check → READY_CHECK → Begin round → ACTIVE_ROUND.
- [ ] **ACTIVE_ROUND — display and players:** Display shows question + MC grid; players see answer cards and can tap to lock.
- [ ] **REVEAL — answer and leaderboard:** Correct answer visible; scoring/leaderboard update when leaderboard toggles are on.
- [ ] **Toggle leaderboards off:** Host toggles off; player and display lose leaderboard immediately.
- [ ] **Dispute — accept variant:** In REVEAL, host “Accept variant” with text; that text accepted for grading.
- [ ] **Host refresh mid-game:** Host refreshes; rejoin with hostToken; state restored; Reveal/Next work.
- [ ] **Display-only pack:** `/display-only/weekly-bar-classic` runs question → timer → answer → fun fact loop.

---

## 6. Optional / future — **[x] Done**

- [x] **Extended packs:** All stub packs replaced with full question sets. New files: `quickHappyHour.ts` (15 Q), `themeNight.ts` (20 Q), `familyFriendly.ts` (20 Q), `speedTrivia.ts` (15 Q), `seasonalHoliday.ts` (20 Q), `weeklyBarExtended.ts` (30 Q), `displayAutomated.ts` (20 Q). Index imports these instead of stubs.
- [x] **Integration / E2E tests:** `npm run test:room-flow` runs full room flow (host create, player join, state transitions, submit, reveal, next). Playwright added: `e2e/trivia-room.spec.js`, `playwright.config.js`; run with `npx playwright test` (requires backend + frontend dev servers or CI).

---

## Summary

| Category              | Status |
|-----------------------|--------|
| Room UI (Leave room)  | **Done** |
| room:patch (doc)      | **Done** |
| Display.tsx MC tip    | **Done** |
| Doc updates (3)       | **Done** |
| Manual confirmation   | **10 items — confirm by manual test** |
| Optional (extended packs, E2E) | **Done** |

**Implemented in this pass:** All code, doc, extended packs, and E2E/integration test items are complete.  

**Remaining:** Run through the 10 acceptance checklist items manually. See **TRIVIA-REMAINING-TODO.md**.
