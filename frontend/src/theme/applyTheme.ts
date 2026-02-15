/**
 * Apply theme tokens to document — sets --pr-* CSS variables and data attributes.
 * @see docs/PLAYROOM-THEMING-SPEC.md
 */

import type { CSSProperties } from 'react';
import type { ThemeTokens, MotionLevel } from './theme.types';

const STORAGE_KEY = 'pr_theme';
const MOTION_KEY = 'pr_motion';

/** Task spec: one source of truth for site default theme */
export const SITE_THEME_KEY = 'playroom.siteTheme';
export const SITE_SCENE_KEY = 'playroom.siteScene';
export const SITE_MOTION_KEY = 'playroom.siteMotion';

export { STORAGE_KEY as PR_THEME_STORAGE_KEY, MOTION_KEY as PR_MOTION_STORAGE_KEY };

export type ApplyThemeToDomOptions = {
  theme: string;
  scene: string;
  motion: string;
};

/** Apply playroom theme/scene/motion to document. Uses data-playroom-theme so host UI light/dark (data-theme) is not overwritten. */
export function applyThemeToDom({ theme, scene, motion }: ApplyThemeToDomOptions): void {
  const el = document.documentElement;
  el.dataset.playroomTheme = theme;
  el.dataset.scene = scene;
  el.dataset.motion = motion;
}

/** Build CSS custom properties for a theme (for use on an element, e.g. GameShell wrapper). */
export function getThemeCSSVars(
  themeTokens: ThemeTokens,
  _motionOverride?: MotionLevel
): CSSProperties {
  const { colors, typography, radii, shadows, effects, motion: motionConfig } = themeTokens;
  return {
    ['--pr-bg' as string]: colors.bg,
    ['--pr-surface' as string]: colors.surface,
    ['--pr-surface2' as string]: colors.surface2,
    ['--pr-text' as string]: colors.text,
    ['--pr-muted' as string]: colors.muted,
    ['--pr-border' as string]: colors.border,
    ['--pr-brand' as string]: colors.brand,
    ['--pr-brand2' as string]: colors.brand2,
    ['--pr-success' as string]: colors.success,
    ['--pr-warning' as string]: colors.warning,
    ['--pr-danger' as string]: colors.danger,
    ['--pr-glow' as string]: colors.glow,
    ['--pr-font-ui' as string]: typography.fontUI,
    ['--pr-font-display' as string]: typography.fontDisplay,
    ['--pr-weight-heading' as string]: typography.weightHeading,
    ['--pr-weight-body' as string]: typography.weightBody,
    ['--pr-letter-spacing-display' as string]: typography.letterSpacingDisplay,
    ['--pr-radius-sm' as string]: radii.sm,
    ['--pr-radius-md' as string]: radii.md,
    ['--pr-radius-lg' as string]: radii.lg,
    ['--pr-radius-xl' as string]: radii.xl,
    ['--pr-shadow-sm' as string]: shadows.sm,
    ['--pr-shadow-md' as string]: shadows.md,
    ['--pr-shadow-lg' as string]: shadows.lg,
    ['--pr-noise-opacity' as string]: String(effects.noiseOpacity),
    ['--pr-glow-strength' as string]: String(effects.glowStrength),
    ['--pr-vignette-opacity' as string]: String(effects.vignetteOpacity),
    ['--pr-scanlines-opacity' as string]: String(effects.scanlinesOpacity),
    ['--pr-duration-fast' as string]: `${motionConfig.durationFastMs}ms`,
    ['--pr-duration-med' as string]: `${motionConfig.durationMedMs}ms`,
    ['--pr-duration-slow' as string]: `${motionConfig.durationSlowMs}ms`,
    ['--pr-easing' as string]: motionConfig.easingStandard,
    ['--pr-panel-style' as string]: themeTokens.componentStyles.panelStyle,
    ['--pr-button-style' as string]: themeTokens.componentStyles.buttonStyle,
    ['--pr-focus-ring' as string]: themeTokens.componentStyles.focusRing,
    ['--pr-stage-frame' as string]: themeTokens.gameChromeDefaults.stageFrame,
    ['--pr-tile-style' as string]: themeTokens.gameChromeDefaults.tileStyle,
    ['--pr-answer-plate-style' as string]: themeTokens.gameChromeDefaults.answerPlateStyle
  };
}

function setVarsOnElement(
  el: HTMLElement,
  themeTokens: ThemeTokens,
  motionOverride?: MotionLevel
): void {
  const motion = motionOverride ?? themeTokens.motion.levelDefault;
  el.setAttribute('data-pr-theme', themeTokens.meta.id);
  el.setAttribute('data-pr-motion', motion);
  const vars = getThemeCSSVars(themeTokens, motionOverride);
  Object.entries(vars).forEach(([key, value]) => {
    el.style.setProperty(key, value as string);
  });
}

export function applyTheme(themeTokens: ThemeTokens, motionOverride?: MotionLevel): void {
  setVarsOnElement(document.documentElement, themeTokens, motionOverride);
}

export function getStoredThemeId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredThemeId(themeId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
  } catch {
    // ignore
  }
}

export function getStoredMotionLevel(): MotionLevel | null {
  try {
    const v = localStorage.getItem(MOTION_KEY);
    if (v === 'calm' || v === 'standard' || v === 'hype') return v;
    return null;
  } catch {
    return null;
  }
}

export function setStoredMotionLevel(level: MotionLevel): void {
  try {
    localStorage.setItem(MOTION_KEY, level);
  } catch {
    // ignore
  }
}

export type SiteScene = 'studio' | 'mountains' | 'arcadeCarpet';

export function getStoredSceneId(): SiteScene | null {
  try {
    const v = localStorage.getItem(SITE_SCENE_KEY) || localStorage.getItem('pr_scene');
    if (v === 'studio' || v === 'mountains' || v === 'arcadeCarpet') return v;
    return null;
  } catch {
    return null;
  }
}

export function setStoredSceneId(scene: SiteScene): void {
  try {
    localStorage.setItem(SITE_SCENE_KEY, scene);
  } catch {
    // ignore
  }
}

export function getStoredSiteTheme(): string | null {
  try {
    return localStorage.getItem(SITE_THEME_KEY) || localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredSiteTheme(theme: string): void {
  try {
    localStorage.setItem(SITE_THEME_KEY, theme);
    localStorage.setItem(STORAGE_KEY, theme === 'prestige' ? 'prestige-retro' : theme === 'retro' ? 'retro-studio' : theme);
  } catch {
    // ignore
  }
}

export function getStoredSiteMotion(): string | null {
  try {
    return localStorage.getItem(SITE_MOTION_KEY) || localStorage.getItem(MOTION_KEY);
  } catch {
    return null;
  }
}

export function setStoredSiteMotion(motion: string): void {
  try {
    localStorage.setItem(SITE_MOTION_KEY, motion);
    const prMotion = motion === 'high-energy' ? 'hype' : motion;
    if (prMotion === 'calm' || prMotion === 'standard' || prMotion === 'hype') {
      localStorage.setItem(MOTION_KEY, prMotion);
    }
  } catch {
    // ignore
  }
}
