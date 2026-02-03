# Master Brief — Implementation Status

**Before push/commit/deploy:** This doc shows what is implemented vs what the Master Brief specifies. Use it to decide whether to ship as-is or implement gaps first.

---

## 1. Core product philosophy ✅

- Intentional, professional, playful, welcoming, trustworthy: reflected in design system and flows.
- Waiting room sets the tone: Roll Call is functional and non-broken.
- Logical mechanics, clean UI, cross-device, digital+analog support, expandability: architecture supports these.

**Status:** Aligned.

---

## 2. Roll Call waiting room game

| Requirement | Status | Notes |
|-------------|--------|--------|
| **2.1 Input** Mobile tilt, desktop Arrow+WASD, no vibration | ✅ Done | Tilt in RollCallGame/WaitingRoomTiltMaze; keyboard in RollCallGame; `navigator.vibrate(0)` in both. |
| **2.2 Physics** Top-down 2D, smooth accel/decel, no jitter, ball reset on fall | ✅ Done | Line-segment collision, friction, push-out; reset to start on fall/win. |
| **2.2 Ball look** Small, metallic/glossy, subtle glow | ⚠️ Partial | Ball is styled; “metallic/glow” could be strengthened. |
| **2.3 Five logical mazes** Clear start/goal, 1–2 turns, no trap, readable on phone | ✅ Done | 6 data-driven mazes (S-Curve, Music Note, Question Mark, Open Maze, Roundabout, Gentle Slope). Names differ from brief (Classic Box, Spiral, Zig-Zag, Crossway, Offset Rings) but behavior matches. |
| **2.4 SVG-based, data-driven, collision on boundaries** | ⚠️ Partial | Mazes are data-driven (line segments), collision respects walls. Not SVG paths; canvas-based. |
| **2.5 Rotatable, image overlays** | ❌ Not done | Not implemented. |

**Summary:** Core Roll Call (input, physics, mazes, no vibration) is in place. Gaps: stronger ball styling, optional SVG/overlay work later.

---

## 3. Music Bingo — big display (TV / projector)

| Requirement | Status | Notes |
|-------------|--------|--------|
| **3.1 Layout** Full-screen grid, all bingo calls, tile = song title (primary) + artist (secondary, revealable) | ⚠️ Partial | Full-screen grid exists. Tiles show full “Artist — Song”; no title-primary / artist-secondary reveal. |
| **3.1** High contrast, day + night mode | ✅ Done | Uses design system (theme); readable. |
| **3.2** Timeless typography, generous spacing, no clutter | ✅ Done | Clean display layout. |
| **3.3 Idle** Bingo ball / music note token moves playfully (Plinko-style) | ❌ Not done | No moving token on the display. |
| **3.3 On call** Token animates to selected tile → tile marks “called,” locks | ❌ Not done | No token animation; tiles do highlight when revealed. |

**Summary:** Display layout and styling are in good shape. **Call animation system (idle token + token-to-tile animation) is not implemented.**

---

## 4. Host screen (control view)

| Requirement | Status | Notes |
|-------------|--------|--------|
| **4.1** Select songs manually | ✅ Done | Host taps song to reveal. |
| **4.1** Randomize next song | ❌ Not done | No “randomize next” button; host picks from grid only. |
| **4.1** Control timing | ✅ Done | Reveal delay 0 / 10 / 15 s. |
| **4.1** Marking: auto vs manual | ⚠️ Partial | Reveal auto-updates players. No explicit “manual marking only” mode. |
| **4.2** No copyrighted playback; host uses VD/Spotify/Apple; configurable delay | ✅ Done | Documented flow; delay options exist. |

**Summary:** Host can select and time reveals. **Missing: “Randomize next song”** (pick an unrevealed song at random).

---

## 5. Digital + analog hybrid bingo

| Requirement | Status | Notes |
|-------------|--------|--------|
| Song-to-bingo-number mapping (B1, N42, etc.) — consistent, predictable | ❌ Not done | Cards use song titles only; no B-I-N-G-O column + number mapping for hybrid physical/digital. |

**Summary:** **Song-to-bingo-number mapping is not implemented.** Needed for reusable physical cards and “call by number” later.

---

## 6. Printable bingo cards (host tool)

| Requirement | Status | Notes |
|-------------|--------|--------|
| **6.1** US Letter, 2 per page, optional 1 per page | ⚠️ Partial | 2 per page done; no UI for “1 per page.” |
| **6.2** Two 5×5 grids, fill page, spacing, B&W, readable | ✅ Done | Implemented. |
| **6.3 Header** Game title, venue name, optional date, **website URL** | ⚠️ Partial | Game title in header. Venue name, date, and **website URL not** in print output. |
| **6.4** Branding clean, professional | ✅ Done | Clean, minimal. |
| **6.5 Host inputs** Venue, game title, subtitle, card count (1 or 2) | ⚠️ Partial | Title from eventConfig; venue available in app but not passed to print. No subtitle; no 1 vs 2 per page option. |

**Summary:** Print is usable and professional. **Gaps: header (venue, date, website URL), optional 1-per-page, subtitle.**

---

## 7. Tech stack ✅

- Modern web, components, responsive, performance-conscious. Matches brief.

---

## 8. Version / build ID ✅

- Version and build time in footer; bump `package.json` on release. Implemented.

---

## Summary: implement before deploy?

| Area | Safe to ship? | If you want “brief complete” first |
|------|----------------|-------------------------------------|
| Roll Call | ✅ Yes | Optional: ball styling; maze names/overlays later. |
| Display | ⚠️ Partial | Add: **call animation** (idle token + token-to-tile on reveal). |
| Host | ⚠️ Partial | Add: **“Randomize next song”** button. |
| Digital/analog | ❌ No | Add: **song → bingo number mapping** (foundation only is enough for “implemented”). |
| Print | ⚠️ Partial | Add: **header** (venue, date, website URL); optional 1-per-page + subtitle. |

**Recommendation**

- **Ship now:** You can push/commit/deploy as-is. Roll Call, host flow, display layout, and print are usable; only the call animation, randomize, bingo-number mapping, and print header are missing or partial.
- **Implement gaps first:** If you want the Master Brief fully reflected before deploy, the highest-impact items are:
  1. **Display call animation** (idle token + animate to tile on call).
  2. **Host “Randomize next song.”**
  3. **Print header** (venue, optional date, website URL).
  4. **Song-to-bingo-number mapping** (design + minimal implementation for hybrid).

Use this status when deciding to deploy or to do one more pass on the brief.
