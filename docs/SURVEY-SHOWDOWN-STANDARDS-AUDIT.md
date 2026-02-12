# Survey Showdown & Game Show Theme — Standards Audit

Use this to confirm everything is in place so Survey Showdown looks and behaves to our high standards. All overlays and theme wiring should be consistent.

---

## 1. Theme & overlay assets

| Item | Status | Notes |
|------|--------|--------|
| **Game Show theme** | ✅ | `theme/packs/game-show.json`, `themes.css` `[data-theme="game-show"]`, purple/gold tokens. |
| **Theme registry** | ✅ | `themeRegistry.ts`: `game-show` in ThemeRegistry and THEME_IDS. |
| **Overlay path** | ✅ | `--stage-overlay: url("/themes/overlays/overlay-gameshow.webp")` in themes.css. |
| **overlay-gameshow.webp** | ✅ | File present in `frontend/public/themes/overlays/` (placeholder; replace with final asset for full look). |
| **Other overlays** | ✅ | overlay-prestige.webp, overlay-retro.webp, overlay-arcade.webp in same folder. |

---

## 2. Survey Showdown–specific styling (game-show + survey_showdown)

All require **both** `data-pr-theme="game-show"` and `data-game="survey_showdown"` on the shell root. Applied in `themes.css`:

| Effect | Selector / purpose |
|--------|--------------------|
| **Starry background** | `.pr-scene-layer` — dark gradient + star dots + gold accent. |
| **Proscenium** | Same layer — darker sides (stage frame). |
| **Stage gold frame** | `.pr-stage`, `.stage-frame`, `.player-layout__stage` — 4px gold border, glow. |
| **Overlay on stage** | `::before` — 72% opacity; uses `--stage-overlay` (overlay-gameshow.webp). |
| **Footlights + floor** | `::after` — upward gold gradient, reflective floor. |
| **TV board frame** | `.feud-display__board-frame` — ornate gold border + shadow. |
| **Player reveal board** | `.feud-player-reveal__board` — same look, scaled. |

---

## 3. Shell wiring (Display & Player)

| Page | GameShell | gameKey | themeId source |
|------|-----------|--------|----------------|
| **Display** | `GameShell` → SharedGameShell | `survey_showdown` | `displayPlayroomThemeId` from `eventConfig.playroomThemeId` |
| **Play** | `GameShell` → SharedGameShell | `survey_showdown` | `sessionThemeId` from `joinState.eventConfig.playroomThemeId` |

- **SharedGameShell** sets `data-game={gameKey}` and `data-pr-theme={themeId}` on the root.
- When theme is **game-show**, Survey Showdown–specific CSS applies automatically.

---

## 4. Default theme for new Survey Showdown games

| Layer | Behavior |
|-------|----------|
| **Backend** | `createGame`: if `gameType === 'feud'` and `eventConfig.playroomThemeId` is null/empty → set to `'game-show'`. |
| **Host create** | Host.tsx sends `playroomThemeId: 'game-show'` in eventConfig when emitting `host:create` for feud. |
| **Result** | New Survey Showdown games start with Game Show theme; host can change skin from dropdown. |

---

## 5. Player experience

| Feature | Implementation |
|---------|----------------|
| **Three answer boxes** | `TextAnswerInput` with `maxFields={3}`, placeholders "Answer 1", "Answer 2", "Answer 3", hint "Your top 3 answers". |
| **After submit** | "Answers still coming in" waiting view; live answer list (submission order, no names); "X players have answered". |
| **Reveal** | `FeudPlayerReveal` — 2×4 grid, 8 plates, per-plate vote count. |

---

## 6. Host UI

| Item | Location |
|------|----------|
| **Theme dropdown** | Host left rail + Settings; value = `eventConfig.playroomThemeId ?? 'classic'`. |
| **Game Show option** | Label "Game Show", value `game-show`; in THEME_IDS and option list. |
| **Apply** | `host:set-event-config` with `playroomThemeId` updates display and players. |

---

## 7. Quick verification

1. **Create Survey Showdown** — Theme dropdown should show **Game Show** selected.
2. **Display (TV)** — Starry background, gold stage frame, overlay on stage (or placeholder texture).
3. **Player — answer** — Three separate inputs, "Your top 3 answers", Submit.
4. **Player — waiting** — "Answers still coming in", live answers, player count.
5. **Player — reveal** — 2×4 grid, 8 answers with vote counts, gold-framed board.

---

## 8. Replacing the game show overlay

- **Current:** `frontend/public/themes/overlays/overlay-gameshow.webp` is a copy of the prestige overlay so the URL never 404s.
- **To get the full look:** Replace that file with your game show stage/floor asset (e.g. from mockups). Same path; no code change.
- **README:** `frontend/public/themes/README.md` documents overlay usage and replacement.

---

*Last verified: Survey Showdown flow, Game Show default, three-answer input, overlay placeholder in place.*
