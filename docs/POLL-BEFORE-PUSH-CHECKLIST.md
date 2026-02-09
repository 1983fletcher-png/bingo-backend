# Interactive Polling — before-push checklist

Use this to confirm the Interactive Polling feature is complete before you push and test.

---

## Spec coverage

| Item | Status | Notes |
|------|--------|--------|
| **Entry** Home card "Interactive Polling" → Start a poll → /poll/create | ✅ | |
| **Create** Single screen: question, response type, options (max 10), venue name, logo URL | ✅ | Logo = optional URL field (no file upload) |
| **Create** Display settings (Top 8, group similar, profanity) | ✅ | Locked ON in backend; not editable in UI |
| **Create** On success → pollId, redirect to /poll/:pollId/host | ✅ | hostToken in localStorage |
| **Roles** Host /poll/:pollId/host, Player /poll/:pollId, Display /poll/:pollId/display | ✅ | |
| **Player** Question, text or option buttons, one submission per device | ✅ | Replace-by-device on backend |
| **Player** Editable until host locks | ✅ | "Change answer" when submitted and !locked |
| **Player** Submit debounce (anti-spam) | ✅ | 1.5s cooldown after submit |
| **Player** Venue drawer collapsed by default | ✅ | Menu/events/social = placeholder for later |
| **Player** Footer "Hosted by The Playroom" (non-clickable) | ✅ | |
| **Display** Logo, question, Top 8 (label, count, % bar), Other bucket | ✅ | |
| **Display** Live ticker (when enabled) | ✅ | |
| **Display** QR "Scan to vote" at bottom | ✅ | |
| **Host** Lock/unlock, clear, reset, export CSV/JSON, toggle ticker | ✅ | |
| **Host** QR + join URL + "Open display for TV" link | ✅ | |
| **Host** Cannot edit submissions or see identities | ✅ | Anonymous; no identity in payload |
| **Backend** poll:create, join, submit, update, lock, reset, clear, ticker, export | ✅ | |
| **Grouping** Normalize (lowercase, trim, punctuation) + same-key grouping | ✅ | AI similarity = future |
| **Profanity** Do not block; mask on display only; store raw | ✅ | |

---

## Intentionally not implemented (per spec)

- **Host override** (merge groups, rename labels, hide answers) — optional; future.
- **AI similarity clustering** — v1 uses same normalized key; AI later.
- **Venue drawer links** (menu, drink menu, events, social) — placeholder; add when needed.
- **Logo file upload** — create form has Logo URL only; file upload can be added later.
- **Scheduled polls, auto-rotating decks, sponsor messaging, paid export** — future-proof only.

---

## Stability / freeze fixes (host page)

- **Host token** — Memoized so the host page doesn’t re-run effects on every render.
- **Join once** — Poll host/player/display join the poll once per mount (hasJoined flag); no duplicate join emissions or dependency loops.
- **Socket** — Single shared socket; reconnection limited (5 attempts, backoff) so the browser doesn’t freeze on a bad backend URL.
- **Production** — Set `VITE_SOCKET_URL` in Netlify to your Railway backend URL and redeploy so the live site connects.

## Quick verification (after push)

1. **Create** — Home → Interactive Polling → Start a poll → fill question, optional venue/logo → Start poll → lands on host page with QR.
2. **Player** — Open /poll/:pollId on phone (or new tab), submit answer, see confirmation; click "Change answer" and submit again; host locks → "Change answer" gone / poll closed message.
3. **Display** — Open /poll/:pollId/display in new tab, see question and Top 8 (and Other); ticker shows new submissions when enabled.
4. **Host** — Lock poll, clear, reset, export CSV/JSON, toggle ticker; "Open display for TV" opens display URL.
5. **No freeze** — Host page stays responsive; if backend is down, connection message shows and reconnects stop after 5 attempts.

---

## Build

- [ ] `npm run build` in `frontend/` passes.
- [ ] Backend starts (e.g. `node index.js` or your usual run).

When all above are good, push and run your usual deploy/smoke test.
