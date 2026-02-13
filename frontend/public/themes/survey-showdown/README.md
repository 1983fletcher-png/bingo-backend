# Survey Showdown — game-show frames (lights, camera, action!)

The app uses a **2-layer system** on every screen: (1) full-bleed frame art, (2) live UI inside the safe area. Each screen uses the frame that matches its purpose so the experience feels finished and professional.

## Required frame PNGs (exact filenames; case-sensitive)

| File | Used on | Description |
|------|---------|-------------|
| **tv-display.png** | All TV/Display views | 16:9. Standby, Round title, Submissions open (collect), Locked, Board reveal, Summary. One frame for the whole show. |
| **player-answer.png** | Player: submit answers | Phone aspect. Prompt + “Round collecting” + answer form. |
| **player-waiting.png** | Player: answers submitted | Phone aspect. “Answers still coming in” + live answer list. |
| **player-reveal.png** | Player: board reveal | Phone aspect. Top answers board (same content as TV reveal). |

These paths are defined in `frontend/src/games/feud/surveyShowdownConstants.ts`. In the Network tab, all four should return 200 (not 404).

## Screen → frame mapping

- **TV:** Standby, R1_TITLE, R1_COLLECT, R1_LOCKED, R1_BOARD_0…8, R1_SUMMARY → `tv-display.png`
- **Player answer** (can submit) → `player-answer.png`
- **Player waiting** (submitted, waiting for others) → `player-waiting.png`
- **Player reveal** (locked, showing board) → `player-reveal.png`

## Art guidelines

- Frame art can include logos, lights, gradients, and background texture. No baked answer text or point numbers; those are rendered live by `SurveyShowdownBoard` and tiles.
- Optional: very subtle empty slot outlines in the art; the UI also draws the tile grid.
