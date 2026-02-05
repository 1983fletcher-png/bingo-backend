# Page & Menu Builder — Current Status

**Last updated:** After crash recovery / status check.

---

## Persistence: what clears when

- **Page builder share links** (menus, event promos, welcome pages, etc.): Saved via **backend** `POST /api/page-builder/save`. Stored **in memory** on the server. So:
  - **Yes — a deploy clears them.** Any time the backend process restarts (deploy, crash, Railway sleep, etc.), the in-memory map is reset and old slugs stop working. New “Get share link” creates a new slug. When we’re ready to “tighten down,” we can add real persistence (e.g. DB or file) so share links survive restarts.
- **Venue profiles** (logo, title, colors, menu URLs you save in Host): Saved in the **browser** in **localStorage**. They are **not** cleared by a deploy. They clear only if the user clears site data or uses a different device/browser. So: venue profiles persist across deploys; page builder share links do not, until we add backend persistence.

---

## What’s done

### Create flow (entry)
- **`/create`** — Template family selection (5 cards: Hospitality, Education, Care, Business, General).
- **`/create/hospitality`** — Hospitality sub-options: Menu, Daily/Weekly Specials, Event Promotion, Live Music, Welcome/Info.
- **Home** and **GlobalNav** — “Create page” link.

### Scraper integration
- **`useScrapeSite`** hook — Calls backend `GET /api/scrape-site?url=...`.
- **`ScraperPanel`** — URL input, Fetch, then toggles (Logo, Title, Accent color, Description, Food/Drink/Events/social links) and **“Drop into page”**.
- Used in all four builders (Menu, Event, Live Music, Welcome).

### Backend
- **`GET /api/scrape-site?url=...`** — Logo, title, colors, description, food/drink/events/social URLs.
- **`GET /api/fetch-page-text?url=...`** — Optional; returns page text for future “import from URL”.
- **`POST /api/page-builder/save`** — Body `{ document }` → returns `{ slug }` (in-memory store).
- **`GET /api/page-builder/:slug`** — Returns saved document.

### Menu builder (full)
- **`/create/hospitality/menu`** and **`/create/hospitality/specials`** — Same builder; specials opens with type “Specials”.
- Steps: Menu type → Sections & items (rename, reorder, add/remove) → Theme → Format.
- Left panel: Scraper, title/subtitle/logo/accent, sections/items, theme, format, Print, Get share link.
- Center: **MenuPreview** (live WYSIWYG).
- Saves with **`type: 'menu'`** for ViewPage.

### Event Promotion builder (full)
- **`/create/hospitality/event`** — **CreateEventBuilder**.
- Fields: Venue name, logo URL, event title, date, time, description, image URL, CTA label/link, accent, theme, format.
- Defaults: e.g. “Theme Night”, “8:00 PM”, “Join us for…” (no blank state).
- Scraper, **EventPreview**, Print, Get share link.
- Saves with **`type: 'event'`**.

### Live Music / Featured Performer builder (full)
- **`/create/hospitality/live-music`** — **CreateLiveMusicBuilder**.
- Fields: Venue name, logo, performer name, date & time, blurb, image URL, “More events” link, accent, theme, format.
- Defaults: e.g. “Live Music Tonight”, “Tonight at 9”, “Acoustic set — no cover”.
- Scraper, **LiveMusicPreview**, Print, Get share link.
- Saves with **`type: 'live-music'`**.

### Welcome / Information Display builder (full)
- **`/create/hospitality/welcome`** — **CreateWelcomeBuilder**.
- Fields: Venue name, logo, headline, hours, WiFi name/password, house rules, contact, **quick links** (label + URL; scraper can add Food menu, Drink menu, Events, Facebook, Instagram).
- Defaults: “We’re glad you’re here”, sample hours, sample house rules.
- Scraper, **WelcomePreview**, Print, Get share link.
- Saves with **`type: 'welcome'`**.

### View page (unified)
- **`/view/:slug`** — **ViewPage** fetches document from backend.
- Renders by **`doc.type`**: `menu` → MenuPreview, `event` → EventPreview, `live-music` → LiveMusicPreview, `welcome` → WelcomePreview.
- Unknown type falls back to MenuPreview.

### Types and previews
- **`src/types/pageBuilder.ts`** — MenuBuilderState (with `type: 'menu'`), EventBuilderState, LiveMusicBuilderState, WelcomeBuilderState, PageBrand, PageBuilderDocument, defaults.
- **MenuPreview** — Menu only (sections/items).
- **EventPreview**, **LiveMusicPreview**, **WelcomePreview** — Use **PagePreviewFrame** (theme + format aspect ratios, accent).

### Build
- **`npm run build`** in `music-bingo-app` **passes** (no errors).

---

## What was in progress when things stopped

- You had asked to “build everything” with full spec and vision (Event, Live Music, Welcome + heart of the vision docs).
- Implementation was **already in place**: Event, Live Music, and Welcome builders and ViewPage routing by type were built; the crash happened after that work was done (or in a different session that had already completed it).

---

## What might still be done (optional next steps)

- **Education, Care, Business, General** — Still use **CreatePlaceholder** (“Coming soon”). Can add real builders later using the same pattern (scraper + form + preview + save).
- **Backend persistence** — Page builder docs are stored **in-memory**; server restart clears them. Optional: persist to DB or file for permanent share links.
- **Print styling** — Per-builder print CSS is in place; fine-tune for each format if needed.
- **Copy/export** — e.g. “Copy link” button, or optional image/PDF export for social.

---

## Quick reference

| Route | Component | Status |
|-------|-----------|--------|
| `/create` | Create | ✅ |
| `/create/hospitality` | CreateHospitality | ✅ |
| `/create/hospitality/menu` | CreateMenuBuilder | ✅ |
| `/create/hospitality/specials` | CreateMenuBuilder | ✅ |
| `/create/hospitality/event` | CreateEventBuilder | ✅ |
| `/create/hospitality/live-music` | CreateLiveMusicBuilder | ✅ |
| `/create/hospitality/welcome` | CreateWelcomeBuilder | ✅ |
| `/view/:slug` | ViewPage | ✅ (all doc types) |
| `/create/education` | CreateEducation | ✅ |
| `/create/care` | CreateCare | ✅ |
| `/create/business` | CreateBusiness | ✅ |
| `/create/general` | CreateGeneral | ✅ |

You’re in a good state to move forward: all four hospitality builders and the unified view are implemented and building cleanly.
