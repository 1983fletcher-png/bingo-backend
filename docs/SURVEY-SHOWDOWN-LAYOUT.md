# Survey Showdown — Slot-Based Layout

Survey Showdown uses a **2-layer system**: (1) full-bleed frame PNG art, (2) live UI placed in **named slots** so titles, prompts, and content align with the frame and never overlap.

## Slots (0–1 coordinates)

All slot coordinates are fractions of the frame size (e.g. `x: 0.06` = 6% from left). Tune these to match your frame artwork (e.g. measure in Figma or an image editor).

### TV (`TV_SLOTS` in `surveyShowdownConstants.ts`)

| Slot     | Use                          | Default (x, y, w, h)     |
|----------|------------------------------|---------------------------|
| `title`  | Game name, "Round N"          | 0.06, 0.06, 0.88, 0.14   |
| `prompt` | Question text                | 0.06, 0.20, 0.88, 0.12   |
| `content`| Standby card, QR+counts, board | 0.06, 0.32, 0.88, 0.60 |

### Player (`PLAYER_SLOTS`)

| Slot     | Use                                | Default (x, y, w, h)     |
|----------|------------------------------------|---------------------------|
| `prompt` | Question + status ("Round collecting") | 0.08, 0.14, 0.84, 0.26 |
| `content`| Answer form, waiting list          | 0.08, 0.42, 0.84, 0.50   |

## Checkpoint → slots (TV)

| Checkpoint   | titleSlot     | promptSlot     | contentSlot              |
|-------------|----------------|----------------|---------------------------|
| STANDBY     | —              | —              | Standby card              |
| R1_TITLE    | Game name + Round | —           | —                         |
| R1_COLLECT  | —              | Prompt         | QR, code, counts, live answers |
| R1_LOCKED (no board) | —   | Prompt + "Answers locked" | "Revealing…"   |
| R1_BOARD_* / R1_SUMMARY | — | Prompt       | SurveyShowdownBoard       |

## Usage

- **SurveyShowdownFrame** accepts optional `titleSlot`, `promptSlot`, `contentSlot` (ReactNode). If any is provided, the frame renders absolutely positioned slot divs; otherwise it falls back to the legacy single `children` safe area.
- **FeudDisplay** passes slot content per checkpoint so the TV display always uses the right regions.
- **Play.tsx** (player) passes `promptSlot` and `contentSlot` for answer/waiting so the question and form sit in the correct regions.

## Player stage

For Survey Showdown with game-show theme, the player stage uses a taller height (50vh) and no padding so the frame fills the stage and slot percentages line up with the art. See `themes.css`: `[data-game="survey_showdown"][data-feud-view] .player-layout__stage`.

## Adding a new scene

1. Choose which frame (TV or player) and scene (answer/waiting/reveal for player).
2. Decide which slot(s) the new content uses (title / prompt / content).
3. Render `SurveyShowdownFrame` with the corresponding slot props; put your UI nodes in those props.
4. If the frame art has a new region, add a slot to `TV_SLOTS` or `PLAYER_SLOTS` and extend `SurveyShowdownFrame` to render it.

## Best practices

- **One source of truth for the question:** Only put the prompt in `promptSlot`; don’t duplicate it in the content slot or subtitle.
- **Tune slots to the art:** Export your frame PNGs at the same aspect you use in the app (e.g. 16:9 TV, 9:16 player). Measure the “title band,” “question band,” and “content area” as percentages and set `TV_SLOTS` / `PLAYER_SLOTS` to match.
- **Debug outline:** Add `?debug=1` or set `localStorage.playroom_debug = '1'` to show the safe-area outline (when using legacy children) for alignment.
