/** Rectangle in 0..1 (fraction of frame size). Used for safe area and slot-based layout. */
export type SafeArea = { x: number; y: number; w: number; h: number };

export const TV_SAFE_AREA: SafeArea = { x: 0.06, y: 0.28, w: 0.88, h: 0.58 };
export const PLAYER_SAFE_AREA: SafeArea = { x: 0.05, y: 0.22, w: 0.9, h: 0.62 };

/**
 * Game-show slot layout: title, prompt, and content each get a region so dynamic
 * text aligns with the frame art. Tune x,y,w,h to match your frame PNGs.
 */
export const TV_SLOTS = {
  title: { x: 0.06, y: 0.06, w: 0.88, h: 0.14 } as SafeArea,
  prompt: { x: 0.06, y: 0.20, w: 0.88, h: 0.12 } as SafeArea,
  content: { x: 0.06, y: 0.32, w: 0.88, h: 0.60 } as SafeArea,
} as const;

export const PLAYER_SLOTS = {
  prompt: { x: 0.08, y: 0.14, w: 0.84, h: 0.26 } as SafeArea,
  content: { x: 0.08, y: 0.42, w: 0.84, h: 0.50 } as SafeArea,
} as const;

/** Blank frame assets (no baked prompts/answers) — use these so slot content aligns. Same dimensions as originals. */
export const TV_FRAME = '/themes/survey-showdown/tv-display-blank.png';

/** Player blank frames (no baked placeholder text). */
export const PLAYER_FRAMES = {
  answer: '/themes/survey-showdown/player-answer-blank.png',
  waiting: '/themes/survey-showdown/player-waiting-blank.png',
  reveal: '/themes/survey-showdown/player-reveal-blank.png',
} as const;

/** Legacy (baked art) — fallback only; do not use in mockup mode. */
export const TV_FRAME_LEGACY = '/themes/survey-showdown/tv-display.png';
export const PLAYER_FRAMES_LEGACY = {
  answer: '/themes/survey-showdown/player-answer.png',
  waiting: '/themes/survey-showdown/player-waiting.png',
  reveal: '/themes/survey-showdown/player-reveal.png',
} as const;

export type PlayerFrameScene = keyof typeof PLAYER_FRAMES;

/** Legacy shape: tv and a default player (answer). */
export const FRAME_ASSETS = {
  tv: TV_FRAME,
  player: PLAYER_FRAMES.answer,
} as const;

/** Resolve frame image URL: TV always same; player by scene (answer | waiting | reveal). */
export function getFrameSrc(variant: 'tv' | 'player', scene?: PlayerFrameScene): string {
  if (variant === 'tv') return TV_FRAME;
  return PLAYER_FRAMES[scene ?? 'answer'];
}

export function isSurveyShowdownDebug(): boolean {
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(window.location.search).get('debug') === '1') return true;
  try {
    return localStorage.getItem('playroom_debug') === '1';
  } catch {
    return false;
  }
}
