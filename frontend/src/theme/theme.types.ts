/**
 * Playroom Theming v1 — Theme token schema.
 * @see docs/PLAYROOM-THEMING-SPEC.md
 */

export type ThemeId = 'classic' | 'prestige-retro' | 'retro-studio' | 'retro-arcade';
export type SceneId = 'arcadeCarpet' | 'studio' | 'mountains';
export type MotionLevel = 'calm' | 'standard' | 'hype';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  description: string;
  version: string;
}

export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  border: string;
  brand: string;
  brand2: string;
  success: string;
  warning: string;
  danger: string;
  glow: string;
}

export interface ThemeTypography {
  fontUI: string;
  fontDisplay: string;
  weightHeading: string;
  weightBody: string;
  letterSpacingDisplay: string;
}

export interface ThemeRadii {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
}

export interface ThemeEffects {
  noiseOpacity: number;
  glowStrength: number;
  vignetteOpacity: number;
  scanlinesOpacity: number;
}

export interface ThemeMotion {
  levelDefault: MotionLevel;
  durationFastMs: number;
  durationMedMs: number;
  durationSlowMs: number;
  easingStandard: string;
}

export type PanelStyle = 'flat' | 'glass' | 'bezel';
export type ButtonStyle = 'solid' | 'outline' | 'glass';
export type FocusRingStyle = 'soft' | 'sharp';
export type StageFrameStyle = 'none' | 'lightbar' | 'bezel';
export type ScorePanelStyle = 'flat' | 'glass' | 'bezel';
export type TileStyle = 'flat' | 'bezel' | 'neon';
export type AnswerPlateStyle = 'flat' | 'hingeFlip' | 'rolodexFlip';

export interface ThemeComponentStyles {
  panelStyle: PanelStyle;
  buttonStyle: ButtonStyle;
  focusRing: FocusRingStyle;
}

export interface ThemeGameChromeDefaults {
  marqueeHeader: boolean;
  stageFrame: StageFrameStyle;
  scorePanel: ScorePanelStyle;
  tileStyle: TileStyle;
  answerPlateStyle: AnswerPlateStyle;
}

export interface ThemeTokens {
  meta: ThemeMeta;
  colors: ThemeColors;
  typography: ThemeTypography;
  radii: ThemeRadii;
  shadows: ThemeShadows;
  effects: ThemeEffects;
  motion: ThemeMotion;
  componentStyles: ThemeComponentStyles;
  gameChromeDefaults: ThemeGameChromeDefaults;
}

/** Session-level theme settings (skin, scene, motion). */
export interface SessionThemeSettings {
  skinMode: 'match_site' | 'override_theme';
  themeId?: ThemeId;
  sceneId: SceneId;
  motionLevel: MotionLevel;
  contrast: 'normal' | 'high';
  showQR: boolean;
}
