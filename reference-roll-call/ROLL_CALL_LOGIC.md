# Roll Call — Game Logic (so the ball never gets stuck)

Use this in your frontend `RollCallGame` component (canvas + tilt/keys).

## 1. Constants

- **Ball radius:** e.g. `10` (px in 400×400 space; scale with canvas).
- **Minimum path width:** `48` px so the ball (diameter 20) never lodges between walls.
- **Push-out epsilon:** `1.5` – how far to push the ball out of a wall each frame when overlapping.
- **Max speed:** cap velocity (e.g. `8` px/frame) to avoid tunneling and unstable stacking.

## 2. Collision (every frame)

1. **Move** the ball with tilt/keys and friction (e.g. multiply velocity by `0.98`).
2. **Collision vs walls:** for each wall segment, do segment–circle intersection:
   - Closest point on segment to ball center; if distance < ball radius, treat as collision.
3. **Response:** push ball **out** along the normal (away from wall) by:
   - `overlap = ballRadius - distance`
   - `push = overlap + PUSH_EPSILON` (e.g. 1.5) so it clears the wall.
4. **Multiple passes:** run the same collision loop 2–3 times per frame so the ball can’t get stuck in a corner (one wall pushes it into the other; the next pass fixes it).
5. **Clamp speed:** after all physics, `speed = min(speed, MAX_SPEED)`.

## 3. Wall–circle math (pseudocode)

```ts
function closestPointOnSegment(
  px: number, py: number,
  x1: number, y1: number, x2: number, y2: number
): { x: number; y: number; dist: number } {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1e-6;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)));
  const x = x1 + t * dx, y = y1 + t * dy;
  return { x, y, dist: Math.hypot(px - x, py - y) };
}
// If dist < ballRadius: normal = ((ball.x - x)/dist, (ball.y - y)/dist), push out by (ballRadius - dist + PUSH_EPSILON).
```

## 4. Maps

- Use the maps in `rollCallMaps.ts`: all paths are at least 48px wide.
- Rotate through map ids (e.g. by `gameCode` or random) so players get variety.
- Scale map coordinates from 0–400 to your canvas size (e.g. `scale = canvas.width / 400`).

## 5. Polish

- **Screen shake:** on wall hit, add a 1–2 frame small offset to the canvas transform.
- **Goal:** when ball center enters goal circle, trigger win (confetti, submit score, reset).
- **Theme:** use `waitingRoom.theme` colors for walls, ball, goal, and background.

With these rules and the provided maps, the marble should roll smoothly and never get stuck between walls.
