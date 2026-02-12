/**
 * Theme system types — site theme, scene, motion.
 * Used by ThemeProvider and data-theme / data-scene / data-motion on <html>.
 */

export type SiteTheme = 'classic' | 'prestige' | 'retro' | 'retro-arcade' | 'game-show';
export type SiteScene = 'studio' | 'mountains' | 'arcadeCarpet';
export type SiteMotion = 'standard' | 'calm' | 'high-energy';

export const SITE_THEMES: SiteTheme[] = ['classic', 'prestige', 'retro', 'retro-arcade', 'game-show'];
export const SITE_SCENES: SiteScene[] = ['studio', 'mountains', 'arcadeCarpet'];
export const SITE_MOTIONS: SiteMotion[] = ['standard', 'calm', 'high-energy'];

/** Map SiteTheme to theme registry id (prestige -> prestige-retro, retro -> retro-studio) */
export function siteThemeToRegistryId(theme: SiteTheme): string {
  if (theme === 'prestige') return 'prestige-retro';
  if (theme === 'retro') return 'retro-studio';
  return theme;
}

/** Map theme registry id to SiteTheme */
export function registryIdToSiteTheme(id: string): SiteTheme {
  if (id === 'prestige-retro') return 'prestige';
  if (id === 'retro-studio') return 'retro';
  if (id === 'game-show') return 'game-show';
  if (SITE_THEMES.includes(id as SiteTheme)) return id as SiteTheme;
  return 'classic';
}
