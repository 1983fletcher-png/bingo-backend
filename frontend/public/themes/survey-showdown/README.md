# Survey Showdown — frame-only assets (NO baked answers/numbers)

The app uses a **2-layer system**: (1) frame-only art, (2) live UI tiles. Do **not** use images that contain sample answers or point values.

**Required frame-only PNGs:**
- **survey-showdown-tv-frame.png** — 16:9. Logos, lights, gradients, background texture only. No answer text, no numbers.
- **survey-showdown-player-frame.png** — Phone aspect. Same: frame only, no answers/numbers.

Optional: very subtle empty slot outlines in the art (recommended: draw slot boxes in UI via `SurveyShowdownBoard` + `SurveyShowdownTile`).

**Deprecated (do not use for board/reveal):**
- tv-display.png, player-answer.png, player-waiting.png, player-reveal.png — if they contain baked answers or numbers, they must not be used. The app now uses the frame-only assets above and renders all tiles live.
