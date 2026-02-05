# Phase A, B & C audit (cross-reference with vision)

**Date:** 2026-02-04 (A/B), 2026-02-05 (C)  
**Purpose:** Confirm Phases A, B, and C are complete, correct, and aligned with values and main vision. Single source of truth for menu/theming backend status.

---

## Vision alignment

- **Permission / no copying:** We only use scraped/fetched **information** and render in **our** design; with explicit permission we may use venue assets. ✅ Backend returns structured data only (sections/items); no raw HTML. Permission flag documented.
- **Calendar reference Feb 4, 2026; forward-looking only:** ✅ Observances lib and docs state we do not suggest past holidays; `getUpcoming(fromDate, …)` uses fromDate as reference.
- **One calendar (big + little + music + fan culture):** ✅ Single source in `lib/holidaysAndObservancesUS.js` with categories federal, cultural, food, music, fun, fan_culture.
- **Facts only; dates verified:** ✅ DATE-VERIFICATION-SOURCES.md; floating dates fixed (Doughnut, Ice Cream, Hot Dog, Taco, Cheesecake).
- **Phase order A → B → C:** ✅ A, B, and C implemented (backend complete).

---

## Phase A checklist

| # | Deliverable | Status | Location |
|---|-------------|--------|----------|
| A1 | Observances data (USA), categories, music/fan/fun | ✅ | `lib/holidaysAndObservancesUS.js` — FIXED, NTH_WEEKDAY, EASTER_APPROX; getObservancesForYear(year, categoryFilter), getUpcoming(fromDate, daysAhead, categoryFilter) |
| A2 | Menu design tokens (layout presets, typography, output) | ✅ | `docs/PAGE-MENU-BUILDER-SPEC.md` — "Menu design tokens" section |
| A3 | Theme registry (holidays + music + fun) | ✅ | `docs/PAGE-MENU-BUILDER-SPEC.md` — "Theme registry" with themeIds; suggest theme uses getUpcoming(fromDate) |

---

## Phase B checklist

| # | Deliverable | Status | Location |
|---|-------------|--------|----------|
| B4 | Scrape → menu builder | ✅ | `GET /api/parse-menu-from-url?url=...`; `parseMenuText()`; `GET /api/fetch-page-text` uses SCRAPE_HEADERS |
| B5 | Upload image/PDF → extract | ✅ | `POST /api/parse-menu-from-file` (body: file base64, mimeType); PDF → text → parseMenuText; image → 501 with clear message |
| B6 | Permission flag | ✅ | `docs/PERMISSION-FLAG-VENUE-MENU.md`; eventConfig accepts `venueAllowedUseOfMenuDesign` |

---

## Phase C checklist

| # | Deliverable | Status | Location |
|---|-------------|--------|----------|
| C1 | Observances API (upcoming) | ✅ | `GET /api/observances/upcoming?from=YYYY-MM-DD&days=1-365&category=...` — `index.js`; uses `getUpcoming()` |
| C2 | Observances API (calendar) | ✅ | `GET /api/observances/calendar?year=2020-2030&month=1-12&category=...` — `index.js`; uses `getObservancesForYear()` |
| C3 | Waiting room menu link/preview doc | ✅ | `docs/PHASE-C-THEMING-AND-CALENDAR.md` — eventConfig.foodMenuUrl/drinkMenuUrl; optional parse-menu-from-url preview |

---

## Backend API summary (for frontend integration)

- **Menu from URL:** `GET /api/parse-menu-from-url?url=...` → `{ sections, sourceUrl }`
- **Menu from file:** `POST /api/parse-menu-from-file` body `{ file, mimeType }` → `{ sections, source }` or 501 for image
- **Observances upcoming:** `GET /api/observances/upcoming?from=YYYY-MM-DD&days=14&category=...` → `{ from, days, observances }`
- **Observances calendar:** `GET /api/observances/calendar?year=2026&month=2&category=...` → `{ year, month, observances }`
- **Event config (socket):** `eventConfig` may include `foodMenuUrl`, `drinkMenuUrl`, `venueAllowedUseOfMenuDesign`; see `docs/PERMISSION-FLAG-VENUE-MENU.md` and `docs/PHASE-C-THEMING-AND-CALENDAR.md`.

---

## Verdict

Phase A, B, and C are complete and aligned with the vision. Backend support for menu builder, theming, and activity calendar is in place. Frontend (music-bingo-app) can implement theme picker, calendar UI, and waiting room menu link/preview using the APIs and contracts above.
