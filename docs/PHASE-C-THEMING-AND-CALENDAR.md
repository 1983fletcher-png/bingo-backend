# Phase C: Theming & Calendar in UI – Backend Support

This document describes the backend APIs and data contracts that support the frontend’s **theme picker**, **activity director calendar**, and **waiting room menu link/preview**. It aligns with our values and vision in `docs/MENU-AND-THEMING-VISION.md` and `docs/PAGE-MENU-BUILDER-SPEC.md`.

---

## 1. Observances API (theme picker & calendar)

The backend exposes two REST endpoints that use `lib/holidaysAndObservancesUS.js`. All dates are **forward-looking** where relevant; we do not suggest or celebrate past holidays.

### GET `/api/observances/upcoming`

Returns observances that fall **on or after** a given date and within the next N days. Use this for:

- **Theme picker:** “Upcoming” suggestions (e.g. “Valentine’s Day is next week—use this theme?”).
- **Activity director nudges:** “St. Patrick’s Day is in 14 days.”

**Query parameters:**

| Parameter  | Type   | Default       | Description |
|-----------|--------|---------------|-------------|
| `from`    | string | today (YYYY-MM-DD) | Start date (inclusive). |
| `days`    | number | 14            | Number of days ahead (1–365). |
| `category`| string | (none)        | Optional filter: `federal`, `cultural`, `food`, `music`, `fun`, `fan_culture`. |

**Example:**  
`GET /api/observances/upcoming?from=2026-02-04&days=30&category=music`

**Response:**

```json
{
  "from": "2026-02-04",
  "days": 30,
  "observances": [
    { "name": "Valentine's Day", "month": 2, "day": 14, "category": "cultural", "themeId": "valentines" },
    ...
  ]
}
```

**Implementation note:** `getUpcoming(from, days, category)` only includes observances in the **same calendar year** as `from`. For cross-year ranges, the frontend can call with `from` in December and/or add a second call for January of the next year if needed.

---

### GET `/api/observances/calendar`

Returns all observances for a **specific year and month**. Use this for:

- **Activity director calendar view:** Show a month grid with holidays and observances.
- **Theme planning:** “What’s happening in March?”

**Query parameters:**

| Parameter  | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `year`    | number | yes      | 2020–2030. |
| `month`   | number | yes      | 1–12. |
| `category`| string | no       | Same as above. |

**Example:**  
`GET /api/observances/calendar?year=2026&month=2`

**Response:**

```json
{
  "year": 2026,
  "month": 2,
  "observances": [
    { "name": "Valentine's Day", "month": 2, "day": 14, "category": "cultural", "themeId": "valentines" },
    ...
  ]
}
```

---

### Theme picker integration (frontend)

1. Call **`GET /api/observances/upcoming`** with `from` = current date (e.g. today in YYYY-MM-DD), `days` = 14 or 30.
2. For each observance that has a **`themeId`**, look up the theme in the **Theme registry** in `docs/PAGE-MENU-BUILDER-SPEC.md` (Holiday themes, Music theme, Fun theme).
3. Show suggestions like “Valentine’s Day is coming—use the Valentine’s theme?” and apply that theme when the user accepts.
4. Observances without a `themeId` (e.g. many music observances) can still be shown in the calendar; the generic “Music” or “Fun” theme can be suggested when appropriate.

---

## 2. Waiting room menu link and preview

The waiting room (and any “venue info” area) can show a **“View menu”** link and an optional **short text-only menu preview**. This respects our principle of using **our** design and factual data unless the venue has given permission (see `docs/PERMISSION-FLAG-VENUE-MENU.md`).

### Where menu URLs come from

- **Scrape:** When the host (or app) calls **`GET /api/scrape-site?url=...`**, the backend may return **`foodMenuUrl`** and **`drinkMenuUrl`** when it finds links that look like food/drink menus on the venue’s page.
- **Event config:** The host can put these (or any menu URL) into **`eventConfig`** when creating or updating the game:
  - **`host:create`** or **`host:set-event-config`** with `eventConfig: { ..., foodMenuUrl: "https://...", drinkMenuUrl: "https://..." }`.
- The backend does not strip these keys; it stores and echoes **`eventConfig`** in:
  - `game:created`, `game:event-config-updated`, `join:ok`, `display:ok`.

So the **frontend** can:

1. After a scrape, offer to “Add menu links to this game” and set `eventConfig.foodMenuUrl` / `eventConfig.drinkMenuUrl`.
2. In the **waiting room**, if `eventConfig.foodMenuUrl` or `eventConfig.drinkMenuUrl` is set, show a **“View menu”** (or “Food menu” / “Drink menu”) link that opens that URL in a new tab or in-app browser.

### Optional: short text-only menu preview

To show a **preview** of the menu (section names + a few items) without embedding the venue’s full page or image:

1. Frontend calls **`GET /api/parse-menu-from-url?url=...`** with `eventConfig.foodMenuUrl` or `drinkMenuUrl`.
2. Backend returns **`{ sections: [ { name, items: [ { name, price? } ] } ] }`** (same shape as Phase B menu parsing).
3. Frontend renders a **short, text-only** preview (e.g. section headings + first 3–5 items per section) using **our** typography and layout—no venue logo or image unless **`eventConfig.venueAllowedUseOfMenuDesign === true`** (see `docs/PERMISSION-FLAG-VENUE-MENU.md`).

This keeps the waiting room factual and on-brand: we display **data** (items, prices) in **our** design; we do not imply permission to use the venue’s design or assets unless the flag is set.

---

## 3. Summary

| Capability              | Backend support |
|-------------------------|-----------------|
| Theme suggestions       | `GET /api/observances/upcoming` + theme registry in spec |
| Activity director calendar | `GET /api/observances/calendar` (year + month) |
| Waiting room “View menu” | `eventConfig.foodMenuUrl` / `eventConfig.drinkMenuUrl` (set from scrape or host input) |
| Short menu preview      | `GET /api/parse-menu-from-url?url=...` → render text in our layout; respect `venueAllowedUseOfMenuDesign` |

Phase C backend support is complete. The frontend (music-bingo-app) can implement the theme picker, calendar UI, and waiting room menu link/preview using these APIs and contracts.

---

## Next steps (frontend — music-bingo-app)

- **Theme picker:** Call `GET /api/observances/upcoming` (e.g. `from=today`, `days=30`), map each observance’s `themeId` to the theme registry in `PAGE-MENU-BUILDER-SPEC.md`, and show “Upcoming” suggestions (e.g. “Valentine’s Day — use this theme?”). Apply selected theme to menu/page builder.
- **Activity director calendar:** Build a month view that calls `GET /api/observances/calendar?year=...&month=...`; optionally filter by `category`. Show observances on the calendar; use for planning and themed suggestions.
- **Waiting room menu link:** When joining a game or in the waiting room, if `eventConfig.foodMenuUrl` or `eventConfig.drinkMenuUrl` is present, show a “View menu” (or “Food menu” / “Drink menu”) link that opens the URL.
- **Waiting room menu preview (optional):** Call `GET /api/parse-menu-from-url?url=...` with the menu URL and render a short text-only preview (section names + first few items) in the app’s layout. Only show the venue’s own menu image if `eventConfig.venueAllowedUseOfMenuDesign === true` (see `PERMISSION-FLAG-VENUE-MENU.md`).
- **Host/event config:** Ensure scrape result or host input can set `eventConfig.foodMenuUrl`, `eventConfig.drinkMenuUrl`, and `venueAllowedUseOfMenuDesign` via `host:set-event-config` (or at create time) so the waiting room and display receive them via `game:event-config-updated` and join payloads.
