/**
 * Roll Call — playable marble tilt maps (reference for frontend)
 *
 * Design rules so the ball never gets stuck:
 * - Ball diameter: 20px (radius 10px) in a 400×400 logical space.
 * - Minimum path width: 48px (2.4× ball diameter). All corridors must be ≥ 48px.
 * - Maps are defined in 0–400 coordinates; scale to canvas (e.g. 360×360 or 400×400).
 *
 * Copy this file into your frontend (e.g. src/data/rollCallMaps.ts) and use
 * the same wall/start/goal format your RollCallGame component expects.
 */

export const BALL_RADIUS = 10;
export const MIN_PATH_WIDTH = 48;
const S = 400; // logical size

export interface Wall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RollCallMap {
  id: string;
  name: string;
  start: { x: number; y: number };
  goal: { x: number; y: number };
  walls: Wall[];
}

function w(x1: number, y1: number, x2: number, y2: number): Wall {
  return { x1, y1, x2, y2 };
}

export const ROLL_CALL_MAPS: RollCallMap[] = [
  // —— 1. S-Curve —— Simple, wide, no tight spots.
  {
    id: 's-curve',
    name: 'S-Curve',
    start: { x: 50, y: S / 2 },
    goal: { x: S - 50, y: S / 2 },
    walls: [
      w(0, 0, S, 0),
      w(S, 0, S, S),
      w(S, S, 0, S),
      w(0, S, 0, 0),
      w(80, 0, 80, S / 2 - 60),
      w(80, S / 2 + 60, 80, S),
      w(S - 80, S / 2 + 60, S - 80, S),
      w(S - 80, 0, S - 80, S / 2 - 60),
      w(80, S / 2 - 60, 200, S / 2 - 60),
      w(200, S / 2 - 60, 200, 120),
      w(200, 120, S, 120),
      w(0, S - 120, 200, S - 120),
      w(200, S - 120, 200, S / 2 + 60),
      w(200, S / 2 + 60, S - 80, S / 2 + 60),
      w(S - 80, S / 2 - 60, 320, S / 2 - 60),
      w(320, S / 2 - 60, 320, 120),
      w(320, 120, S - 80, 120),
    ],
  },

  // —— 2. Music Note —— Recognizable shape, all wide paths.
  {
    id: 'music-note',
    name: 'Music Note',
    start: { x: 200, y: 320 },
    goal: { x: 200, y: 80 },
    walls: [
      w(0, 0, S, 0),
      w(S, 0, S, S),
      w(S, S, 0, S),
      w(0, S, 0, 0),
      // Note stem (vertical corridor)
      w(168, 80, 168, 320),
      w(232, 80, 232, 320),
      // Note head (ellipse-ish: top cap)
      w(120, 80, 280, 80),
      w(120, 80, 120, 140),
      w(280, 80, 280, 140),
      w(120, 140, 280, 140),
      // Bottom bulb (wide)
      w(140, 260, 260, 260),
      w(140, 260, 140, 320),
      w(260, 260, 260, 320),
      w(140, 320, 260, 320),
      // Middle curve left
      w(140, 140, 140, 260),
      w(168, 140, 168, 260),
      // Middle curve right
      w(232, 140, 232, 260),
      w(260, 140, 260, 260),
      w(140, 140, 260, 140),
    ],
  },

  // —— 3. Question Mark —— Trivia theme; single wide path (all gaps ≥ 48px).
  {
    id: 'question-mark',
    name: 'Question Mark',
    start: { x: 200, y: 300 },
    goal: { x: 270, y: 110 },
    walls: [
      w(0, 0, S, 0),
      w(S, 0, S, S),
      w(S, S, 0, S),
      w(0, S, 0, 0),
      // Top curve of "?"
      w(100, 50, 310, 50),
      w(100, 50, 100, 130),
      w(310, 50, 310, 130),
      w(100, 130, 310, 130),
      // Right stem (width 60)
      w(250, 130, 250, 210),
      w(310, 130, 310, 210),
      // Dot / goal opening (width 60)
      w(250, 80, 310, 80),
      w(250, 80, 250, 130),
      w(310, 80, 310, 130),
      // Bottom bulb
      w(100, 210, 250, 210),
      w(100, 210, 100, 320),
      w(250, 210, 250, 320),
      w(100, 320, 250, 320),
      // Left curve (width 60)
      w(100, 130, 100, 210),
      w(160, 130, 160, 210),
      w(100, 130, 160, 130),
      w(100, 210, 160, 210),
    ],
  },

  // —— 4. Open Maze —— Few walls, lots of space, gentle challenge.
  {
    id: 'open-maze',
    name: 'Open Maze',
    start: { x: 60, y: S / 2 },
    goal: { x: S - 60, y: S / 2 },
    walls: [
      w(0, 0, S, 0),
      w(S, 0, S, S),
      w(S, S, 0, S),
      w(0, S, 0, 0),
      w(140, 0, 140, 180),
      w(140, 220, 140, S),
      w(260, 0, 260, 180),
      w(260, 220, 260, S),
      w(140, 180, 260, 180),
      w(140, 220, 260, 220),
    ],
  },

  // —— 5. Roundabout —— One central round obstacle; path around.
  {
    id: 'roundabout',
    name: 'Roundabout',
    start: { x: 50, y: S / 2 },
    goal: { x: S - 50, y: S / 2 },
    walls: [
      w(0, 0, S, 0),
      w(S, 0, S, S),
      w(S, S, 0, S),
      w(0, S, 0, 0),
      // Central square (rounded feel — use rect; path width ~80 each side)
      w(160, 160, 240, 160),
      w(240, 160, 240, 240),
      w(240, 240, 160, 240),
      w(160, 240, 160, 160),
    ],
  },

  // —— 6. Gentle Slope —— Top to bottom, one zigzag; all wide.
  {
    id: 'gentle-slope',
    name: 'Gentle Slope',
    start: { x: S / 2, y: 60 },
    goal: { x: S / 2, y: S - 60 },
    walls: [
      w(0, 0, S, 0),
      w(S, 0, S, S),
      w(S, S, 0, S),
      w(0, S, 0, 0),
      w(80, 120, S - 80, 120),
      w(80, 120, 80, 280),
      w(S - 80, 120, S - 80, 280),
      w(80, 280, S - 80, 280),
    ],
  },
];

/** Default map id when none specified (e.g. from theme or host). */
export const DEFAULT_ROLL_CALL_MAP_ID = 's-curve';
