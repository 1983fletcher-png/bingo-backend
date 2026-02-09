# Trivia module — before-push checklist

Use this list to confirm the trivia pack/module is ready before you push and verify in your target environment.

---

## 1. Code and build — **Done**

- [x] **Frontend build** — TypeScript and Vite build pass (`npm run build` in `frontend/`).
- [x] **Host.tsx** — Trivia IIFE fragment and `mcTipsEnabled` in host trivia settings fixed.
- [x] **Display.tsx** — Trivia state types and `mcTipsEnabled` / `hostNotes.mcTip` fixed.
- [x] **LeaderboardList.tsx** — Unused variable removed.
- [x] **HostCreateTrivia.tsx** — `disabled` prop coerced to boolean.

---

## 2. Manual verification (acceptance)

Run through these **once** on a running stack (local or staging) to confirm behavior. Code is in place; these are confirmation steps, not implementation tasks.

- [ ] **Create Trivia → host room**  
  HostCreateTrivia → pick “Weekly Bar Trivia – Classic” → preview → options → Start Hosting → redirects to `/room/:roomId?role=host`; host sees HostPanel.

- [ ] **Player join + anonymous**  
  Join via QR/URL, choose anonymous, get funny name; refresh; same name and role.

- [ ] **Host sees count live**  
  Second device joins; host sees player count and responses count update.

- [ ] **READY_CHECK → ACTIVE_ROUND**  
  WAITING_ROOM → Start ready check → READY_CHECK → Begin round → ACTIVE_ROUND.

- [ ] **ACTIVE_ROUND — display and players**  
  Display shows question + MC grid; players see answer cards and can lock.

- [ ] **REVEAL — answer and leaderboard**  
  Correct answer visible; scores/leaderboard update when toggles on.

- [ ] **Toggle leaderboards off**  
  Host toggles off; player and display lose leaderboard.

- [ ] **Dispute — accept variant**  
  REVEAL → “Accept variant” with text → that text accepted for grading.

- [ ] **Host refresh mid-game**  
  Host refreshes during ACTIVE_ROUND/REVEAL; rejoin; state restored; Reveal/Next work.

- [ ] **Display-only pack**  
  `/display-only/weekly-bar-classic` runs question → timer → answer → fun fact loop.

---

## 3. Tests (optional but recommended)

- [ ] **Room flow integration** — `npm run test:room-flow` (from repo root).  
  If you see “port in use”, stop any other process on that port or use a different `BASE_URL` with an already-running server.

- [ ] **Playwright E2E** — `npx playwright test` (home/host/create links and pack picker).

---

## 4. Push and smoke-check

- [ ] **Push** to your repo.
- [ ] **Deploy / CI** — Run your usual deploy or CI pipeline.
- [ ] **Smoke-check** in the target environment (create room, join as player, one round, reveal).

---

## Summary

- **Required before “totally tight”:** Complete the manual verification list (section 2) and push + smoke-check (section 4).
- **Already done:** Build fixes, extended packs, room flow, E2E wiring, and docs. Nothing else is blocking the trivia module other than the steps above.

When all checklist items are done, the trivia pack/module is ready to consider complete.
