# Menu Builder & Theming Vision

**Purpose:** One source of truth for how we handle venue menus, design inspiration vs. copying, theme system (holidays + special days), and activity-director calendar. America-first; expand to all regions and languages later.

**Calendar reference date: February 4, 2026.** Every system that uses the calendar or “upcoming” observances operates from this date forward. We look ahead only—you cannot go back and celebrate a holiday. All theme suggestions and calendar nudges show the **next** observances coming up. Dates are correct and proper for 2026 and moving forward.

---

## 1. Permission & How We Use Venue Content

### When the venue says yes
- **Mom-and-pop / “our IT has everything, feel free to use it”:** If they explicitly grant permission, we may screenshot, scrape, or use uploaded images/menus and repurpose within our system (e.g. show their design with permission, or ingest and re-render in our themes).
- **Explicit permission =** we can use their assets in the ways they approved (e.g. “screenshot and upload” or “scrape and repurpose”).

### When we don’t have explicit permission
- We **do not** copy their design, fonts, or layout.
- We **do** use scraped or fetched **information** (items, prices, categories, descriptions) as **input** only.
- We **output** our own designs: same data, **our** layout, typography, and themes. Inspiration from aggregate best practices and many examples, not from one venue’s copyrighted design.

### Legal and ethical line
- **No copyright risk:** We don’t host pixel copies of their menu or screenshot-as-asset unless they’ve given permission.
- **We do it better:** Our system is built from research across many menus and standards—generalization and best practices, not cloning. Unique content (items/prices) is facts; the **design** is ours.

---

## 2. Inputs: How Menu Content Gets In

Support multiple ways for hosts and activity directors to get content into the menu builder:

| Input | Use case | What we do |
|-------|----------|------------|
| **Scrape URL** | Venue gives their menu page; we fetch and parse | Extract text/structure only; render in our design system |
| **Upload image** | Photo of menu, screenshot, or scan | OCR / image understanding → extract items → our layout |
| **Upload PDF** | Their branded menu PDF | Extract text (and optionally layout hints) → our themes |
| **Manual entry** | Type or paste items/sections | Direct input into our builder |

**With permission:** If they said “you can use our images,” we may also offer “use this image as the menu” (e.g. display their uploaded image) in addition to re-rendering in our themes.

---

## 3. Design System: Our “World-Class” Menu UI

Goal: **Elegant, efficient, psychologically effective.** Not minimal to the point of bland—enough detail and customization to feel premium and on-brand. Think Apple-level polish with more fluidity and theme options.

### 3.1 Psychology (research-backed)
- **Scan patterns:** Eyes hit center, then top-right, then top-left (golden triangle). Place high-margin or featured items there when we have that data.
- **Time on menu:** ~109 seconds average—every element should support quick scanning and decisions.
- **Language:** Evocative, specific names (e.g. “Succulent Italian Seafood Filet” vs “Seafood Filet”) when we generate or suggest copy.
- **Anchoring:** Strategic placement of higher-priced items so others feel fairly priced; optional “decoy” or hero items to guide choice.
- **Sections:** Clear headings (Appetizers, Mains, Drinks, Specials) so users don’t read linearly—they jump.
- **Choice:** Avoid overwhelming; curate or collapse sections when appropriate (e.g. “Today’s specials” vs full menu).

### 3.2 Typography & readability
- **Hierarchy:** One clear font for headings, one for body (or a tight pair). Consistent size steps: section titles > item names > descriptions > prices.
- **Contrast:** Strong text/background contrast for low-light (dining, TV, projectors) and accessibility.
- **Avoid:** Overly decorative fonts that slow scanning; tiny or low-contrast text.

### 3.3 Layout & efficiency
- **Mobile / small screen first:** Vertical, single-column where possible. No “big spread-out visual” that forces zoom/pan—efficient, scannable blocks.
- **Sizing:** For ~4" width, roughly 20–30pt section headers, 14–20pt items, 12–14pt descriptions (scaled for different outputs: phone, tablet, TV, print).
- **White space:** Enough breathing room; don’t crowd. Sections visually grouped.
- **Detail without clutter:** “Details, not basic”—support descriptions and modifiers without looking noisy.

### 3.4 Theming & customization
- **Themes:** Multiple built-in themes (e.g. Classic, Modern, Dark, Seasonal). Same menu data, different look.
- **Holiday / event themes:** Valentine’s, St. Patrick’s, Fourth of July, Easter, Thanksgiving, Christmas, etc.—plus “national days” (food, drink, pet, fun). Same content, different visuals (colors, accents, optional illustrations).
- **Customization:** Venue/host can choose theme, accent color, and (when we support it) light branding so it still feels like “theirs” without copying a full custom design.

---

## 4. Holiday & Special-Days Calendar (America-First)

Used for:
- **Theme suggestions:** “St. Patrick’s Day is coming up—use the St. Patrick’s theme?”
- **Activity director calendar:** March → St. Patrick’s; July → Fourth of July; etc. With prompts: “Are you doing anything for [holiday]? Here’s a menu/calendar theme.”
- **Gentle facilitation:** “This holiday is tomorrow / next week—have you thought about a special menu or activity?”

**Future:** Multilingual, all regions, all local holidays and observances. For now: USA, English, American holidays and widely observed “national days.”

**Design principle:** Combine the **big** (federal, major holidays), the **little** (fun, quirky national days), **music** (musicians’ birthdays and death anniversaries—e.g. Jerry Garcia’s birth/death close together, Elvis, Prince, Bowie), and **fan-culture** (e.g. Star Wars Day) in **one** calendar. Activity directors and event managers shouldn’t have to hunt across scattered sources—we surface “this is coming up” for all of it so they can theme menus, materials, and events appropriately.

### 4.1 Federal & major US holidays (fixed or common observance)

| Date (example 2025) | Holiday |
|--------------------|---------|
| Jan 1 | New Year's Day |
| Jan 20 (3rd Mon) | Martin Luther King Jr. Day |
| Feb 14 | Valentine's Day |
| Feb 17 (3rd Mon) | Presidents Day (Washington's Birthday) |
| Mar 17 | St. Patrick's Day |
| Apr 20 (varies) | Easter Sunday |
| Apr 23 (varies) | Administrative Professionals Day |
| May 11 (2nd Sun) | Mother's Day |
| May 26 (last Mon) | Memorial Day |
| Jun 15 (3rd Sun) | Father's Day |
| Jun 19 | Juneteenth |
| Jul 4 | Independence Day |
| Sep 1 (1st Mon) | Labor Day |
| Oct 13 (2nd Mon) | Columbus Day / Indigenous Peoples' Day |
| Oct 31 | Halloween |
| Nov 11 | Veterans Day |
| Nov 27 (4th Thu) | Thanksgiving |
| Dec 24–25 | Christmas Eve & Christmas |
| Dec 31 | New Year's Eve |

### 4.2 Sample “national” / fun days (food, drink, pet, lifestyle)

Use for prompts and optional menu/calendar themes. Expand over time.

| Date | Day |
|------|-----|
| Jan 1 | National Bloody Mary Day |
| Jan 2 | National Spaghetti Day |
| Feb 9 | National Pizza Day |
| Feb 22 | National Margarita Day |
| Mar 23 | National Puppy Day |
| Mar 24 | National Cheesecake Day |
| Apr 11 | National Pet Day |
| Apr 12 | National Grilled Cheese Day |
| May 13 | National Hummus Day |
| Jun 7 | National Ice Cream Day (1st Sun July often used too) |
| Jul 4 | Independence Day |
| Jul 7 | National Fried Chicken Day |
| Sep 9 | National Hot Dog Day (varies) |
| Oct 1 | National Taco Day |
| Nov 3 | National Sandwich Day |
| Nov 5 | National Doughnut Day (varies) |
| Dec 4 | National Cookie Day |

**Note:** Many “national [X] day” dates vary by source. When we implement the calendar, use a single authoritative list (e.g. National Day Calendar or internal curated list) and expose “upcoming” (e.g. next 7–14 days) for nudge copy.

### 4.3 Music & culturally significant dates (large followings)

Musicians’ birthdays and death anniversaries matter for venues, activity directors, and event managers—many plan tributes, themed nights, or special playlists. Include these (and more over time) so the calendar can nudge: “Jerry Garcia’s birthday is Aug 1—consider a Grateful Dead theme?” or “Elvis Week (birth Aug 8, death Aug 16).”

**Sample (fixed dates):**

| Date   | Observance |
|--------|------------|
| Jan 8  | Elvis Presley’s birthday |
| Jan 10 | David Bowie’s birthday; Bowie death anniversary (Jan 10, 2016) |
| Jan 19 | Janis Joplin’s birthday |
| Apr 5  | Kurt Cobain death anniversary |
| Apr 21 | Prince death anniversary |
| May 11 | Bob Marley death anniversary |
| Jun 7  | Prince’s birthday |
| Jul 3  | Jim Morrison death anniversary |
| Aug 1  | Jerry Garcia’s birthday |
| Aug 9  | Jerry Garcia death anniversary |
| Aug 16 | Elvis Presley death anniversary |
| Sep 18 | Jimi Hendrix death anniversary |
| Oct 4  | Janis Joplin death anniversary |
| Oct 9  | John Lennon’s birthday |
| Nov 24 | Freddie Mercury death anniversary |
| Nov 27 | Jimi Hendrix’s birthday |
| Dec 8  | John Lennon death anniversary; Jim Morrison’s birthday |
| Sep 5  | Freddie Mercury’s birthday |

These live in the same observances data with category `music` so the UI can filter or highlight “Music” when building for a venue or activity.

### 4.4 Fan-culture & “large following” events

Events that drive themed parties and promotions (e.g. Star Wars Day “May the 4th”). Add as category `fan_culture` so they sit alongside holidays and music.

| Date | Observance |
|------|------------|
| May 4 | Star Wars Day (“May the 4th be with you”) |

Expand over time: Comic-Con season, franchise anniversaries, etc.

### 4.5 Little / fun / quirky days

The “little things” that are scattered across the web—National Pierogi Day, National Folding Laundry Day, What If Cats and Dogs Had Opposable Thumbs Day, etc. Consolidate a curated set so activity directors get one place for “something fun this week” without hunting. Category `fun` (or tag) so they can show “Fun & quirky” in the calendar or theme picker.

### 4.6 How the calendar surfaces in the product
- **When building a menu or material:** “Upcoming: St. Patrick’s Day (Mar 17)—try the St. Patrick’s theme?” or “Jerry Garcia’s birthday (Aug 1)—music theme?”
- **When building an activity calendar:** Month view with federal, cultural, food, music, fan-culture, and fun days; optional “Add theme” for any day; filter by category (Holidays, Music, Food, Fun).
- **Copy:** “This holiday / event is tomorrow / next week. Have you thought about a special menu or activity?”—helpful, not pushy.

---

## 5. Uniqueness of Menus (Your Question: “If We Scraped a Thousand Restaurants…”)

- **Content (items, prices, categories):** Highly varied. Every venue has different dishes and pricing.
- **Layout and design patterns:** After hundreds or thousands of menus, **patterns** repeat: sections (apps, mains, drinks), alignment (price right, name left), use of boxes or dividers. So **numerically**, “raw” designs have a lot of repetition in structure.
- **Our approach:** We don’t copy any one of those. We take the **data** from scrape (or upload/OCR) and feed it into **our** small set of top-tier, research-backed layouts and themes. So we get:
  - **Uniqueness** from the venue’s actual content.
  - **Consistency and quality** from our design system and themes (including holiday variants).

That’s how we “draw inspiration” from the whole field without copying and while staying legally safe.

---

## 6. Phase order and deployment

**Order:** Execute **Phase A** first. When confident, move to **Phase B**, then **Phase C**. Do not skip ahead—each phase builds on the previous so the vision, data, and UX stay coherent.

**After A + B + C are implemented:** Run the full flow through **sandbox** (or staging). Verify: design tokens, theme registry, menu builder inputs, theme picker, calendar with all categories (federal, cultural, food, music, fun, fan_culture), and nudges. Ensure top-tier UX/UI—elegant, efficient, proper.

**When everything is proper:** **Deploy.** Push to production so activity directors and event managers get one unified calendar and theme system.

---

## 7. Prioritized To-Do List (Next Steps)

### Phase A: Foundation (design + data)
1. **Observances data (USA):** Single source of truth in `lib/holidaysAndObservancesUS.js` with **categories**: federal, cultural, food, music, fun, fan_culture. Include federal + major holidays, national food/drink/pet days, **musicians’ birthdays and death anniversaries** (Garcia, Elvis, Prince, Bowie, Lennon, Hendrix, Joplin, Morrison, Cobain, Marley, Freddie Mercury, etc.), **fan-culture** (e.g. Star Wars Day), and a curated set of **fun/quirky** days. Use for “upcoming” and theme suggestions; support optional filter by category.
2. **Menu design tokens:** Define a small set of layout presets (e.g. “Compact list,” “Card grid,” “Single column”) and typography scales (section / item / description / price) that work for phone, tablet, TV, and print. Document in design-system or PAGE-MENU-BUILDER-SPEC.
3. **Theme registry (holidays + music + fun):** Define 3–4 holiday themes to start (Valentine’s, St. Patrick’s, Fourth of July, Thanksgiving/autumn), plus at least one “music” and one “fun” theme. Each: name, date range or “week of” rule, accent colors, optional illustration or icon set. Spec only so we can “suggest theme” when building.

### Phase B: Menu builder enhancements
4. **Scrape → menu builder:** When user pastes or scrapes a menu URL, take existing `fetch-page-text` (or structured scrape) and map result into menu-builder state (sections, items, optional prices). Show result in **our** layout, not their HTML.
5. **Upload image/PDF → extract:** Add “Upload menu (image or PDF)” to menu builder; backend or client OCR/parse → structured items/sections → feed into same builder state. (Can start with image-only and a simple OCR or manual “confirm sections.”)
6. **Permission flag (optional):** In venue/profile or per-event, “Venue gave permission to use their menu design.” When set, allow “use uploaded image as menu” (display their asset) in addition to “re-render in our themes.”

### Phase C: Theming & calendar in UI
7. **Theme picker in menu builder:** Let user choose layout preset + theme (including holiday themes). When a holiday is in “upcoming,” show a soft nudge: “St. Patrick’s Day is coming up—use the St. Patrick’s theme?”
8. **Activity director calendar (MVP):** Month view with US holidays and selected national days; optional “Apply theme to this day” or “Suggest menu theme” for that date. Copy: “Are you doing anything for [holiday]?”
9. **Waiting room / in-game:** Use existing `foodMenuUrl` / `drinkMenuUrl` to show “View menu” link; optional short “menu preview” (text-only in our UI) from scraped or stored menu data when available.

### Phase D: Polish & scale
10. **More holiday themes:** Expand to 10+ US holidays and special days; then add regional and international in “big brain” roadmap.
11. **Design-audit pass:** Apply menu psychology (golden triangle, anchoring, section clarity) and mobile readability to all menu builder outputs.
12. **Document permission flow:** Short doc or in-app copy for hosts: “If your venue has given permission, you can use their images; otherwise we’ll use your content in our designs.”

---

## 8. Summary

- **Permission:** With explicit “yes,” we can use their assets (screenshot, scrape, upload) as agreed. Without it, we only use **information** and render in **our** designs.
- **Inspiration, not copying:** We scrape and study many menus to build best practices and our own top-tier themes—we don’t replicate one venue’s design.
- **Inputs:** Scrape URL, upload image/PDF, manual entry. Optional: “use their image” when permission is recorded.
- **Design:** Elegant, efficient, psychologically sound, mobile-first, with clear hierarchy and theming (including holidays and national days).
- **America-first calendar:** Federal + major + national days, **music** (musicians’ birth/death), **fan-culture** (e.g. Star Wars Day), and **fun/quirky** days in one place; “upcoming” nudges and theme suggestions in menu builder and activity calendar; filter by category.
- **Phase order:** A → B → C, then sandbox, then deploy.
- **To-do:** Observances data (with categories) and theme spec first, then scrape/upload → builder, then theme picker and calendar, then more themes and polish.
