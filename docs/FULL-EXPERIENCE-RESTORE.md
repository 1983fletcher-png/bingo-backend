# Restoring the full Playroom experience

You had the full experience in **music-bingo-app** (scrape site, logos, Facebook/Instagram, page builders, light/dark mode). This doc tracks what’s been restored in **bingo-backend/frontend** and what’s left.

---

## Done in bingo-backend/frontend

### 1. Clean light/dark theme
- **Design system** (`frontend/src/styles/design-system.css`): CSS variables for light and dark. No more purple/green metallic; clean dark default and a light theme.
- **ThemeToggle**: Floating button (bottom-right) on Home, Host, Join, Create, Calendar, Learn, View. Persists choice in `localStorage` (`playroom-theme`).
- **Home** (and global styles): Use `var(--bg)`, `var(--text)`, `var(--surface)`, etc., so the whole app respects the theme.

### 2. Create flow – full builders
- **Create** (`/create`): Template family selection — Hospitality, Education, Care, Business, General (same five cards as in music-bingo-app).
- **CreateHospitality** (`/create/hospitality`): Sub-options — Menu, Daily/Weekly Specials, Event Promotion, Live Music, Welcome.
- **CreateMenuBuilder** (`/create/hospitality/menu`, `/create/hospitality/specials`): Full menu builder — scraper, sections/items, observances “Suggested by date,” theme, format, print, share link.
- **CreateEventBuilder** (`/create/hospitality/event`): Event promo — title, date/time, description, image, CTA, scraper, theme, format, print, share link.
- **CreateLiveMusicBuilder** (`/create/hospitality/live-music`): Live music/featured performer — scraper, performer name, date/time, blurb, image, more-events link, theme, format, print, share link.
- **CreateWelcomeBuilder** (`/create/hospitality/welcome`): Welcome/info — scraper (drops in food/drink/events/social links), headline, hours, WiFi, house rules, contact, quick links, theme, format, print, share link.
- **CreatePlaceholder**: Still used for Education, Care, Business, General template families (those sub-builders are not ported; context-aware Event/Welcome builders can be routed here later if needed).

### 3. ViewPage and share links
- **ViewPage** (`/view/:slug`): Fetches document from `GET /api/page-builder/:slug` and renders MenuPreview, EventPreview, LiveMusicPreview, or WelcomePreview by `doc.type`. Theme toggle shown on view pages.
- **Save/load**: All builders use `POST /api/page-builder/save` → returns `{ slug }`; share link is `${origin}/view/${slug}`.

### 4. Supporting pieces (ported)
- **ScraperPanel** + **scraper-panel.css** — URL input, Fetch, apply brand/description/URLs into builder.
- **useScrapeSite** — calls `GET /api/scrape-site?url=...` (backend has this).
- **types/pageBuilder.ts** — `ScrapeResult`, `PageBrand`, `MenuBuilderState`, `EventBuilderState`, `LiveMusicBuilderState`, `WelcomeBuilderState`, `PageBuilderDocument`, defaults, `getDefaultSections`.
- **Preview components** — `MenuPreview`, `EventPreview`, `LiveMusicPreview`, `WelcomePreview`, `PagePreviewFrame`.
- **Styles** — `menu-builder.css`, `create.css`, `design-system.css`.

### 5. Host – event & venue
- **Event & venue details** (collapsible section on Host, when a game exists): Game title, venue name, **scrape venue site** (URL → fetch logo, colors, title, description, food/drink/events/Facebook/Instagram), logo file upload, accent color, “Use venue logo in center square,” drink/food specials, theme label, welcome title/message/image, promo text, banner image, Facebook/Instagram URLs, food/drink/events menu URLs, “Venue allowed use of menu design.”
- **Apply event details to game** button — sends `host:set-event-config` so display and players see the updated config.
- **Venue profiles** — Save current settings to a profile (localStorage); Load venue… dropdown to restore. Profiles are device-only.
- **Backend reachability** — Shown in scrape section (connected / not reachable / checking) using `GET /health`.

### 6. Types and backend contract
- **EventConfig** and **VenueProfile** in `frontend/src/types/game.ts`; **VENUE_PROFILES_KEY** for localStorage.
- **GameCreated.eventConfig** is full `EventConfig`; on `game:created` and `game:event-config-updated`, host state is synced.

---

## Summary

| Feature | Status |
|--------|--------|
| Light/dark mode (clean theme) | ✅ Done |
| Create – template families + Hospitality sub-options | ✅ Done |
| Create – Menu builder (incl. specials, observances) | ✅ Done |
| Create – Event builder | ✅ Done |
| Create – Live Music builder | ✅ Done |
| Create – Welcome builder | ✅ Done |
| ViewPage (/view/:slug) | ✅ Done |
| Host – event/venue (scrape, logo, Facebook, profiles) | ✅ Done |
| Education / Care / Business / General template placeholders | ✅ Placeholder pages (sub-builders can be wired later) |

The full experience (scrape, logos, Facebook/Instagram, share links, venue details on Host) is now in one repo with one deploy. **music-bingo-app** can be used as reference only; **bingo-backend** is the single source of truth.
