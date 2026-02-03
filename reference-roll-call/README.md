# Roll Call — Reference maps and game logic

This folder holds **playable** Roll Call (marble tilt) assets so the ball never gets stuck:

- **`rollCallMaps.ts`** — Six maps (S-Curve, Music Note, Question Mark, Open Maze, Roundabout, Gentle Slope). All paths are at least 48px wide for a 20px ball. Copy into your frontend (e.g. `src/data/rollCallMaps.ts`).
- **`ROLL_CALL_LOGIC.md`** — Collision and physics rules: push-out epsilon, max speed, multiple collision passes, segment–circle math. Apply in your `RollCallGame` component.

Use maps in 0–400 logical space and scale to your canvas (e.g. `scale = canvas.width / 400`). Rotate map by `mapId` (e.g. from `gameCode` or random) for variety.
