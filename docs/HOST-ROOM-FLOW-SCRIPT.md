# Host Room & Trivia Flow — Script & Link Map

Use this as a **testing script** and **link map** to cross-check every entry point, step, and exit. Tick boxes as you verify.

---

## 1. Route table (App.tsx)

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | Home | Landing: 4 cards + Game types |
| `/host` | Host | Host setup (no game) or Host room (game created) |
| `/host?type=trivia` | Host | Same; URL sets createMode to trivia |
| `/host?type=bingo` | Host | createMode music-bingo (etc.) |
| `/host/create` | HostCreateTrivia | Trivia pack → preview → options → create room |
| `/host/create?trivia` | HostCreateTrivia | Same; **skips** “Choose game type” step (starts at pack) |
| `/host/create?from=host` | HostCreateTrivia | Same as ?trivia (start at pack) |
| `/host/build/trivia` | TriviaBuilder | Build custom trivia questions (old flow) |
| `/room/:roomId` | Room | Role from query: ?role=host \| player \| display |
| `/join` | JoinEntry | Enter code (old flow) |
| `/join/:code` | Play | Player for **old** game (code-based) |
| `/display/:code` | Display | Display for **old** game (code-based) |

**Trivia Room** uses `/room/:roomId?role=…`. **Old games** (Music Bingo, etc.) use `/join/:code` and `/display/:code`.

---

## 2. Home page (/) — All links

| From | Element | Goes to | Notes |
|------|---------|---------|--------|
| Hero | “Host a room” card | `/host` | |
| Hero | “Join a room” card | `/join` | |
| Hero | “Creative Studio” card | `/create` | |
| Hero | “Learn & Grow Library” card | `/learn` | |
| Nav | “Activity calendar” button | `/calendar` | |
| Game types | Music Bingo “Get started” | `/host?type=bingo` | |
| Game types | **Trivia “Play a pack”** | `/host/create?trivia` | Primary CTA |
| Game types | **Trivia “Build custom”** | `/host?type=trivia` | Secondary |
| Game types | Icebreakers “Get started” | `/host?type=icebreakers` | |
| Game types | Edutainment “Get started” | `/host?type=edutainment` | |
| Game types | Team Building “Get started” | `/host?type=team-building` | |
| Game types | Custom Training “Get started” | `/host?type=trivia` | |

**Checklist — Home**

- [ ] Host a room → `/host` loads; game type selector visible.
- [ ] Trivia card: “Play a pack” → `/host/create?trivia` (pack picker, no “Choose game type”).
- [ ] Trivia card: “Build custom” → `/host?type=trivia` (Host with Trivia selected).
- [ ] All other game types → correct `/host?type=…`.

---

## 3. Host page (/host) — No game yet (setup)

**When:** `!game` (no game created). User sees “Host a game”, progress 1–2–3, game type buttons.

### 3.1 Game type buttons (always visible)

| Button | Effect |
|--------|--------|
| Music Bingo | `setCreateMode('music-bingo')` — show prebuilt dropdown + “Create Music Bingo” |
| Classic Bingo | `setCreateMode('classic-bingo')` — “Create Classic Bingo” |
| **Trivia** | `setCreateMode('trivia')` — show **Trivia Room** panel (see 3.2) |
| Icebreakers | `setCreateMode('icebreakers')` — pack dropdown + “Create Icebreakers” |
| Edutainment | `setCreateMode('edutainment')` — pack dropdown + “Create Edutainment” |
| Team Building | `setCreateMode('team-building')` — pack dropdown + “Create Team Building” |

### 3.2 When createMode === **Trivia** (no game)

- **Copy:** “Run a verified Trivia pack with one room code…”
- **Primary button:** “Choose pack & host” → **`navigate('/host/create?trivia')`**
- **Secondary link:** “Build custom questions” → **`/host/build/trivia`**
- **No** pack dropdown; **no** “Create Trivia” button (old flow removed).
- **Bottom:** “← Back to home” → **`/`**

### 3.3 When createMode !== Trivia (no game)

- Pack dropdown (for icebreakers / edutainment / team-building) or prebuilt (music-bingo).
- **Primary button:** “Create [Music Bingo | Classic Bingo | Icebreakers | …]” → `handleCreate()` → `host:create` → game created (code-based).
- **Bottom:** “← Back to home” → **`/`**

**Checklist — Host (no game)**

- [ ] Open `/host` → see “Host a game” and game type buttons.
- [ ] Open `/host?type=trivia` → Trivia selected; “Choose pack & host” and “Build custom questions” visible; no pack dropdown.
- [ ] “Choose pack & host” → `/host/create?trivia` (pack step).
- [ ] “Build custom questions” → `/host/build/trivia`.
- [ ] “← Back to home” → `/`.
- [ ] Switch to Music Bingo → see “Create Music Bingo”; create → game with code (old flow).

---

## 4. HostCreateTrivia (/host/create) — Step tree

**Steps:** `type` → `pack` → `preview` → `options` → (socket) → redirect to `/room/:roomId?role=host`.

**Entry with `?trivia` or `?from=host`:** initial step is **`pack`** (skip `type`).

### Step: **type** (only when no ?trivia)

| Element | Action / Link |
|---------|----------------|
| “Trivia” button | `setStep('pack')` |
| “← Back to host” | **`/host?type=trivia`** |

### Step: **pack**

| Element | Action / Link |
|---------|----------------|
| Pack cards | `setSelectedPack(pack)` |
| **Back** (if fromHost) | **`/host?type=trivia`** (Link) |
| **Back** (if !fromHost) | `setStep('type')` (button) |
| “Preview pack” | `setStep('preview')` |

### Step: **preview**

| Element | Action / Link |
|---------|----------------|
| “Back” | `setStep('pack')` |
| “Load pack → Host options” | `setStep('options')` |

### Step: **options**

| Element | Action / Link |
|---------|----------------|
| “Back” | `setStep('preview')` |
| “Start hosting” | `handleStartHosting()` → `room:host-create` → on `room:created` → **`navigate('/room/${data.roomId}?role=host', { replace: true })`** |

**Checklist — HostCreateTrivia**

- [ ] Open `/host/create` (no query) → step “type” → “Trivia” → step “pack”.
- [ ] Open `/host/create?trivia` → step “pack” immediately; Back → `/host?type=trivia`.
- [ ] Pack → Preview → Options → Start hosting → redirect to `/room/:roomId?role=host`.
- [ ] Back from pack (when from host) → Host with Trivia selected.
- [ ] Back from type → `/host?type=trivia`.

---

## 5. Room page (/room/:roomId) — Role-based

**Query:** `?role=host` | `?role=player` | `?role=display` (default: player).

### 5.1 No roomId

- Message: “Missing room ID.”
- Link: **“Go home”** → **`/`** (hardcoded `href="/"`).

### 5.2 Error (e.g. room not found)

- Message: error text.
- Link: **“Go home”** → **`/`**.

### 5.3 Player, no stored identity (or different room)

- **PlayerJoinForm:** name input, “Join anonymously”, “Join room” button.
- On submit: save identity to localStorage, `room:join`, then snapshot → **PlayerPanel**.

### 5.4 Host (?role=host)

- **HostPanel:** room state, pack title, “Start ready check” / “Begin round” / “Reveal” / “Next” / “End room”, question preview, leaderboard.
- **No** “Back” or “Go home” link in current code (could add one to `/host` or `/`).

### 5.5 Player (?role=player, joined)

- **PlayerPanel:** question card, MC answer cards (or short answer etc.), lock/submit.
- **No** “Back” link in current code.

### 5.6 Display (?role=display)

- **DisplayPanel:** big question, 2×2 answer grid, reveal state.
- **No** “Back” link in current code.

**Checklist — Room**

- [ ] `/room/FAKEID` with no role → defaults to player; if no identity, join form.
- [ ] `/room/FAKEID?role=host` → HostPanel (and host rejoin with hostToken works after refresh).
- [ ] `/room/FAKEID?role=player` → after join, PlayerPanel; refresh reuses identity.
- [ ] `/room/FAKEID?role=display` → DisplayPanel.
- [ ] Missing roomId / error → “Go home” → `/`.

---

## 6. TriviaBuilder (/host/build/trivia)

| Element | Action / Link |
|---------|----------------|
| “← Back to host” (or similar) | **`/host`** |
| On “Create & host” (or equivalent) | `navigate('/host', { replace: true })` with game in sessionStorage (old Host flow) |

**Checklist — TriviaBuilder**

- [ ] Open from “Build custom questions” (Host or Home) → builder loads.
- [ ] Back → `/host`.

---

## 7. Host page — Game created (old flow: code-based)

**When:** `game` exists (Music Bingo, Icebreakers, etc. — **not** Trivia Room). Host sees tabs: Waiting room, Call sheet (or Host controls), etc.

| Element | Target / Behavior |
|---------|-------------------|
| “← The Playroom” | **`/`** |
| Join URL (copy / open) | `joinUrlForQR` → e.g. `/join/${game.code}` |
| “Open join link” (phone) | **`/join/${game.code}`** (same as QR) |
| “Open display” | **`/display/${game.code}`** (new tab) |
| “← Back” | **`/`** |

**Note:** Trivia **Room** flow does **not** use `game.code`; it uses `roomId` and `/room/:roomId?role=…`. So after “Start hosting” from HostCreateTrivia, the host is on **Room** (HostPanel), not on Host with a code.

---

## 8. End-to-end Trivia Room flow (one path)

Use this as a single run-through to confirm the full tree.

1. **Home** → “Host a room” → **Host** (`/host`).
2. **Host** → click **Trivia** → see “Choose pack & host” + “Build custom questions”.
3. **Host** → “Choose pack & host” → **HostCreateTrivia** (`/host/create?trivia`) at step **pack**.
4. **HostCreateTrivia** → select pack → “Preview pack” → **preview** step.
5. **HostCreateTrivia** → “Load pack → Host options” → **options** step.
6. **HostCreateTrivia** → “Start hosting” → socket `room:host-create` → `room:created` → redirect to **Room** (`/room/:roomId?role=host`).
7. **Room (host)** → HostPanel; “Start ready check” → “Begin round” → etc.
8. **Player:** open `/room/:roomId?role=player` (e.g. from QR) → join form → enter name or anonymous → **PlayerPanel**.
9. **Display:** open `/room/:roomId?role=display` → **DisplayPanel**.

**Checklist — E2E Trivia Room**

- [ ] Steps 1–6: no broken links; redirect to room with correct `roomId` and `role=host`.
- [ ] Step 7: host controls work; state updates.
- [ ] Step 8: player join and rejoin (refresh) work.
- [ ] Step 9: display shows question and answers; reveal works.

---

## 9. Links that must not break (quick list)

| From | To | How |
|------|-----|-----|
| Home | Host | Link `/host` |
| Home | Trivia play a pack | Link `/host/create?trivia` |
| Home | Trivia build custom | Link `/host?type=trivia` |
| Host (Trivia) | Pack flow | `navigate('/host/create?trivia')` |
| Host (Trivia) | Builder | Link `/host/build/trivia` |
| Host | Home | Link `/` |
| HostCreateTrivia (type step) | Host | Link `/host?type=trivia` |
| HostCreateTrivia (pack step, fromHost) | Host | Link `/host?type=trivia` |
| HostCreateTrivia (pack step, !fromHost) | Previous step | `setStep('type')` |
| HostCreateTrivia | Room (host) | `navigate('/room/${roomId}?role=host')` after create |
| Room (error / no id) | Home | `<a href="/">` |
| TriviaBuilder | Host | Link `/host` |

---

## 10. Optional improvements (not broken, just missing)

- **Room (HostPanel):** Add “Back to host” or “End & go home” → `/host` or `/`.
- **Room (PlayerPanel / DisplayPanel):** Optional “Leave room” → `/` or `/join`.
- **QR for Trivia Room:** Point to `/room/:roomId?role=player` (not `/join/:code`). Confirm host UI or display shows this URL/QR.

If you want, the next step can be adding the exact “Back” / “Go home” links to Room panels and ensuring the Trivia Room QR uses `/room/:roomId?role=player` everywhere.
