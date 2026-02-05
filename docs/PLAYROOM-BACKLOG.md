# Playroom — Product & UX backlog

From host/player testing (Hickory Tavern, Mills River Brewing, etc.). Goal: **simplicity for event hosts and facilitators.**

---

## Scrape & venue

- **Mills River Brewing Company** — Scrape didn’t work for this venue; YouTube and another bar/restaurant did. Investigate (site structure, blocking, or meta tags).
- **Scrape more fields (when possible):**
  - **Banner image URL** — Scrape and prefill.
  - **Food menu / drink menu** — Link or scrape so in-app “Food menu for [Venue]” / “Drink menu” is possible (one tap from game controller).
  - **Upcoming events** — If we can detect an events page on the venue site, pull events.
  - **Facebook & Instagram** — Scrape from venue site and prefill event/venue details (we have `facebookUrl`, `instagramUrl`).
- **Drink specials / food specials** — Already in event config; keep exploring scrape or manual entry for simplicity.

---

## Welcome / join (phone)

- **Logo bigger** on welcome screen (EventLanding: “This is what’s going on, we’re at Hickory Tavern”) — increase logo size.
- **“Scan once, you’re in for the whole event. No need to rescan between games.”** — Currently aspirational; either make it true (persist join across games) or soften copy until we support it. *Noted for behavior + copy.*
- **Name (optional) + Proceed/Enter button invisible** — Button is tappable but not visually clear (e.g. low contrast when venue accent is light). Ensure CTA and “Join” / “Enter” are always visible (border, contrast, or fallback styles).

---

## Bingo cards

- **Free space vs venue logo** — ✅ Done. Host checkbox “Free space” (classic) **or** “Venue/company logo in center square.” Toggle in host UI; center cell shows logo when enabled.

---

## Phone — Play screen (bingo)

- **Footer:** “Win five in a row” / “Leave game” on bottom left; **move light/dark theme toggle to bottom-right** so it’s not in the way.

---

## TV / Display — welcome screen

- **Logo too stretched** on big display welcome screen — fix aspect ratio / sizing so logo isn’t over-stretched.
- **Welcome card:** “Welcome”, “Hickory Tavern”, “Starting soon”, “Host will begin when ready” — **more control from Event & venue details** (customize welcome headline, subtext, or layout from host UI).

---

## Principle

- **Simplicity for hosts and facilitators** — Fewer steps, clear CTAs, and “add manually” fallbacks when scrape or automation isn’t enough.

---

## Vision: scan once, one link for the event

See **docs/PLAYROOM-SCAN-ONCE-VISION.md** — one scan, one link; host runs multiple modules; between modules, waiting or custom welcome/interstitial; design for simplicity and wow without overwhelm.

---

## Learn & Grow (knowledge module)

- **Playroom: Learn & Grow** — Truth-first, globally accessible knowledge center (ages 4–99+); layered Knowledge Cards with mandatory citations, STEM anchors, and activities. First 10 flagship cards defined; feeds Edutainment (trivia, teach-then-check) and activity director content. See **docs/LEARN-AND-GROW-VISION.md** and **docs/LEARN-AND-GROW-KNOWLEDGE-CARD-SPEC.md**.

---

## Done / in progress

- Scrape: backend returns JSON; frontend uses `https://` when env lacked scheme.
- Scrape: backend status + “add manually” fallback copy on Host page.
- Scrape: support more site types (og + twitter meta); inclusive copy.
- Scrape: backend extracts foodMenuUrl, drinkMenuUrl, eventsUrl, facebookUrl, instagramUrl from page links; Host maps into event config; Play + EventLanding show menu/events links.
- Bingo card: host toggle "Use venue logo in center square"; Play center cell shows logo when enabled.
- Event details: Welcome title & message (Display welcome screen); Food/Drink menu URL, Events URL fields; venue profile save/load includes new URLs.
- Vision doc: PLAYROOM-SCAN-ONCE-VISION.md (one link, modules, interstitial).
