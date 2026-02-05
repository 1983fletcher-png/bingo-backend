# Create Flow — Research & Design: Education, Care, Business, General

**Purpose:** Define sub-options and builder patterns for the four remaining template families so each feels right for its audience (schools, care facilities, business, general use) and aligns with the vision: calm, no blank states, guidance over overwhelm, diversity and confidence.

---

## Design principles (carry from Hospitality)

- **One purpose per option** — “What do you want to create?” not “Pick a tool.”
- **No blank states** — Every builder starts with sensible, editable defaults.
- **Scraper where it helps** — Venue/school/org URL → drop in logo, title, colors, links.
- **Same layout** — Left: controls (scraper, fields, theme, format). Center: live preview. Export: Print + Get share link.
- **Reuse builders** where the content shape fits: announcement-style (like Event), welcome/info-style (like Welcome), or list-style (like Menu).

---

## 1. Education & Learning

**Audience:** Schools, classrooms, libraries, youth programs, workshops.

**Sub-options (purposes):**

| Option | One-line explanation |
|--------|----------------------|
| **Class or workshop announcement** | Promote a class, workshop, or event. Date, time, description, sign-up link. |
| **Reading list or resources** | Share a list of books, links, or resources. Title + items (optional descriptions/URLs). |
| **Event (field trip, parent night, open house)** | Same as event promotion: title, date, time, description, image, CTA. |
| **Welcome / information** | Library hours, room rules, contact, quick links. Same pattern as venue welcome. |

**Builders to implement:**

- **Announcement** — Reuse Event builder pattern: title, date, time, description, image, CTA. Defaults: “Upcoming workshop”, “Next Tuesday 4pm”, “Join us for…”. Route: `/create/education/announcement`.
- **Reading list / resources** — List of items (title, optional description, optional URL). One section or flat list. Defaults: e.g. “Suggested reading” with 2–3 placeholder items. New component or reuse a simplified menu-style list. Route: `/create/education/resources`.
- **Event** — Reuse Event builder (same as hospitality event). Route: `/create/education/event`.
- **Welcome / info** — Reuse Welcome builder. Route: `/create/education/welcome`.

**Tone:** Clear, encouraging, appropriate for educators and parents. No jargon.

---

## 2. Care & Wellness

**Audience:** Assisted living, clinics, therapy offices, hospitals, day programs.

**Sub-options (purposes):**

| Option | One-line explanation |
|--------|----------------------|
| **Activity or program announcement** | Today’s or this week’s activity. Name, time, short description, optional image. |
| **Welcome / information** | Hours, contact, wayfinding, house rules, WiFi. Same pattern as venue welcome. |
| **Event (family day, open house, info session)** | Event promotion: title, date, time, description, CTA. |
| **Daily or weekly schedule** | Simple list of activities/times (e.g. “9am Stretch”, “2pm Music”). List-based. |

**Builders to implement:**

- **Activity announcement** — Similar to Event but simpler: activity name, date/time, short description, optional image. Defaults: “Morning coffee & conversation”, “10:00 AM”, “All welcome.” Route: `/create/care/activity`.
- **Welcome / info** — Reuse Welcome builder. Route: `/create/care/welcome`.
- **Event** — Reuse Event builder. Route: `/create/care/event`.
- **Schedule** — List of rows: time + label (e.g. “9:00 AM — Stretch”). Optional “Add row.” Defaults: 2–3 sample rows. New simple builder or minimal list component. Route: `/create/care/schedule`.

**Tone:** Calm, respectful, warm. Nostalgia and “felt like home” are especially relevant here (see Vision Addendum).

---

## 3. Business & Corporate

**Audience:** Training, onboarding, internal communication, HR, teams.

**Sub-options (purposes):**

| Option | One-line explanation |
|--------|----------------------|
| **Announcement** | All-hands, policy update, workshop. Title, date, summary, link. |
| **Welcome / information** | New hire or visitor info: who to contact, where to go, quick links. |
| **Event (training, workshop, offsite)** | Event promotion: title, date, time, description, CTA. |
| **Quick reference or policy snippet** | Short title + body text (or bullet list). Print-friendly. |

**Builders to implement:**

- **Announcement** — Reuse Event builder pattern (title, date, time, description, CTA). Defaults: “Team update”, “Friday 2pm”, “Please join…” Route: `/create/business/announcement`.
- **Welcome / info** — Reuse Welcome builder. Route: `/create/business/welcome`.
- **Event** — Reuse Event builder. Route: `/create/business/event`.
- **Quick reference** — Simple: title + body (textarea or bullet list). One screen. Defaults: “Quick reference”, “Key points: …” Route: `/create/business/quick-reference`.

**Tone:** Professional, clear, no corporate buzzword overload.

---

## 4. General Page

**Audience:** Anyone who needs a quick announcement, flyer, or link-in-bio style page.

**Sub-options (purposes):**

| Option | One-line explanation |
|--------|----------------------|
| **Announcement** | One message: title, date (optional), body, optional CTA. |
| **Quick info page** | Title + a few lines or bullets. Like a mini welcome. |
| **Link list** | Title + list of links (label + URL). Link-in-bio style. |
| **Flyer** | Visual one-pager: headline, short text, image, CTA. Reuse Event-style layout. |

**Builders to implement:**

- **Announcement** — Reuse Event builder (minimal fields). Route: `/create/general/announcement`.
- **Quick info** — Reuse Welcome builder with minimal fields (headline, one body block, optional links). Route: `/create/general/info`.
- **Link list** — Title + list of { label, url }. Defaults: “Useful links” + 2 placeholders. New simple builder. Route: `/create/general/links`.
- **Flyer** — Reuse Event builder. Route: `/create/general/flyer`.

**Tone:** Friendly, minimal, “you can do this.”

---

## Implementation strategy

1. **Reuse first** — Event builder and Welcome builder are reused across families with the same or slightly different defaults and copy. No new document types required; we can pass a `family` or `context` in the saved doc for future theming if needed.
2. **New builders only where needed:**
   - **Resources / reading list** (Education) — list of items with optional URL; can be a simplified menu-style or a new small type.
   - **Schedule** (Care) — time + label rows; new simple type + preview.
   - **Quick reference** (Business) — title + body; can be a variant of Welcome with one big text block.
   - **Link list** (General) — title + links; Welcome builder already has “quick links”; we can expose a “link list only” mode or a tiny dedicated builder.
3. **Routes:** Each family has a landing page (e.g. `/create/education`) listing sub-options, then routes like `/create/education/announcement` that render the shared builder with family-specific defaults and labels.
4. **ViewPage:** Existing document types (`event`, `welcome`, `menu`) already work. New types (`resources`, `schedule`, `quick-reference`, `link-list`) need a small addition to types and ViewPage renderer when we add them.

---

## File and route summary

| Family    | Landing route       | Sub-options (routes) |
|-----------|---------------------|------------------------|
| Education | `/create/education` | announcement, resources, event, welcome |
| Care      | `/create/care`      | activity, welcome, event, schedule |
| Business  | `/create/business`  | announcement, welcome, event, quick-reference |
| General   | `/create/general`   | announcement, info, links, flyer |

Shared builders: **Event** (event, announcement, flyer, activity), **Welcome** (welcome, info), **Menu** (already exists). New: **Resources**, **Schedule**, **Quick reference**, **Link list** (each small and focused).

---

*This document is the R&D baseline for implementing Education, Care, Business, and General. Build with the same heart as Hospitality: calm, guided, no blank canvas.*
