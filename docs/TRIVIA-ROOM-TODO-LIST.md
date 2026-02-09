# Trivia room — to-do list (from host/player walkthrough)

Summary of what you asked for and what’s done vs left.

---

## Done

1. **Pack picker tiles** — Text was white on white until selected. Fixed: unselected tiles use dark text (`#111`) on white; selected tiles use white text on red. Labels are visible before and after click.

2. **Skip Preview pack step** — Removed. Flow is now: **Pack picker → Start hosting** (no preview, no separate “Host options” step). Options (leaderboard, MC tips, auto-advance) live on the host room page.

3. **Scoring / leaderboard after reveal** — Backend now:
   - Accepts **late locks**: if a player locks their answer after the host clicks Reveal (same question), the response is still graded so the leaderboard updates.
   - **Replace on change**: if a player submits again for the same question (e.g. they change their answer), the previous response is removed and the new one is graded; last submission before reveal wins.
   - Submissions are graded on submit and snapshot is broadcast to the whole room. Players can **change their answer until the host reveals** (no lock).

4. **Leaderboard updates when players join** — When anyone joins the room, the backend now broadcasts **room:snapshot** to the **whole room** (not just the joiner). So the host and other players see the updated player list and leaderboard as soon as someone joins.

5. **Anonymous name generator** — Expanded the list with many more options (e.g. Wobbly Noodle, Captain Crunch, Sassy Badger, Cheese Wizard, Dancing Pickle, Cosmic Koala, etc.) so there are more varied names.

---

## Done (this pass)

6. **Host page aligned with bingo/icebreakers** — Trivia host room should match the standard host page: one place for QR, room code, join URL (clickable), display mode, TV mode, “simulate player” button, and all options (leaderboard, MC tips, auto-advance) on that page. This is a larger UI pass to bring trivia host in line with the other games.

7. **Host trivia page layout** — Consolidate QR, room code, and “players join” section; make the join URL **clickable**; reduce redundancy and wasted space. Room code and join info should sit together under/beside the QR.

---

## Quick reference

| Item | Status |
|------|--------|
| Pack picker: black text on white | Done |
| Skip preview step | Done |
| Host options on host page (full standard layout) | Done |
| More anonymous names | Done |
| Scoring / leaderboard after reveal | Done |
| Leaderboard updates when players join | Done |
| Host page: clickable URL, compact layout | Done |
| Change answer until reveal (toggle options, no lock) | Done |
| True/False: two buttons only | Done |
| List/order questions: tap to reorder, submit order | Done |
