/**
 * Per-game/session theme settings. Host override UI later.
 * @see docs/PLAYROOM-THEMING-SPEC.md §8
 */

import type { SceneId, ThemeId, SessionThemeSettings } from '../../theme/theme.types';

export type GameKey = 'survey_showdown' | 'market_match' | 'crowd_control_trivia';

const DEFAULT_SCENE_BY_GAME: Record<GameKey, SceneId> = {
  survey_showdown: 'arcadeCarpet',
  market_match: 'studio',
  crowd_control_trivia: 'mountains'
};

export const DEFAULT_SESSION_THEME: SessionThemeSettings = {
  skinMode: 'match_site',
  sceneId: 'arcadeCarpet',
  motionLevel: 'standard',
  contrast: 'normal',
  showQR: true
};

export function getDefaultSceneForGame(gameKey: GameKey): SceneId {
  return DEFAULT_SCENE_BY_GAME[gameKey];
}

export function getSessionThemeSettings(
  gameKey: GameKey,
  siteThemeId: ThemeId,
  overrides?: Partial<SessionThemeSettings>
): SessionThemeSettings {
  const base: SessionThemeSettings = {
    ...DEFAULT_SESSION_THEME,
    sceneId: getDefaultSceneForGame(gameKey),
    themeId: siteThemeId,
    ...overrides
  };
  if (base.skinMode === 'match_site') {
    base.themeId = siteThemeId;
  }
  return base;
}
