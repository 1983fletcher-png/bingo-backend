# Trivia — Remaining To-Do (After Full Implementation Pass)

All **code and documentation** items from the trivia build script have been implemented. What remains is **manual verification** and **optional/future** work.

---

## 1. Manual verification (acceptance checklist)

Run through these once to confirm behavior. Code is in place; these are not implementation tasks.

- [ ] **Create Trivia → host room:** HostCreateTrivia → pick “Weekly Bar Trivia – Classic” → preview → options → Start Hosting → redirects to `/room/:roomId?role=host`; host sees HostPanel.
- [ ] **Player join + anonymous:** Join via QR/URL, choose anonymous, get funny name; refresh; same name and role.
- [ ] **Host sees count live:** Second device joins; host sees player count and responses count update.
- [ ] **READY_CHECK → ACTIVE_ROUND:** WAITING_ROOM → Start ready check → READY_CHECK → Begin round → ACTIVE_ROUND.
- [ ] **ACTIVE_ROUND — display and players:** Display shows question + MC grid; players see answer cards and can lock.
- [ ] **REVEAL — answer and leaderboard:** Correct answer visible; scores/leaderboard update when toggles on.
- [ ] **Toggle leaderboards off:** Host toggles off; player and display lose leaderboard.
- [ ] **Dispute — accept variant:** REVEAL → “Accept variant” with text → that text accepted for grading.
- [ ] **Host refresh mid-game:** Host refreshes during ACTIVE_ROUND/REVEAL; rejoin; state restored; Reveal/Next work.
- [ ] **Display-only pack:** `/display-only/weekly-bar-classic` runs question → timer → answer → fun fact loop.

---

## 2. Optional / future — **Done**

- [x] **Extended packs:** All stub packs replaced with full question sets. See `frontend/src/data/triviaRoomPacks/`: Quick Happy Hour (15 Q), Theme Night (20 Q), Family-Friendly (20 Q), Speed Trivia (15 Q), Seasonal/Holiday (20 Q), Weekly Bar Extended (30 Q), Display Automated (20 Q). Index imports these packs instead of stubs.
- [x] **E2E / integration tests:** Room flow integration test (`npm run test:room-flow`) spawns backend and runs full host create → player join → state transitions → submit response → reveal → next. Playwright E2E (`npx playwright test`) added with `e2e/trivia-room.spec.js` and `playwright.config.js` for home/host/create navigation and pack picker.

---

When all manual checklist items are verified, the trivia build script is fully complete.
