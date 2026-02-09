# Trivia Script Audit Report

Audit of **docs/HOST-ROOM-FLOW-SCRIPT.md** and **docs/TRIVIA-ROOM-IMPLEMENTATION.md** against the codebase. Done after the “six to-dos” and panel extraction.

---

## 1. Route table (App.tsx) — **Match**

| Path | Script | Actual |
|------|--------|--------|
| `/` | Home | ✅ |
| `/host` | Host | ✅ |
| `/host?type=trivia` | Host (createMode trivia) | ✅ |
| `/host/create` | HostCreateTrivia | ✅ |
| `/host/create?trivia` | HostCreateTrivia, step pack | ✅ |
| `/host/build/trivia` | TriviaBuilder | ✅ |
| `/room/:roomId` | Room (role from query) | ✅ |
| `/join`, `/join/:code` | JoinEntry, Play | ✅ |
| `/display/:code` | Display | ✅ |

---

## 2. Home (/) — **Match**

- Hero: “Host a room” → `/host`, “Join a room” → `/join`, Creative Studio → `/create`, Learn & Grow → `/learn`. ✅
- Nav: Activity calendar → `/calendar`. ✅
- Game types: Music Bingo → `/host?type=bingo`, **Trivia “Play a pack”** → `/host/create?trivia`, **Trivia “Build custom”** → `/host?type=trivia`. ✅
- Icebreakers / Edutainment / Team Building / Custom Training → correct `/host?type=…`. ✅

---

## 3. Host (/host) — No game — **Match**

- Game type buttons (Music Bingo, Classic Bingo, Trivia, etc.) set createMode. ✅
- When createMode === Trivia: copy, “Choose pack & host” → `navigate('/host/create?trivia')`, “Build custom questions” → `/host/build/trivia`, no pack dropdown. ✅
- “← Back to home” → `/`. ✅

---

## 4. HostCreateTrivia (/host/create) — **Was wrong; fixed**

**Script:** Steps type → pack → preview → options → **room:host-create** → **room:created** → **redirect to /room/:roomId?role=host**.

**Before audit:** HostCreateTrivia used **host:create** and **game:created** and redirected to **/host** (old code-based flow).

**Changes made:**

- **Socket:** Listen for **room:created** (not game:created). On **room:created**: save host token with same key as Room (`playroom_room_host`), then `navigate('/room/${data.roomId}?role=host', { replace: true })`.
- **Create:** **handleStartHosting** now emits **room:host-create** with `{ pack: selectedPack, settings }` (full TriviaPackModel). Removed host:create and packToHostCreateQuestions for this flow.
- Step tree (type → pack → preview → options) and Back links (pack fromHost → `/host?type=trivia`, etc.) were already correct.

---

## 5. Room (/room/:roomId) — **Match**

- No roomId → “Missing room ID” + “Go home” → `/`. ✅
- Error → error text + “Go home” → `/`. ✅
- Player, no identity → PlayerJoinForm; submit → save identity, room:join → PlayerPanel. ✅
- Host → HostPanel (state, controls, question, leaderboard). ✅
- Player (joined) → PlayerPanel. ✅
- Display → DisplayPanel. ✅
- Role default: player when no `?role=`. ✅

---

## 6. TriviaBuilder (/host/build/trivia) — **Match**

- “← Back to host” → `/host`. ✅

---

## 7. Host — Game created (old flow) — **Match**

Script describes code-based games (Music Bingo, etc.): join URL `/join/${game.code}`, display `/display/${game.code}`. Trivia **Room** does not use game.code; it uses roomId and Room page. No change needed.

---

## 8. E2E Trivia Room flow — **Now correct**

1. Home → Host a room → Host. ✅  
2. Host → Trivia → “Choose pack & host” + “Build custom questions”. ✅  
3. “Choose pack & host” → HostCreateTrivia at step pack. ✅  
4. Select pack → Preview. ✅  
5. “Load pack → Host options” → options. ✅  
6. **“Start hosting” → room:host-create → room:created → redirect to /room/:roomId?role=host.** ✅ (fixed)  
7. Room (host) → HostPanel; Start ready check → Begin round → etc. ✅  
8. Player: `/room/:roomId?role=player` → join form → PlayerPanel. ✅  
9. Display: `/room/:roomId?role=display` → DisplayPanel. ✅  

---

## 9. Links that must not break — **Match**

All listed links verified; HostCreateTrivia → Room (host) now implemented as above.

---

## 10. Optional (script says “not broken, just missing”)

- **Room HostPanel:** “Back to host” or “End & go home” → `/host` or `/`. Not implemented; script optional.
- **Room Player/Display:** “Leave room” → `/` or `/join`. Not implemented; script optional.
- **QR for Trivia Room:** **Done.** Join URL and QR now use **`/room/:roomId?role=player`** (updated in HostPanel).

---

## TRIVIA-ROOM-IMPLEMENTATION.md — File map & events

- File map: HostPanel, PlayerPanel, DisplayPanel in `components/trivia-room/` (done in prior work). ✅
- Realtime events: room:join, room:host-create, room:host-set-state, room:host-next, room:host-toggle-setting, room:submit-response, room:host-dispute-resolve; server sends room:snapshot, room:error, room:created. ✅ (No separate room:host-reveal; host uses room:host-set-state with nextState REVEAL.)

---

## Summary

| Item | Status |
|------|--------|
| Routes, Home, Host (no game), Room, TriviaBuilder | Already matched script |
| **HostCreateTrivia → Room flow** | **Was wrong; now uses room:host-create + room:created → redirect to /room/:roomId?role=host** |
| **Room join URL / QR** | **Now includes ?role=player** |
| Optional “Back” / “Leave room” on Room | Not implemented (optional) |

**Conclusion:** The only **required** deviation from the script was HostCreateTrivia still using the old code-based flow (host:create → game:created → /host). That is now aligned with the script: room:host-create → room:created → save host token → redirect to Room. Join URL/QR now explicitly use `?role=player` as recommended.
