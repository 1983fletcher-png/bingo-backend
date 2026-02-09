# Interactive Polling (Venue-Based) — Implementation Checklist

Use this list to verify the polling feature is fully implemented. Every item must be true.

---

## Constraints (Master Prompt)

| # | Item | Verified |
|---|------|----------|
| 1 | There is **no separate Create Poll page** — poll creation happens inside the Host page | ✅ `/poll/start` creates venue and redirects to Host; Host has "Start poll" |
| 2 | **TV Display page never scrolls** | ✅ `PollDisplayVenue` uses `height: 100vh`, `width: 100vw`, `overflow: hidden` |
| 3 | **No dev/debug text** in production UI | ✅ No console.log or DEBUG in Poll*Venue / PollVenueStart pages |
| 4 | **Exactly three pages**: Host (control hub), Player (mobile voting), TV Display | ✅ Host = `/poll/join/:venueCode/host`, Player = `/poll/join/:venueCode`, Display = `/poll/join/:venueCode/display` |

---

## Page Architecture

| # | Item | Verified |
|---|------|----------|
| 5 | **Poll Host Page** — single control hub at `/poll/join/:venueCode/host` | ✅ `PollHostVenue.tsx` |
| 6 | **Poll Player Page** — mobile voting at `/poll/join/:venueCode` | ✅ `PollPlayerVenue.tsx` |
| 7 | **Poll TV Display Page** — large-format at `/poll/join/:venueCode/display` | ✅ `PollDisplayVenue.tsx` |

---

## Poll Lifecycle

| # | Item | Verified |
|---|------|----------|
| 8 | **Permanent venue link + QR** — one join URL per venue | ✅ Join URL is `/poll/join/:venueCode`; same for every poll at that venue |
| 9 | **Start Poll** creates a new poll instance and keeps the same venue link/QR | ✅ `poll:start` creates poll, sets active for venue; players stay on same URL |
| 10 | **All connected players + TV display update live** when a new poll starts | ✅ Server moves sockets in `venue:vc` into `poll:pid` and broadcasts `poll:update` |
| 11 | **Polls are archived when ended** (not deleted) | ✅ `venuePollStore.endPoll()` pushes to `archives` with question, date/time, venue, response data |
| 12 | **Results saved** with question, date/time, venue, response data | ✅ Archive includes `question`, `createdAt`, `endedAt`, `venueCode`, `grouped`, `total` |

---

## Host Page — Left Column ("Join to Vote")

| # | Item | Verified |
|---|------|----------|
| 13 | QR code (host-size) | ✅ `QRCodePanel` with `size={180}` |
| 14 | Short join URL with **copy button** | ✅ Read-only input + Copy button |
| 15 | Poll/venue **code with copy button** | ✅ Code display + Copy button |
| 16 | **Open Player Link** button | ✅ Link to `joinUrl` |
| 17 | **Open TV Display** button | ✅ Link to `displayUrl` |
| 18 | **Fullscreen TV Display** button | ✅ `openFullscreen()` opens display in new window |
| 19 | **Status**: Connected | ✅ Dot + "Connected" / "Connecting…" |
| 20 | **Status**: Voting Open / Closed | ✅ "Voting open" / "Voting closed" when payload exists |
| 21 | **No duplicate URLs, no clutter** | ✅ Single join URL and code; clean layout |

---

## Host Page — Center Column (Poll Setup & Controls)

| # | Item | Verified |
|---|------|----------|
| 22 | **Poll question** — blank by default | ✅ `useState('')` |
| 23 | **Placeholder**: "Type your poll question…" | ✅ On textarea |
| 24 | **Example helper text** (non-editable) | ✅ "e.g. What drink should we add to the menu?" |
| 25 | **Templates dropdown** — opens below button (popover) | ✅ Button "Templates ▼"; popover below with categories |
| 26 | **Template categories**: Events, Food & Drink, Music, Feedback | ✅ `POLL_TEMPLATES` in `PollHostVenue.tsx` |
| 27 | **Response type**: **Open Text** | ✅ Radio "Open text" |
| 28 | **Response type**: **Multiple Choice** | ✅ Radio "Multiple choice" |
| 29 | **Multiple choice**: options (add/remove, max 10) | ✅ Options list, Add option, Remove per row; max 10 |
| 30 | **Start poll** button (when no active poll) | ✅ Submit "Start poll" |
| 31 | **End poll** button (when active poll) | ✅ "End poll" with confirm |
| 32 | **Lock / Unlock** (when active poll) | ✅ Lock / Unlock buttons |
| 33 | **Ticker** toggle (when active poll) | ✅ "Ticker: On / Off" button |

---

## Host Page — Right Column

| # | Item | Verified |
|---|------|----------|
| 34 | **Live results preview** (e.g. top answers, count) | ✅ "Live results" panel with response count and top 5 + Other |

---

## Player Page

| # | Item | Verified |
|---|------|----------|
| 35 | **Join by venue** (same URL for every poll) | ✅ `poll:join-by-venue` with `venueCode`, role `player` |
| 36 | **Show current poll** (question, input, submit) | ✅ Renders payload; open text or multiple choice; submit |
| 37 | **No active poll** state — friendly message | ✅ "No active poll" + "Check back soon." on `poll:no-active` |

---

## TV Display Page

| # | Item | Verified |
|---|------|----------|
| 38 | **Join by venue** | ✅ `poll:join-by-venue` with role `display` |
| 39 | **Viewport-only layout** — no scroll | ✅ `height: 100vh`, `width: 100vw`, `overflow: hidden`; flex layout with `minHeight: 0` |
| 40 | **No active poll** state | ✅ "No active poll" + "Check back soon." on `poll:no-active` |

---

## Entry Flow (No Separate Create Page)

| # | Item | Verified |
|---|------|----------|
| 41 | **Home** → "Interactive Polling" goes to venue creation then Host | ✅ Link to `/poll/start` → `PollVenueStart` emits `venue:create` → redirect to `/poll/join/:venueCode/host` |
| 42 | **Backwards compatibility**: `/poll/create` redirects to `/poll/start` | ✅ `<Route path="/poll/create" element={<Navigate to="/poll/start" replace />} />` |

---

## Backend

| # | Item | Verified |
|---|------|----------|
| 43 | **venue:create** — creates venue, returns `venueCode` + `hostToken` | ✅ `venuePollStore.createVenue()`; emit `venue:created` |
| 44 | **poll:start** — venueCode + hostToken + question, etc.; creates poll, sets active | ✅ Creates poll, `setActivePoll`, joins host to poll, broadcasts to venue room |
| 45 | **poll:end** — archive poll, clear active | ✅ `venuePollStore.endPoll()` with `getPayloadForBroadcast` |
| 46 | **poll:join-by-venue** — venueCode + role; returns current poll or no-active | ✅ Resolves `activePollId`, joins socket to poll, emits `poll:update` or `poll:no-active` |
| 47 | **Host re-auth after refresh** (venue hostToken accepted for lock/export) | ✅ `poll.venueHostToken` set on start; `assertHost` accepts `venueHostToken` |

---

**Last verified:** Checklist created and all items confirmed in codebase.
