import { useEffect, useRef, useState } from 'react';

/* ===============================
   CONFIG
================================ */

const CANVAS_SIZE = 320;
const BALL_RADIUS = 6;
const GOAL_RADIUS = 12;
const PUSH_EPSILON = 1;
const MAX_SPEED = 5;
const FRICTION = 0.98;
const TILT_SCALE = 0.025;
const COLLISION_PASSES = 3;

/* ===============================
   THEMES
================================ */

export const TILT_MAZE_THEMES = {
  classic: {
    bg: '#2b2b2b',
    wall: '#8a8a8a',
    goal: '#00ff9c',
    ball: ['#ffffff', '#00cfff'],
  },
  eighties: {
    bg: '#120021',
    wall: '#ff00ff',
    goal: '#00ffff',
    ball: ['#ffffff', '#ff00aa'],
  },
  trivia: {
    bg: '#0b1a2e',
    wall: '#f5c542',
    goal: '#00ff88',
    ball: ['#ffffff', '#f5c542'],
  },
} as const;

/* ===============================
   MAZE DEFINITIONS (RECTANGLES)
   Paths wide enough for ball (diameter 12) + push-out
================================ */

const MAZES = [
  {
    id: 'classic-box',
    start: { x: 35, y: 35 },
    goal: { x: 285, y: 285 },
    walls: [
      [0, 0, 320, 10],
      [0, 0, 10, 320],
      [0, 310, 320, 10],
      [310, 0, 10, 320],
      [60, 0, 10, 260],
      [120, 60, 10, 260],
      [180, 0, 10, 260],
      [240, 60, 10, 260],
    ],
  },
  {
    id: 'zigzag-focus',
    start: { x: 35, y: 285 },
    goal: { x: 285, y: 35 },
    walls: [
      [0, 0, 320, 10],
      [0, 0, 10, 320],
      [0, 310, 320, 10],
      [310, 0, 10, 320],
      [50, 50, 220, 10],
      [50, 100, 10, 170],
      [90, 260, 180, 10],
      [260, 80, 10, 190],
    ],
  },
  {
    id: 'calm-spiral',
    start: { x: 160, y: 35 },
    goal: { x: 160, y: 160 },
    walls: [
      [0, 0, 320, 10],
      [0, 0, 10, 320],
      [0, 310, 320, 10],
      [310, 0, 10, 320],
      [40, 40, 240, 10],
      [40, 40, 10, 200],
      [40, 240, 200, 10],
      [240, 80, 10, 170],
      [80, 80, 160, 10],
      [80, 80, 10, 120],
      [80, 200, 120, 10],
    ],
  },
];

type WallRect = [number, number, number, number];

/** Push circle out of one axis-aligned rectangle. Returns new x,y. */
function pushOutOfRect(
  cx: number,
  cy: number,
  r: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): { x: number; y: number; hit: boolean } {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  let dx = cx - closestX;
  let dy = cy - closestY;
  const distSq = dx * dx + dy * dy;
  if (distSq >= r * r) return { x: cx, y: cy, hit: false };
  if (distSq < 1e-10) {
    // Center inside rect: push out along shortest axis
    const toLeft = cx - rx;
    const toRight = rx + rw - cx;
    const toTop = cy - ry;
    const toBottom = ry + rh - cy;
    const minX = Math.min(toLeft, toRight);
    const minY = Math.min(toTop, toBottom);
    if (minX < minY) {
      dx = toLeft < toRight ? -1 : 1;
      dy = 0;
    } else {
      dx = 0;
      dy = toTop < toBottom ? -1 : 1;
    }
  }
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const overlap = distSq < 1e-10 ? r + PUSH_EPSILON : r - Math.sqrt(distSq) + PUSH_EPSILON;
  return { x: cx + (dx / dist) * overlap, y: cy + (dy / dist) * overlap, hit: true };
}

/* ===============================
   SVG OVERLAYS (VISUAL ONLY)
================================ */

const MazeOverlay = ({ type }: { type: string }) => {
  if (type === 'music')
    return (
      <svg viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`} className="overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 16 }}>
        <path
          d="M180 40v160c0 22-18 40-40 40s-40-18-40-40 18-40 40-40c6 0 12 1 18 4V60l100-20v40z"
          fill="none"
          stroke="#00cfff"
          strokeWidth="6"
          opacity="0.35"
        />
      </svg>
    );

  if (type === 'brain')
    return (
      <svg viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`} className="overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 16 }}>
        <path
          d="M100 80c-30 0-50 30-40 60 -20 10-20 50 10 60 10 30 50 40 70 20 20 20 60 10 70-20 30-10 30-50 10-60 10-30-10-60-40-60 -10-30-50-40-70-20z"
          fill="none"
          stroke="#ff7ad9"
          strokeWidth="6"
          opacity="0.35"
        />
      </svg>
    );

  if (type === 'dna')
    return (
      <svg viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`} className="overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 16 }}>
        <path
          d="M100 20c80 80 80 200 0 280 M220 20c-80 80-80 200 0 280"
          fill="none"
          stroke="#7cff00"
          strokeWidth="6"
          opacity="0.35"
        />
      </svg>
    );

  return null;
};

/* ===============================
   MAIN COMPONENT
================================ */

export interface WaitingRoomTiltMazeProps {
  themeKey?: keyof typeof TILT_MAZE_THEMES;
  overlay?: 'music' | 'brain' | 'dna';
  onWin?: (timeMs: number) => void;
}

export default function WaitingRoomTiltMaze({
  themeKey = 'classic',
  overlay = 'music',
  onWin,
}: WaitingRoomTiltMazeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mazeRef = useRef(MAZES[Math.floor(Math.random() * MAZES.length)]);
  const theme = TILT_MAZE_THEMES[themeKey];

  const ballRef = useRef<{ x: number; y: number }>({ x: mazeRef.current.start.x, y: mazeRef.current.start.y });
  const velRef = useRef({ x: 0, y: 0 });
  const startTimeRef = useRef(Date.now());
  const keysRef = useRef({ up: false, down: false, left: false, right: false });

  const [finished, setFinished] = useState(false);

  /* Disable vibration */
  useEffect(() => {
    if (navigator.vibrate) navigator.vibrate(0);
  }, []);

  /* Device tilt */
  useEffect(() => {
    const handleTilt = (e: DeviceOrientationEvent) => {
      if (finished) return;
      const g = (e.gamma ?? 0) * TILT_SCALE;
      const b = (e.beta ?? 0) * TILT_SCALE;
      velRef.current.x = Math.max(-1, Math.min(1, g));
      velRef.current.y = Math.max(-1, Math.min(1, b));
    };
    window.addEventListener('deviceorientation', handleTilt);
    return () => window.removeEventListener('deviceorientation', handleTilt);
  }, [finished]);

  /* Arrow keys */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const down = e.type === 'keydown';
      if (e.key === 'ArrowLeft') keysRef.current.left = down;
      if (e.key === 'ArrowRight') keysRef.current.right = down;
      if (e.key === 'ArrowUp') keysRef.current.up = down;
      if (e.key === 'ArrowDown') keysRef.current.down = down;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, []);

  /* Physics + draw loop (refs only — no setState in loop) */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maze = mazeRef.current;
    const walls: WallRect[] = maze.walls.map((w) => [w[0], w[1], w[2], w[3]]);

    let rafId = 0;
    const loop = () => {
      if (finished) {
        rafId = requestAnimationFrame(loop);
        return;
      }

      const ball = ballRef.current;
      const vel = velRef.current;

      // Key input
      const ax = (keysRef.current.right ? 0.4 : 0) - (keysRef.current.left ? 0.4 : 0);
      const ay = (keysRef.current.down ? 0.4 : 0) - (keysRef.current.up ? 0.4 : 0);
      vel.x += ax;
      vel.y += ay;
      vel.x *= FRICTION;
      vel.y *= FRICTION;
      const speed = Math.hypot(vel.x, vel.y);
      if (speed > MAX_SPEED) {
        vel.x *= MAX_SPEED / speed;
        vel.y *= MAX_SPEED / speed;
      }

      let x = ball.x + vel.x;
      let y = ball.y + vel.y;

      // Push-out collision (multiple passes so we don't get stuck in corners)
      for (let pass = 0; pass < COLLISION_PASSES; pass++) {
        for (const [rx, ry, rw, rh] of walls) {
          const out = pushOutOfRect(x, y, BALL_RADIUS, rx, ry, rw, rh);
          x = out.x;
          y = out.y;
        }
      }

      ball.x = x;
      ball.y = y;

      // Goal
      const dx = x - maze.goal.x;
      const dy = y - maze.goal.y;
      if (!finished && Math.sqrt(dx * dx + dy * dy) < GOAL_RADIUS) {
        setFinished(true);
        const timeMs = Date.now() - startTimeRef.current;
        onWin?.(timeMs);
      }

      // Draw
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      ctx.fillStyle = theme.wall;
      walls.forEach(([wx, wy, ww, wh]) => ctx.fillRect(wx, wy, ww, wh));

      ctx.beginPath();
      ctx.arc(maze.goal.x, maze.goal.y, GOAL_RADIUS - 2, 0, Math.PI * 2);
      ctx.fillStyle = theme.goal;
      ctx.fill();

      const gradient = ctx.createRadialGradient(
        ball.x - 2,
        ball.y - 2,
        2,
        ball.x,
        ball.y,
        BALL_RADIUS
      );
      gradient.addColorStop(0, theme.ball[0]);
      gradient.addColorStop(1, theme.ball[1]);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [theme, finished, onWin]);

  return (
    <div style={{ position: 'relative', width: CANVAS_SIZE, margin: '0 auto' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{ display: 'block', borderRadius: 16 }}
      />
      <MazeOverlay type={overlay} />
      {finished && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: 16,
            color: '#fff',
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          You did it!
        </div>
      )}
    </div>
  );
}
