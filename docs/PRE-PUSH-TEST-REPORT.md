# Pre-push test report (recent changes)

**Date:** 2026-02-04 (streamline, host UI, display, scrape, welcome, logo); 2026-02-05 (Phase C backend)  
**Scope:** All completed-todo items plus Phase C (observances API, menu/theming backend).

---

## Before you run checks

- **Backend:** After pulling latest, restart the backend (`node index.js` or `npm run dev`) so new routes (e.g. `/api/observances/upcoming`, `/api/observances/calendar`) are loaded. If you see `Cannot GET /api/observances/...`, the process running on that port is an older instance.

---

## Automated checks (done)

| Check | Result |
|-------|--------|
| **Frontend build** (`npm run build` in music-bingo-app) | ✅ Pass — Vite build completed in ~1.7s, no TS errors |
| **Lint** (Host, Display, WaitingRoomView, PlayroomLogoAnimated, HostTips) | ✅ No linter errors |
| **Scrape API** (`GET /api/scrape-site?url=https://www.bbc.com`) | ✅ Returns valid JSON: `title`, `colors` (e.g. theme-color), `logoUrl` (null when site has no og:image). Backend resolves URL, reads public meta tags, 12s timeout. |
| **Observances API (Phase C)** | ✅ `npm run smoke:observances` passes (lib shape + filters). With backend running: `GET /api/observances/upcoming?from=2026-02-04&days=14` returns `{ from, days, observances }`; `GET /api/observances/calendar?year=2026&month=2` returns `{ year, month, observances }`. Valid `category` filter; invalid params return 400. |

---

## Manual test checklist (recommended before push)

Use this to click through and confirm behavior in the browser (run backend + frontend dev, then walk through).

### 1. Streamline: theme → control room
- [ ] From Home, go to Host (or Host → Music Bingo).
- [ ] Click a **curated theme** (e.g. Classic Rock, 80s). Game should **create immediately** and you land on the **control room** (QR, waiting room, start section) without scrolling or clicking Create.
- [ ] “Build your own” still requires building the list and clicking Create.

### 2. Host: waiting room & start flow
- [ ] **Waiting room** block: Mini-game dropdown (None / Roll Call / Stretch), host message, “Playroom logo (display & players)” dropdown (None / Bounce / Breathing / Glow).
- [ ] **Start event** → display shows **welcome panel** (not first question yet).
- [ ] **Begin game** button appears; click it → display shows first question (trivia) or bingo call sheet.

### 3. Host: song list & exports
- [ ] **Reveal** section: **Sort by** dropdown (Song title / Artist); list is sorted by selected option; default is by song title.
- [ ] **Songs — edit list**: Instructions at top for CSV/M3U (DJ/Spotify). **Download CSV** and **Download M3U** work and produce valid files.

### 4. Host: event details & approval
- [ ] **Event & venue details**: Note says event details (including scraped data) are not shown on display/players until you click **Apply event details to game**. **Apply** button pushes current form to game; “Applied — visible on display and players” appears briefly.
- [ ] **Scrape venue**: Enter a URL (e.g. `https://www.bbc.com`), click **Fetch**. Success or error message appears; form fills (logo, color, title, description) but **display/players do not update** until you click **Apply event details to game**.
- [ ] **Save venue profile** saves to this device; **Load venue** populates form only (Apply still required to push to game).

### 5. Host: End game / Back
- [ ] **End game** and **← Back** are in the **header** (with QR / “Players scan to join”), not in the footer.
- [ ] **Players joined** list shows names under the count when anyone has joined.

### 6. Display (TV view)
- [ ] Opening **/display/:code** before start shows **waiting room**: QR, “The Playroom” (with selected logo animation), game/subcategory, host message, “Scan to join”, game code.
- [ ] After host clicks **Start event**: **Welcome panel** (custom title/message/background if set).
- [ ] After host clicks **Begin game**: First question (trivia) or bingo call sheet.
- [ ] **Logo animation**: Changing “Playroom logo” in host waiting room updates display (bounce / breathing / glow or none).

### 7. Player waiting room (phone/tablet)
- [ ] **/play/:code** before start: Waiting room with same **Playroom logo animation** at top, event title, host message, room code; Roll Call or Stretch if enabled.

### 8. Rotating tips & leaderboards
- [ ] **Host tips** (bingo/trivia) rotate to a new random tip every ~18 seconds.
- [ ] **Players joined** in header shows a list of display names (leaderboard-style for “who’s in”).

### 9. Welcome panel
- [ ] **Event & venue details**: Welcome title, message, background image URL. These show on **display** on the welcome panel (after Start event, before Begin game).

### 10. Legal / data flow
- [ ] Scrape legal note visible; no event/scraped data on display or players until host clicks **Apply event details to game**.

### 11. Phase C — when frontend implements (backend ready)
- [ ] **Theme picker:** Host/activity director can see “Upcoming” suggestions from `GET /api/observances/upcoming` and apply a theme (theme registry in `PAGE-MENU-BUILDER-SPEC.md`).
- [ ] **Activity calendar:** Month view uses `GET /api/observances/calendar?year=...&month=...`; categories filter correctly.
- [ ] **Waiting room menu:** If `eventConfig.foodMenuUrl` or `drinkMenuUrl` is set, “View menu” link appears; optional short text preview from `GET /api/parse-menu-from-url`; `venueAllowedUseOfMenuDesign` respected (see `PERMISSION-FLAG-VENUE-MENU.md`).

---

## Summary

- **Build and lint:** Pass.
- **Scrape API:** Verified with a real URL; returns title, colors, and optional logo/description; behavior matches “public meta only, no storage.”
- **Observances API (Phase C):** Upcoming and calendar endpoints return correct shape; backend is the single source for observances (no frontend bundle of dates).
- **Logic and flow:** Code paths for theme→create, welcome phase, apply-before-push, and logo animation are consistent and match the intended behavior above.

**Verdict:** Ready for you to run the manual checklist in the browser and then push. Phase C backend is complete; frontend can integrate theme picker, calendar, and waiting room menu when ready. If you want to add automated E2E tests later, consider Playwright or Cypress for the critical paths (create game → display waiting → start → begin → first question).
