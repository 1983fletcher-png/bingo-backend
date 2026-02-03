# Cursor Master Brief — Playroom Platform

**Roll Call, Music Bingo, Display & Print Systems**

---

## 1. Core product philosophy

This platform must feel:

- **Intentional**
- **Professional**
- **Playful but not childish**
- **Welcoming to all ages**
- **Trustworthy from the first interaction**

**The waiting room experience sets the tone.** If the waiting room feels broken, users will not trust the rest of the system.

This build prioritizes:

- Logical game mechanics
- Clean, timeless UI
- Cross-device compatibility
- Digital + analog hybrid play
- Expandability without rewrites

**No feature should feel hacked together.**

---

## 2. Roll Call waiting room game (“Ball Tilt” / “Roll Call Maze”)

**Purpose:** A short, satisfying, low-friction interactive experience while players join. Not a hardcore game — a confidence builder and delight moment.

### 2.1 Input system (must “just work”)

- **Mobile / tablet:** Device tilt (gyroscope)
- **Desktop / laptop:** Keyboard (Arrow Keys + WASD); mouse/trackpad optional fallback
- **No vibration / haptic feedback** (explicitly disabled)

### 2.2 Physics & ball behavior

- Top-down 2D physics
- Smooth acceleration + deceleration; no jitter, no vibration
- Ball: small relative to maze; metallic/glossy; subtle glow/twinkle (delight, not distracting)
- Reset: if ball falls off or hits fail zone → reset to start cleanly

### 2.3 Maze design requirements (critical)

- **5 actual, logical mazes.** Each must:
  - Have a clear start and reachable goal
  - Have at least 1–2 meaningful turns
  - Never trap the ball permanently or block the goal
  - Be readable on a phone screen
- Difficulty: light challenge by default; optional variants (very easy, medium)

### 2.4 Maze architecture (technical)

- Mazes are **SVG-based**
- Walls = paths/polygons; collision logic respects SVG boundaries
- **Data-driven** layouts, not hard-coded
- Each maze: fits square play area, rotatable, supports image overlays (themes, venue logos)

### 2.5 Initial maze set (V1)

1. **Classic Box Maze** — straight corridors, one central turn  
2. **Spiral Path** — inward or outward spiral  
3. **Zig-Zag Corridor** — timing + control focus  
4. **Crossway Maze** — choice-based pathing  
5. **Offset Rings** — circular movement with gaps  

(SVG art overlays can later suggest music, brains, DNA, etc., without breaking logic.)

---

## 3. Music Bingo — big display (TV / projector view)

**Purpose:** Passive, cinematic, authoritative, beautiful. Like a modern bingo hall, not an app dashboard.

### 3.1 Display layout

- Full-screen Bingo Caller Grid; all current bingo calls
- Each tile: Song title (primary), Artist (secondary, revealable)
- High contrast, readable from across the room; day + night mode

### 3.2 Visual style

- Timeless, classy typography; generous spacing; subtle animations
- No clutter, no tiny UI elements; first-class on a projector

### 3.3 Call animation system

- **Idle:** A bingo ball / music note token moves playfully around the grid (Plinko-inspired, random and lively)
- **When host selects or randomizes a song:** Token animates across grid → lands on selected tile → tile animates, marks as “called,” locks visually
- Animation: intentional and smooth, not gimmicky

---

## 4. Host screen (control view)

**Purpose:** Command center, not the display.

### 4.1 Host capabilities

- Select songs manually (build vibe / dance set)
- Randomize next song
- Control timing
- Marking: auto-mark player cards or manual player marking

### 4.2 Music playback workflow

- **Platform does not play copyrighted music directly.**
- Flow: Host selects/randomizes song → bingo call happens visually → host switches to Virtual DJ / Spotify / Apple Music → song plays → host returns to Playroom. System allows configurable delay (e.g. 5–10 s) and keeps visuals in sync.

---

## 5. Digital + analog hybrid bingo system

- Supports: fully digital, fully physical, hybrid (preferred)
- **Song-to-bingo-number mapping:** Each song maps to a bingo-style call number so digital cards, printed cards, and reusable physical cards can align. Mapping must be **consistent and predictable**.

---

## 6. Printable bingo cards (host tool)

- **Purpose:** Professional, ink-friendly, marketing
- **Paper:** US Letter (8.5 × 11); default 2 cards per page; optional 1 per page
- **Card design:** Two true 5×5 grids; fill page cleanly; proper spacing; black & white default; high readability
- **Header (top of page):** Game title, venue name, optional date, **website URL** (clear, readable) — paper → digital traffic
- **Branding:** Clean, subtle, balanced with readability; professional, not ad-like
- **Host inputs:** Venue name, game title, optional subtitle, card count (1 or 2 per page)

---

## 7. Tech stack expectation

- Modern web stack; component-based; SVG + Canvas hybrid where appropriate
- Responsive-first; performance-safe for projectors and mobile
- **Choose efficient and maintainable, not trendiest.**

---

## 8. Non-negotiable quality bar

- No unreachable goals, no broken logic, no visual chaos, no frustrating interactions
- No “good enough”
- Should feel: **“Wow. This is polished.”** — even in the waiting room.

---

## Final note to Cursor

Build this as a **clean foundation**, not a throwaway prototype. Everything must be logical, testable, extendable. Themes, animations, and art styles will expand later — **core mechanics must be rock solid now.**
