# Implementation status — confirmed

**Date:** 2026-02-05  
**Purpose:** Single checklist of what is done (backend + frontend) and what was implemented to go live.

---

## Done (backend — this repo)

| Item | Status | Location |
|------|--------|----------|
| Phase A: Observances data, design tokens, theme registry | ✅ | `lib/holidaysAndObservancesUS.js`, `docs/PAGE-MENU-BUILDER-SPEC.md`, `docs/DATE-VERIFICATION-SOURCES.md` |
| Phase B: Menu from URL, menu from file, permission flag doc | ✅ | `index.js` (parse-menu-from-url, parse-menu-from-file), `docs/PERMISSION-FLAG-VENUE-MENU.md` |
| Phase C: Observances API (upcoming + calendar) | ✅ | `GET /api/observances/upcoming`, `GET /api/observances/calendar` in `index.js` |
| Phase C: Waiting room menu link/preview contract | ✅ | `docs/PHASE-C-THEMING-AND-CALENDAR.md` |
| Docs: vision, audit, pre-push, master brief | ✅ | MENU-AND-THEMING-VISION, PHASE-A-B-AUDIT, PRE-PUSH-TEST-REPORT, MASTER-BRIEF-IMPLEMENTATION-STATUS |
| Smoke test | ✅ | `npm run smoke:observances`, `scripts/smoke-observances.js` |
| Committed & pushed | ✅ | `origin main` (bingo-backend) |

---

## Done (frontend — music-bingo-app)

| Item | Status | Location |
|------|--------|----------|
| Waiting room menu link | ✅ | `WaitingRoomView` accepts `venueLinks`; shows "Food menu" / "Drink menu" / "Events" / social when set. `Play.tsx` passes `venueLinks` from `eventConfig`. |
| Host: eventConfig foodMenuUrl, drinkMenuUrl, scrape → Apply | ✅ | Host event details form; ScraperPanel applies scrape result; `host:set-event-config` sends to backend. |
| Theme picker (upcoming observances) | ✅ | Menu builder calls `GET /api/observances/upcoming`; "Suggested by date" section with "Use this theme" mapping themeId → menu theme. |
| Activity director calendar | ✅ | Route `/calendar`; page calls `GET /api/observances/calendar`; month view with optional category filter. |
| Permission flag (venue allowed use of menu design) | ✅ | `EventConfig.venueAllowedUseOfMenuDesign` in types; Host form checkbox; respected when showing venue menu image. |

---

## What was implemented (this pass)

1. **WaitingRoomView** — Added `venueLinks` prop (`foodMenuUrl`, `drinkMenuUrl`, `eventsUrl`, `facebookUrl`, `instagramUrl`, `logoUrl`) and rendered "View menu" / "Events" / social links in the waiting room so players see them before the game starts.
2. **CreateMenuBuilder** — Fetches `GET /api/observances/upcoming`; shows "Suggested by date" with observances that have `themeId`; "Use this theme" maps to existing menu themes (e.g. valentines → warm, july4 → classic) and applies selection.
3. **Calendar page** — New `/calendar` route and page; fetches `GET /api/observances/calendar?year=&month=`; displays month grid of observances; optional category filter.
4. **GlobalNav** — Link to "Calendar" (or "Activity calendar") pointing to `/calendar`.
5. **EventConfig** — Added `venueAllowedUseOfMenuDesign?: boolean` to types; Host "Event & venue details" section has checkbox "Venue allowed use of menu design"; value sent via `host:set-event-config`.

---

## Go live

- **Backend:** Already pushed; if Railway/Render is connected to `bingo-backend`, it will deploy on push.
- **Frontend:** Commit and push `music-bingo-app`; Netlify (or your host) will build and deploy when connected to that repo.

---

## References

- `docs/PHASE-A-B-AUDIT.md` — Phase A/B/C backend checklist
- `docs/PHASE-C-THEMING-AND-CALENDAR.md` — API contracts and frontend next steps
- `docs/PERMISSION-FLAG-VENUE-MENU.md` — venueAllowedUseOfMenuDesign
