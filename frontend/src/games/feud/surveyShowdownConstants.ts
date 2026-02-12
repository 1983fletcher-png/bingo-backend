/** Safe area (0..1). TODO: fine-tune when frame art is final. */
export type SafeArea = { x: number; y: number; w: number; h: number };

export const TV_SAFE_AREA: SafeArea = { x: 0.06, y: 0.28, w: 0.88, h: 0.58 };
export const PLAYER_SAFE_AREA: SafeArea = { x: 0.05, y: 0.22, w: 0.9, h: 0.62 };

export const FRAME_ASSETS = {
  tv: '/themes/survey-showdown/survey-showdown-tv-frame.png',
  player: '/themes/survey-showdown/survey-showdown-player-frame.png',
} as const;

export function isSurveyShowdownDebug(): boolean {
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(window.location.search).get('debug') === '1') return true;
  try {
    return localStorage.getItem('playroom_debug') === '1';
  } catch {
    return false;
  }
}
