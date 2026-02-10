# Host and Music Bingo UX Cleanup — Verification Checklist

This checklist confirms that every item from the Host and Music Bingo UX cleanup plan is implemented and verified. Use it to ensure the site is at full capacity before release.

---

## 1. Music Bingo create flow — wording and selector

| Item | Status | Location / Notes |
|------|--------|------------------|
| Remove label "Pre-built game (optional)" | ✅ | Replaced with "Select your game" |
| Replace first option: drop "I'll build with Call sheet / AI" | ✅ | First option: "Build my own (add songs in Call sheet)" with `value=""` |
| Label "Select your game" (or equivalent) | ✅ | `host-create__label`: "Select your game" |
| Shorten hint | ✅ | "Pick a pre-built list (75 songs, one per artist) or build your own from the Call sheet tab. Export call sheet as CSV to print or laminate." |
| Shorten create copy (one line; optional CSV mention) | ✅ | "One link for everyone." / "One link for everyone. Add songs in the Call sheet tab after creating." |
| No change to logic (`selectedPrebuiltGameId ?? ''`, `musicBingoGames`) | ✅ | Unchanged |

---

## 2. Host room — tabs and removal of TV display block

| Item | Status | Location / Notes |
|------|--------|------------------|
| `HostTab` type includes `'event'` and `'print'` | ✅ | `HostTab = 'waiting' \| 'call' \| 'questions' \| 'controls' \| 'event' \| 'print'` |
| For Music Bingo (and Classic Bingo): 4 tabs (Waiting room, Call sheet, Event details, Print materials) | ✅ | `isBingo` → tabs with event + print |
| Trivia-like: 3 tabs (Waiting room, Host controls, Questions) — no Event/Print | ✅ | `isTriviaLike` → three tabs only |
| Event & venue details moved into `activeTab === 'event'` panel (no `<details>`) | ✅ | Full form in event tab |
| Print materials moved into `activeTab === 'print'` panel (no `<details>`) | ✅ | Full content in print tab |
| TV display & links block removed | ✅ | No "TV display" block in right column |
| Waiting tab: only "While players join" (mini-game, message, Start) — no Event/Print inside | ✅ | No `<details>` for Event or Print in waiting |

---

## 3. Left sidebar — share vs print separator

| Item | Status | Location / Notes |
|------|--------|------------------|
| Clear separator after "Share with players" block | ✅ | `<hr className="host-room__left-divider" />` then "Print this QR" section |
| Second zone: "Print this QR" (or equivalent) | ✅ | Section label: "Print this QR" |
| Print control: opens print-friendly window with QR + join URL | ✅ | Button "Open print view (QR + link)" opens new window with QR image and URL |

---

## 4. Call sheet CSV export

| Item | Status | Location / Notes |
|------|--------|------------------|
| Helper: CSV from `songPool` with header `Song Title,Artist`, quote-escape, download `call-sheet-{gameCode}.csv` | ✅ | `escapeCsvValue`, `downloadCallSheetCsv` in Host.tsx |
| Call sheet tab: "Export call sheet (CSV)" when `songPool.length > 0` | ✅ | Button above HostSongGrid with hint |
| Optional: same button in Print materials tab for Music Bingo | ✅ | In print tab when `game.gameType === 'music-bingo'` and `songPool.length > 0` |
| Client-side only; no backend change | ✅ | Blob + download in browser |

---

## 5. Pre-built Music Bingo games

| Item | Status | Location / Notes |
|------|--------|------------------|
| Mix it up / Variety — 75 songs, broad decades/genres | ✅ | `MIX_IT_UP` from combined slices; id `mix-it-up`, title "Mix It Up Variety" |
| Newer music — 2010s–2020s crowd-safe | ✅ | `NEWER_MUSIC`; id `newer-music`, title "Newer Music (2010s–2020s)" |
| TikTok / trendy — 75 songs, viral / TikTok-popular | ✅ | `TIKTOK_TRENDY`; id `tiktok-trendy`, title "TikTok & Trendy" |
| Each game: id, title, description, songs (75 via `uniqueArtists75`) | ✅ | All in `musicBingoGames` array |
| Schema and Host dropdown support any number of games | ✅ | `musicBingoGames.map` in select |

---

## 6. Optional: connection UX

| Item | Status | Location / Notes |
|------|--------|------------------|
| Show create form even while connecting (no blank "Connecting…" only) | ✅ | Early return removed; create form always shown when `!game` |
| Create button disabled until `connected` | ✅ | `canCreate = socket?.connected && ...` |
| Status: "Connecting to server…" when not connected | ✅ | Shown at top of create form when `!connected` |
| Optional timeout message (e.g. after 8–10 s) | ✅ | After 10 s: "Taking longer than usual. Check Railway status or refresh." |

---

## Out of scope (per plan)

- **UI source of truth:** Live site may be built from **music-bingo-app**; same changes can be mirrored there. This checklist applies to backend repo `frontend/` as reference.
- **Trailing slash:** Plan noted trailing slash is not the issue for connection; no change required.

---

## Quick verification commands

- **Build:** `cd frontend && npm run build` — must succeed.
- **Lint:** No errors in `Host.tsx`, `musicBingoGames.ts`.
- **Smoke:** Create Music Bingo → see 4 tabs; use Call sheet CSV export; use Print this QR; select pre-built "Mix It Up Variety", "Newer Music", "TikTok & Trendy".

---

## Last verified

- Checklist created and all items confirmed implemented in codebase.
- Connection UX (optional) implemented: form visible while connecting, button disabled, 10 s timeout message.
