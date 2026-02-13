/** Safe area (0..1). Fine-tuned for game-show frame art. */
export type SafeArea = { x: number; y: number; w: number; h: number };

export const TV_SAFE_AREA: SafeArea = { x: 0.06, y: 0.28, w: 0.88, h: 0.58 };
export const PLAYER_SAFE_AREA: SafeArea = { x: 0.05, y: 0.22, w: 0.9, h: 0.62 };

/** One frame for all TV/display phases (standby, title, collect, locked, board). */
export const TV_FRAME = '/themes/survey-showdown/tv-display.png';

/** Player frames: right skin per screen for a finished game-show look. */
export const PLAYER_FRAMES = {
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
