/**
 * Playroom theming v1 — public API.
 * @see docs/PLAYROOM-THEMING-SPEC.md
 */

export type {
  ThemeId,
  SceneId,
  MotionLevel,
  ThemeTokens,
  SessionThemeSettings
} from './theme.types';
export { ThemeRegistry, THEME_IDS, getTheme } from './themeRegistry';
export {
  applyTheme,
  getThemeCSSVars,
  getStoredThemeId,
  setStoredThemeId,
  getStoredMotionLevel,
  setStoredMotionLevel,
  PR_THEME_STORAGE_KEY,
  PR_MOTION_STORAGE_KEY
} from './applyTheme';
export { ThemeProvider, usePlayroomTheme, PlayroomThemeContext } from './ThemeProvider';
export type { PlayroomThemeContextValue } from './ThemeProvider';
export { useTheme } from './useTheme';
export { useMotion } from './useMotion';
