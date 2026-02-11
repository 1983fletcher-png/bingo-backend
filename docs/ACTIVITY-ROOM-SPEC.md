# PLAYROOM — ACTIVITY ROOM MODULE (Dev Handoff Spec v1)

**Owner:** Jason / Playroom  
**Goal:** Replace "Host a Room" with a new **Activity Room** that powers events, activities, training, and testing via kits + game shows + printables + insights.

---

## 0) North Star

Activity Room is the one hub people use to:

- **Plan** what to do (fast, guided)
- **Run** it live (TV + host + players)
- **Print** what they need (single-page or compiled bundles + lamination masters)
- **Learn & improve** (optional insights + local library)

**Primary audiences (v1):**

1. Brewery/Venue  
2. Senior Activities (incl. memory care lens)  
3. School  
4. Corporate  
5. Sensory-Friendly / Accessible (preset)

---

## 1) Information Architecture (IA) / Navigation

### Replace "Host a Room" with **Activity Room**

Activity Room becomes the parent home for:

- Music Bingo  
- Bingo  
- Trivia  
- Icebreakers / Team building  
- Game Shows  
- Stations / Brackets / Memory Spark packs  

### Activity Room Top Nav

1. **Build Tonight** (wizard)  
2. **Kits Library**  
3. **Game Shows**  
4. **Printables**  
5. **Insights**  
6. **Library** (saved packs; org-private; optional share workflow)

---

## 2) Three-View Architecture (Core Requirement)

All interactive experiences share the same 3 views:

### A) TV / Display View (non-interactive)

- Default target: **16:9**
- Supports **Portrait signage mode** (layout variants/reflow, not simple rotation)
- Display is a **page stack** with stable checkpoint IDs for Back/Next/Jump.

### B) Host View (control center)

- Laptop/tablet first; phone usable for basic flow
- Includes a global **Transport Bar** (Back/Next/Jump/Pause)
- Includes persistent top-right previews:
  - **Player View preview thumbnail** + status badges
  - **TV View preview thumbnail** + status badges
  - Click to expand overlay.

### C) Player View (phones)

- One scan joins the **entire session**
- Silent rejoin after refresh/tab close
- Standby screen when host is reviewing/backing up

---

## 3) Sessions, QR, Persistence

### Session QR (default)

- One QR per session; scanning joins the "room" for the full event.
- Late joiners can join anytime; if host is in Play state, they submit on the **next prompt**.

### QR visibility rules

- During **Collect** pages: QR is prominent
- During **Play/Reveal** pages: QR can be minimized/hidden (host toggle)

### Optional: Permanent Host/Venue QR (v1 optional; ok to stub)

- Stable QR that routes to "Join my current session"
- Requires host to "Start Session" so permanent QR points to active session
- Great for printed signage / classrooms

### Rejoin behavior

- Auto rejoin silently (no confirmation by default)
- (Optional host setting later: rejoin confirmation for shared devices/testing environments)

---

## 4) Identity + Moderation (Critical)

### Identity Modes (host-selectable per session)

1. **Fun Nicknames (default)**  
   - Auto-generated 2–3 word names (e.g., "Silly Goose")  
   - Optional custom edit (filtered)

2. **Roster / ID Mode**  
   - Require: real name, student ID, employee ID (supports long IDs)  
   - Designed for tests/training/attendance

3. **Hybrid Mode (recommended for School preset)**  
   - Capture real ID (host-only)  
   - Display nickname publicly (anti-shame / incognito)  
   - Player can optionally toggle whether they see their real name on their own device UI.

### Moderation Profiles (host-visible toggle)

**Non-negotiable ALWAYS blocked (all profiles):** Hate / Harassment / Threats / Violence

**Profiles:**

- **All-Ages (default for School + Corporate):** blocks profanity + sexual explicit + non-negotiables  
- **Adults-Only:** allows profanity + sexual explicit; still blocks non-negotiables  
  - First enable warning: "May display adult language on screen."

### Host Approval Queue (optional per session; recommended for School)

- Names don't appear on TV until approved
- Actions: Approve / Regenerate / Replace (Player #) / Remove

**IMPORTANT:** Do NOT show a "bad words list" in UI. Only show profile toggles and general rejection reasons.

---

## 5) Presets (Defaults Pack)

Presets apply defaults to visuals, pacing, identity, scoring, and printables:

1. **Brewery / Venue** — Flashy default; Fun nicknames; Join count visible on Host; TV join overlay toggle; Insights encouraged  
2. **Senior Activities** — Calm mode suggested; Large text, slower pacing; No-score default; Printables emphasized  
3. **School** — Hybrid identity default; Host approval recommended; Assessment mode available  
4. **Corporate** — All-Ages default; Corporate skin option; Insights + exports emphasized  
5. **Sensory-Friendly / Accessible** — Calm mode ON by default; Reduced motion + reduced audio + slower pacing; No-score default + practice round option  

---

## 6) Build Tonight Wizard (Primary UX Path)

**Purpose:** guide stressed hosts quickly without overwhelm.

**Flow:**

1. Choose preset  
2. Choose duration (10/30/60/90)  
3. Choose format: Game Show / Trivia / Stations / Bracket / Memory Spark / Assessment  
4. Select materials you have (checkboxes)  
5. **Output:**  
   - Recommended kits (1–3)  
   - Run of show  
   - Printables (single or compiled)  
   - Host tips  
   - Start Session (TV link + QR + host controls)

---

## 7) Game Show Engine (Primitives)

All shows are built from:

- **Prompt**
- **Response type** (short phrase / multiple choice / ranked / numeric / A/B / free text later)
- **Aggregation** (counts / clustering / percent / median / top-N)
- **Reveal** (board / list / chart)
- **Scoring** (optional)
- **Round flow** (collect → lock → reveal)
- **Outputs** (printables + insights + exports)

---

## 8) Phase-1 Game Shows (Implement These First)

### 8.1 Survey Showdown (Feud) — Flagship

**Inputs:** Short phrase; 1–3 answers per player per prompt  

**Clustering:** Auto-merge default; Host audit drawer: show raw answers, split/merge/remove; Explain merge: show which raw answers got grouped  

**Board:** Default: Top 8; Points: frequency-based default; simplified/no-score optional  

**Decision Funnel option:** Top 8 → vote to Top 4 → vote to Top 2 → A/B final  

**Deliberation Loop option:** Vote → Discuss → Vote again → Compare  

#### Feud Display Page Stack (checkpoints)

- `[R#_TITLE]`
- `[R#_COLLECT]` (prompt + QR; join count optional overlay)
- `[R#_LOCKED]` (optional)
- `[R#_BOARD_0]` (all hidden)
- `[R#_BOARD_1..8]` (reveal steps)
- `[R#_SUMMARY]`
- `[STANDBY]` (between rounds or when host rewinds)

#### Feud Visual Direction (v1): Retro TV Studio + Flip-Plate (Hinge Down)

- Warm studio vibe, stage framing, subtle chrome accents, readable at distance  
- Reveal animation: plate hinges down to reveal answer + points  
- Optional shimmer sweep on revealed text (disabled in Calm)  
- Strike X animation cue  

**Cascade/Drop effects (Theme Toggle v1):**  
- "Cascade": top plates visually settle into below slot  
- "Bottom drop": bottom row plates can "break hinge and fall"  
- Default: OFF (turn ON for venues; OFF for schools/seniors/calm)

**Player experience when host goes back:** Standby: "Host reviewing — next question starting soon."

**Host Controls (Feud):** Transport bar; Open submissions / Lock; Reveal 1–8; Strike X; Award points / toggle scoring; Funnel controls; Merge/audit drawer  

### 8.2 Estimation Show (Price Guess)

**Inputs:** Numeric (int/decimal) + optional units label  

**Scoring:** Default: closest overall; Option: closest without going over  

**Correct value:** Host supplies (manual lookup; optional source note)  

**Media:** Host-provided image per prompt (upload / URL later)  

**Pages:** Title → Collect → Locked → Distribution chart → Correct reveal → Summary  

**Printables:** Prompt cards; Answer sheets (no phones); Score sheets; Units cheat sheet (optional)  

### 8.3 Category Grid (Jeopardy-Style)

**Modes:** Teams OR Individual OR Hybrid  

**Grading:** Auto-grade for MC + numeric (v1); Free text grading later  

**Pages:** Board → Clue → Lock → Reveal → Back to Board  

**Printables:** Category board; Host clue sheets; Team/individual answer sheets; Study guide export (later)  

---

## 9) Transport Bar (Global UI Requirement)

Present on all Host View screens:

- **Back** (Default: Display Only; safe)  
- **Next**  
- **Pause/Resume**  
- **Jump to…** (major checkpoints)  
- **Reset Round** (confirm)  
- **End Session** (confirm)  

**Power option (secondary, confirm):** Back + Edit (reopen submissions / rerun clustering / revert scoring)  

**Also:** Replay last reveal; Replay round summary  

---

## 10) Waiting / Standby

Player standby when host is reviewing:

- Simple card: "Host reviewing — next question soon."
- (Future: replace/augment with a mini waiting-room activity)

---

## 11) Printables + Lamination System

- **Single selection** → single PDF download  
- **Multiple selections/stations** → compiled "Tonight's Kit" PDF  

**Printable types:** Run-of-show (1 page); Host script + prompt cards; Score sheets; Survey cards (no phones); Reveal "X" cards; Category board sheets; Answer sheets (assessment/no phones); Lamination set: masters + storage labels  

---

## 12) Insights + Local Library

**Save policy:** Default: aggregate-only; Optional: full session dataset (org-private)  

**Tonight's Takeaways:** Top answers; Emerging ideas; Suggested next kits (mycelium); Export: PDF summary + CSV  

**Local Library:** Org-private by default; Share-to-community is opt-in and reviewed by owner/admin (Jason) before public  

---

## 13) Audio System (Licensed, Safe)

- Sound on/off + volume  
- Audio profiles: Playroom Classic / Calm / Corporate  
- Per-game cue mapping  

**Cue categories:** UI click/confirm; Join/submit; Timer start/warn/end; Reveal ding; Correct/incorrect; Strike buzz; Round stinger; Win sting  

**Asset requirements:** Store license metadata per sound; Serve via CDN/object storage (e.g., Cloudflare R2/CDN) with manifest  

---

## 14) Theming System

**Initial themes:** Playroom Classic (Retro TV Studio); Calm; Corporate  

**Theme controls:** Background chrome/texture; Accent color; Animation intensity (Calm disables shimmer/cascade/drop); Audio profile mapping; Large print options  

---

## 15) Assessment Mode Overlay

Not a separate product; a mode overlay for Price/Jeopardy/Quiz and some Feud variants:

- Identity: Roster or Hybrid  
- Auto grading: MC + numeric (v1)  
- Export: per-person results + aggregate analytics (v1 basic; expand later)  

---

# TODO LIST (Dev Checklist)

## Phase 0 — Shell + Session Foundation

- [x] Replace "Host a Room" with "Activity Room" shell + nav  
- [x] Implement Session creation + Session QR join flow  
- [x] Implement Player silent rejoin persistence (localStorage/cookie + server session mapping)  
- [x] Implement three-route view system: /host, /display, /player  
- [x] Implement Host top-right preview panes for TV + Player with status badges  
- [x] Implement Transport Bar (Back/Next/Pause/Jump/Reset/End) with page stack backing  
- [x] Implement Standby page for players during host review  

## Phase 1 — Survey Showdown (Feud MVP)

- [x] Implement Feud round page stack + checkpoint IDs  
- [x] Implement Collect state (prompt + QR, join count on host; TV overlay toggle)  
- [x] Implement Lock submissions  
- [x] Implement clustering engine (auto-merge) + host audit drawer (raw answers, merge/split/remove)  
- [x] Implement Board (Top 8) with hinge-down flip-plate reveal  
- [x] Implement Strike X  
- [x] Implement Replay last reveal + Replay round summary  
- [x] Implement scoring modes: frequency default + simplified + no-score  
- [x] Implement theme toggles: Cascade and Bottom Drop (default OFF; obey Calm)  
- [x] Implement Back (Display Only) behavior across checkpoints  

## Phase 2 — Customization + Themes + Audio Base

- [x] Implement prompt builder (blank slate wizard) for Feud prompts  
- [x] Implement theme system (Playroom Classic / Calm / Corporate)  
- [x] Implement animation intensity mapping; Calm disables shimmer/cascade/drop  
- [x] Implement audio system (on/off, volume, profile selection)  
- [x] Implement audio cue map for Feud (flip, ding, buzz, stinger, etc.)  
- [x] Implement asset manifest for audio licensing metadata  

## Phase 3 — Printables + Insights + Library

- [x] Implement single PDF download for a single kit selection  
- [x] Implement compiled "Tonight's Kit" PDF builder for multi selections  
- [x] Implement lamination masters + storage labels  
- [x] Implement Tonight's Takeaways (Top answers, emerging ideas, recommended kits)  
- [x] Implement export: PDF summary + CSV  
- [x] Implement Local Library (org-private saved packs/sessions)  
- [x] Implement Share-to-community submission queue (admin moderation)  

**Implementation note:** Single PDF is fully working (Feud prompt card; print/PDF). Tonight's Kit, lamination, Takeaways, export, Library, and Share-to-community have UI and flow in place with "coming soon" behavior until backend/export logic is added.  

## Phase 4 — Estimation Show

- [ ] Implement Estimation Show prompt type (numeric + units)  
- [ ] Implement prompt image upload (v1 local upload)  
- [ ] Implement correct value entry + optional source note  
- [ ] Implement results distribution display + winner logic  
- [ ] Implement scoring mode toggle (closest overall default; closest w/o over optional)  
- [ ] Implement printables for no-phone mode  
- [x] Game type + create path + Display/Player placeholders (shell in place)

## Phase 5 — Category Grid (Jeopardy-Style)

- [ ] Implement category grid builder + board UI  
- [ ] Implement clue view + lock + reveal  
- [ ] Implement team/individual/hybrid modes  
- [ ] Implement auto grading for MC + numeric (free text later)  
- [ ] Implement printables for board/clues/answers  
- [ ] Implement audio cues (selectable profile)  
- [x] Game type + create path + Display/Player placeholders (shell in place)

## Phase 6 — Presets + Sensory-Friendly

- [x] Implement preset defaults application (brewery/senior/school/corporate/sensory-friendly)  
- [x] Implement sensory-friendly defaults (calm ON, slower pacing, no-score default, practice round option)  
- [x] Implement host tips per preset (v1 text)  

---

# Audit (pre–full implementation)

Verified before full Estimation/Jeopardy implementation:

- **Phase 0:** Activity Room shell (Home card → /activity), nav (Build Tonight, Kits, Game Shows, Printables, Insights, Library). Session create + QR join; rejoin via sessionStorage; routes /host, /display/:code, /join/:code, /player/:code. Host preview iframes (Player + TV) with ● Live badges. TransportBar (Back, Next, Pause, Jump, Reset round, End session) with confirm dialogs. StandbyCard + FeudDisplay standby message.
- **Phase 1:** Feud checkpoints (STANDBY, R1_TITLE, R1_COLLECT, R1_LOCKED, R1_BOARD_0..8, R1_SUMMARY). Collect (prompt + QR); join/submission count on host. Lock + clustering (top 8); audit drawer (raw answers list). Board hinge-down reveal; Strike X; Replay last reveal + Replay round summary. Scoring: frequency, showScores toggle (host + preset noScore), backend `feud:set-show-scores`. Cascade/Bottom Drop toggles + `feud:set-effects`. Back → STANDBY. Transport: Reset round (→ STANDBY), End session (confirm → navigate /activity).
- **Phase 2:** Prompt ideas + input; theme system (classic/calm/corporate) + Display theme in Event config; Calm → calmMode (no shimmer/cascade/drop). Audio: lib (getStoredAudioSettings, saveAudioSettings, playFeudCue stub) + UI in FeudHostPanel (on/off, volume, profile). Cue map + asset manifest (audioManifest.ts).
- **Phase 3:** Single PDF working (Feud prompt card). Tonight's Kit, lamination, Takeaways, export, Library, Share: UI + “coming soon” (see note above).
- **Phase 4–5:** Game types + create path + Display/Player placeholders only.
- **Phase 6:** Presets (activityPresets.ts), Build Tonight step 1, apply displayThemeId + noScore at create, host tips per preset.

---

# Notes / Non-Goals (v1)

- Do NOT scrape Amazon/Walmart/etc. for live prices (v1). Host enters correct/current value.  
- Do NOT ship copyrighted meme images as default content. Allow host uploads later with rights acknowledgment.  
- Emoji rounds are allowed but should render using a licensed emoji set (e.g., Twemoji) with required attribution in legal/about (v2).  

---

*End of Activity Room Module Spec v1*
