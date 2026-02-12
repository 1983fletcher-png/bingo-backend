# Survey Showdown — Reference Mock-ups

These mock-ups match the **agreed design and stipulations** for the Survey Showdown game-show look (TV display and player screens).

## Design rules (from discussion)

- **8 plates** on the board (not 4 or 5); top 8 answers, highest to lowest by vote count.
- **Per-plate vote count only** — e.g. "Burgers" with **35** (votes), "Hot dogs" with **28**. No round total.
- **Purple/gold game-show theme** — starry background, stage lights, gold studded frame, reflective floor.
- **Player flow:** Answer → Submit → **Waiting** ("Answers still coming in", live answers in submission order, no names) → **Reveal** (2×4 grid, same structure as TV, mobile-optimized).
- **Copy:** "Answers still coming in", "Submit", "X players have answered" (no typos).

## Mock-up files

| File | Screen | Purpose |
|------|--------|---------|
| **survey-showdown-tv-display-mockup.png** | TV / projector | Main display: banner (Survey Showdown + Round N), prompt, 8-plate board in gold frame, answer + vote count per plate. Use as reference for overlay asset (stage/floor) and layout. |
| **survey-showdown-player-reveal-mockup.png** | Player (phone) | Reveal view: 2×4 grid, same content as TV (top 8, answer + vote count), gold frame, purple/gold theme. |
| **survey-showdown-player-answer-mockup.png** | Player (phone) | Answer view: prompt, input field, gold SUBMIT button. |
| **survey-showdown-player-waiting-mockup.png** | Player (phone) | Waiting view: "Answers still coming in", "X players have answered", live list of answers (submission order, no names). |

## Using these for the overlay asset

- The **TV display** mock-up shows the intended stage, frame, and lighting. To create **overlay-gameshow.webp**: crop or export the stage/frame/floor area (without the changing content like prompt and board items) and save as `frontend/public/themes/overlays/overlay-gameshow.webp`. The app will composite it over the stage at 72% opacity.
- If you prefer a single full-screen asset, you can use the TV mock-up as the visual target; the live app will render the dynamic content (prompt, 8 plates, vote counts) on top via CSS/React.

## Where the live app implements this

- **Display (TV):** `FeudDisplay.tsx` + `feud-display.css`; Game Show theme in `themes.css` (data-pr-theme="game-show", data-game="survey_showdown").
- **Player:** `Play.tsx` (answer → waiting → reveal flow), `FeudPlayerReveal.tsx` + `feud-player-reveal.css`, same theme tokens.
