/**
 * Roll Call — playable marble tilt maps.
 * Ball radius 10, min path width 48. Logical space 0–400; scale to canvas.
 */

export const BALL_RADIUS = 10;
export const MIN_PATH_WIDTH = 48;
const S = 400;

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
  {
    id: 's-curve',
    name: 'S-Curve',
    start: { x: 50, y: S / 2 },
    goal: { x: S - 50, y: S / 2 },
    walls: [
      w(0, 0, S, 0), w(S, 0, S, S), w(S, S, 0, S), w(0, S, 0, 0),
      w(80, 0, 80, S / 2 - 60), w(80, S / 2 + 60, 80, S),
      w(S - 80, S / 2 + 60, S - 80, S), w(S - 80, 0, S - 80, S / 2 - 60),
      w(80, S / 2 - 60, 200, S / 2 - 60), w(200, S / 2 - 60, 200, 120), w(200, 120, S, 120),
      w(0, S - 120, 200, S - 120), w(200, S - 120, 200, S / 2 + 60), w(200, S / 2 + 60, S - 80, S / 2 + 60),
      w(S - 80, S / 2 - 60, 320, S / 2 - 60), w(320, S / 2 - 60, 320, 120), w(320, 120, S - 80, 120),
    ],
  },
  {
    id: 'music-note',
    name: 'Music Note',
    start: { x: 200, y: 320 },
    goal: { x: 200, y: 80 },
    walls: [
      w(0, 0, S, 0), w(S, 0, S, S), w(S, S, 0, S), w(0, S, 0, 0),
      w(168, 80, 168, 320), w(232, 80, 232, 320),
      w(120, 80, 280, 80), w(120, 80, 120, 140), w(280, 80, 280, 140), w(120, 140, 280, 140),
      w(140, 260, 260, 260), w(140, 260, 140, 320), w(260, 260, 260, 320), w(140, 320, 260, 320),
      w(140, 140, 140, 260), w(168, 140, 168, 260),
      w(232, 140, 232, 260), w(260, 140, 260, 260), w(140, 140, 260, 140),
    ],
  },
  {
    id: 'question-mark',
    name: 'Question Mark',
    start: { x: 200, y: 300 },
    goal: { x: 270, y: 110 },
    walls: [
      w(0, 0, S, 0), w(S, 0, S, S), w(S, S, 0, S), w(0, S, 0, 0),
      w(100, 50, 310, 50), w(100, 50, 100, 130), w(310, 50, 310, 130), w(100, 130, 310, 130),
      w(250, 130, 250, 210), w(310, 130, 310, 210),
      w(250, 80, 310, 80), w(250, 80, 250, 130), w(310, 80, 310, 130),
      w(100, 210, 250, 210), w(100, 210, 100, 320), w(250, 210, 250, 320), w(100, 320, 250, 320),
      w(100, 130, 100, 210), w(160, 130, 160, 210), w(100, 130, 160, 130), w(100, 210, 160, 210),
    ],
  },
  {
    id: 'open-maze',
    name: 'Open Maze',
    start: { x: 60, y: S / 2 },
    goal: { x: S - 60, y: S / 2 },
    walls: [
      w(0, 0, S, 0), w(S, 0, S, S), w(S, S, 0, S), w(0, S, 0, 0),
      w(140, 0, 140, 180), w(140, 220, 140, S), w(260, 0, 260, 180), w(260, 220, 260, S),
      w(140, 180, 260, 180), w(140, 220, 260, 220),
    ],
  },
  {
    id: 'roundabout',
    name: 'Roundabout',
    start: { x: 50, y: S / 2 },
    goal: { x: S - 50, y: S / 2 },
    walls: [
      w(0, 0, S, 0), w(S, 0, S, S), w(S, S, 0, S), w(0, S, 0, 0),
      w(160, 160, 240, 160), w(240, 160, 240, 240), w(240, 240, 160, 240), w(160, 240, 160, 160),
    ],
  },
  {
    id: 'gentle-slope',
    name: 'Gentle Slope',
    start: { x: S / 2, y: 60 },
    goal: { x: S / 2, y: S - 60 },
    walls: [
      w(0, 0, S, 0), w(S, 0, S, S), w(S, S, 0, S), w(0, S, 0, 0),
      w(80, 120, S - 80, 120), w(80, 120, 80, 280), w(S - 80, 120, S - 80, 280), w(80, 280, S - 80, 280),
    ],
  },
];

export const DEFAULT_ROLL_CALL_MAP_ID = 's-curve';

export function getMapById(id: string): RollCallMap | undefined {
  return ROLL_CALL_MAPS.find((m) => m.id === id);
}

/** Pick a map (e.g. by game code hash) for variety. */
export function pickMapForGame(gameCode: string): RollCallMap {
  let n = 0;
  for (let i = 0; i < gameCode.length; i++) n = (n * 31 + gameCode.charCodeAt(i)) >>> 0;
  return ROLL_CALL_MAPS[n % ROLL_CALL_MAPS.length];
}
