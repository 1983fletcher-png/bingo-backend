# Music Bingo & Trivia — UX spec for the frontend

**Roll Call (waiting room):** The new maps and fixed marble game live in this repo’s `frontend/`. If your live site is built from **music-bingo-app**, run from this repo:
`./scripts/fix-roll-call-live.sh`  
(Or: `./scripts/sync-and-push-roll-call.sh /path/to/music-bingo-app` then push from that repo.)  
If you build and deploy from this repo’s `frontend/`, the new maps are already included.

---

## 1. Player (phone) — Bingo card

### Tiles
- **Bigger squares** so the card is easier to tap and read. Prefer fewer, larger cells (e.g. min 56px height, or responsive so each cell uses a good share of width).
- **Full song title visible:** Either larger type that fits, or **one line of title with horizontal scroll** (marquee or scroll-on-focus). No truncation that hides the end of the title unless there is a clear “read more” or scroll.
- **Tap-to-flip (opaque):**
  - **Front (default):** Song title only. Solid background, no transparency.
  - **Back (after tap):** Artist (or group) name only. Solid background. No song title on the back, no transparency.
  - Flip animation (e.g. 3D flip or slide) so it’s clearly “front vs back,” not a see-through overlay.
- **Marked/called state:** Clear visual when a tile has been called (e.g. checkmark, border, or dimmed) so players know which squares are “done.”

### Layout
- 5×5 grid. Optional “large text” or high-contrast mode from settings.
- Win condition line (e.g. “Get 5 in a row”) can sit below the grid or in a compact strip so the card stays prominent.

---

## 2. Host — Song grid / bingo call

### Grid
- **Cleaner layout:** One row per song (or card-style blocks) so the host can scan quickly. Avoid a single huge horizontal strip that’s hard to scan.
- **Search/filter:** A search box that filters the list by **song title** or **artist** so the host can type and jump to a song. Optional: sort by title (A–Z) or by order added.
- **Flipping tiles (same idea as player):**
  - **Front:** Song title only (saves space, easy to scan).
  - **Back (on tap/click):** Artist only. Solid; no transparency.
- **Reveal action:** Clear “Reveal” or “Call” control so the host marks a song as called and it syncs to players and display. The grid should still fit on one screen (or scroll vertically) so the host doesn’t have to scroll sideways to find songs.

### Bingo call sheet research
- Traditional call sheets list songs in a table (title, artist, sometimes number). Reuse that pattern: table or card list with columns (e.g. #, Title, Artist, Called). Search + sort make it easy to “hunt” for the next song.

---

## 3. Pop-up facts (song / artist tidbits)

- **When:** When the host reveals/calls a song, show a small **pop-up or strip** (e.g. below the grid or above the player card) with a short fact about the song or artist.
- **Source:** Frontend can call the backend:  
  `GET /api/song-fact?artist=...&title=...`  
  Returns `{ fact: string | null }`. Backend has a small static map; later this can be a DB or trivia API.
- **Content:** One sentence or two — “Pop-up video” style: interesting, non-offensive, and different per song/artist where possible (no same fact for every Madonna song).

---

## 4. Trivia — Expansion and host control

### More questions per pack
- Packs should support **20–30+ questions** (not only 10–12). Backend already accepts `questions: []` of any length; frontend should allow creating and loading larger packs.

### Host: select/deselect and build own pack
- In the **waiting room** (or pre-game setup), host can:
  - **Select/deselect** questions from a pack (e.g. checkboxes per question).
  - **Reorder** questions (e.g. drag-and-drop).
  - **Build a custom pack** by picking questions from multiple packs or adding new ones.
- Backend: when starting trivia, send the chosen `questions` array (order and selection). No change needed if the backend already accepts the full list.

### Music / TV / Movies trivia
- **Music trivia:** Packs by genre, decade, or theme (e.g. 80s hits, country, one-hit wonders). Same mechanics as general trivia; content is music-focused.
- **TV / Movies trivia:** Same mechanics. Packs by era, genre, or show/franchise. Plan for many packs and 20–40 questions per pack so hosts can run longer games or pick subsets.

---

## 5. Implementation notes (frontend)

- **Player card:** Use a single source of truth for “front vs back” (e.g. `flippedTileId` or per-tile `isFlipped`). Render front and back as two separate faces with solid backgrounds; use CSS transform for the flip so the back never shows through the front.
- **Host grid:** Prefer vertical scroll + search over one wide horizontal grid. Alphabetical (or “order of play”) sort plus search matches how hosts look up the next song.
- **Song fact:** On `game:revealed` (or equivalent), call `GET /api/song-fact?artist=...&title=...` and show the returned `fact` in the pop-up. If `fact` is null, hide the pop-up or show a generic line (e.g. “Great tune!”).

This repo (bingo-backend) holds the backend and this spec. The **music-bingo-app** repo implements the UI; use this doc when building or refactoring the player card, host grid, facts, and trivia flows.
