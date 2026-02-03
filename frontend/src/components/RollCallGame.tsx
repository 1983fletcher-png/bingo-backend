import { useCallback, useEffect, useRef, useState } from 'react';
import type { RollCallMap, Wall } from '../data/rollCallMaps';
import { BALL_RADIUS } from '../data/rollCallMaps';

const PUSH_EPSILON = 1.5;
const MAX_SPEED = 8;
const FRICTION = 0.98;
const KEY_ACCEL = 0.8;
const COLLISION_PASSES = 3;
const LOGICAL_SIZE = 400;

export type RollCallTheme = {
  wall: string;
  ball: string;
  goal: string;
  bg: string;
};

const defaultTheme: RollCallTheme = {
  wall: '#4a5568',
  ball: '#e94560',
  goal: '#48bb78',
  bg: '#2d3748',
};

function closestPointOnSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { x: number; y: number; dist: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1e-6;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)));
  const x = x1 + t * dx;
  const y = y1 + t * dy;
  return { x, y, dist: Math.hypot(px - x, py - y) };
}

interface RollCallGameProps {
  map: RollCallMap;
  theme?: Partial<RollCallTheme>;
  onWin?: (timeMs: number) => void;
  disabled?: boolean;
}

export default function RollCallGame({ map, theme: themeOverrides, onWin, disabled }: RollCallGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = { ...defaultTheme, ...themeOverrides };
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(0);

  // Disable device vibration (waiting room should not vibrate)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(0);
  }, []);
  const stateRef = useRef({
    x: map.start.x,
    y: map.start.y,
    vx: 0,
    vy: 0,
    startTime: 0,
    running: true,
  });
  const keysRef = useRef({ up: false, down: false, left: false, right: false });

  const runCollision = useCallback((walls: Wall[], x: number, y: number, r: number) => {
    let nx = x;
    let ny = y;
    for (const w of walls) {
      const { x: cx, y: cy, dist } = closestPointOnSegment(nx, ny, w.x1, w.y1, w.x2, w.y2);
      if (dist < r) {
        const push = r - dist + PUSH_EPSILON;
        const nrmX = dist > 1e-6 ? (nx - cx) / dist : 1;
        const nrmY = dist > 1e-6 ? (ny - cy) / dist : 0;
        nx += nrmX * push;
        ny += nrmY * push;
      }
    }
    return { x: nx, y: ny };
  }, []);

  const tick = useCallback(() => {
    const el = canvasRef.current;
    const mapCurrent = map;
    if (!el || !mapCurrent || stateRef.current.running === false) return;

    const s = stateRef.current;
    let { x, y, vx, vy } = s;

    // Tilt (from global listeners) and keys
    const ax = (keysRef.current.right ? KEY_ACCEL : 0) - (keysRef.current.left ? KEY_ACCEL : 0);
    const ay = (keysRef.current.down ? KEY_ACCEL : 0) - (keysRef.current.up ? KEY_ACCEL : 0);
    vx += ax;
    vy += ay;
    vx *= FRICTION;
    vy *= FRICTION;

    const speed = Math.hypot(vx, vy);
    if (speed > MAX_SPEED) {
      const f = MAX_SPEED / speed;
      vx *= f;
      vy *= f;
    }

    x += vx;
    y += vy;

    let hit = false;
    for (let pass = 0; pass < COLLISION_PASSES; pass++) {
      const out = runCollision(mapCurrent.walls, x, y, BALL_RADIUS);
      if (Math.hypot(out.x - x, out.y - y) > 0.01) hit = true;
      x = out.x;
      y = out.y;
    }
    if (hit) {
      setShake((prev) => Math.min(prev + 1, 4));
      vx *= -0.3;
      vy *= -0.3;
    }

    s.x = x;
    s.y = y;
    s.vx = vx;
    s.vy = vy;

    // Goal
    const g = mapCurrent.goal;
    const goalR = 24;
    if (Math.hypot(x - g.x, y - g.y) < goalR && s.running) {
      s.running = false;
      const timeMs = s.startTime ? Math.round(performance.now() - s.startTime) : 0;
      setWon(true);
      onWin?.(timeMs);
    }
  }, [map, onWin, runCollision]);

  useEffect(() => {
    stateRef.current.x = map.start.x;
    stateRef.current.y = map.start.y;
    stateRef.current.vx = 0;
    stateRef.current.vy = 0;
    stateRef.current.startTime = performance.now();
    stateRef.current.running = true;
    setWon(false);
  }, [map.id]);

  useEffect(() => {
    if (shake > 0) {
      const t = setTimeout(() => setShake((p) => Math.max(0, p - 1)), 50);
      return () => clearTimeout(t);
    }
  }, [shake]);

  // Tilt
  useEffect(() => {
    if (disabled) return;
    const onOrientation = (e: DeviceOrientationEvent) => {
      const beta = e.beta != null ? e.beta : 0;
      const gamma = e.gamma != null ? e.gamma : 0;
      keysRef.current.left = gamma < -15;
      keysRef.current.right = gamma > 15;
      keysRef.current.up = beta < -15;
      keysRef.current.down = beta > 15;
    };
    window.addEventListener('deviceorientation', onOrientation);
    return () => window.removeEventListener('deviceorientation', onOrientation);
  }, [disabled]);

  // Keys
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

  // Game loop
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      tick();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tick]);

  // Draw
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || !map) return;

    const ctx = el.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = el.getBoundingClientRect();
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (el.width !== w || el.height !== h) {
      el.width = w;
      el.height = h;
    }

    const scaleX = w / LOGICAL_SIZE;
    const scaleY = h / LOGICAL_SIZE;
    const sc = Math.min(scaleX, scaleY);
    const offX = (w - LOGICAL_SIZE * sc) / 2;
    const offY = (h - LOGICAL_SIZE * sc) / 2;

    const draw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      const shakeX = (Math.random() - 0.5) * shake * 2;
      const shakeY = (Math.random() - 0.5) * shake * 2;
      ctx.translate(offX + shakeX, offY + shakeY);
      ctx.scale(sc, sc);

      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);

      ctx.strokeStyle = theme.wall;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (const wall of map.walls) {
        ctx.beginPath();
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.stroke();
      }

      const g = map.goal;
      ctx.fillStyle = theme.goal;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      const { x, y } = stateRef.current;
      ctx.fillStyle = theme.ball;
      ctx.beginPath();
      ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    };

    let rafId = 0;
    function frame() {
      draw();
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [map, theme, shake]);

  return (
    <div style={{ position: 'relative', minHeight: 320 }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: 400,
          aspectRatio: '1',
          display: 'block',
          margin: '0 auto',
          borderRadius: 8,
          touchAction: 'none',
        }}
      />
      {won && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: 8,
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
