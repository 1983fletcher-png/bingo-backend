/**
 * Activity Room display themes (Playroom Classic, Calm, Corporate, Game Show).
 * @see docs/ACTIVITY-ROOM-SPEC.md §14
 */
export type ActivityThemeId = 'classic' | 'calm' | 'corporate' | 'game-show';

export interface ActivityThemeColors {
  bg: string;
  text: string;
  muted: string;
  panel: string;
  card: string;
  border: string;
  accent: string;
}

export interface ActivityTheme extends ActivityThemeColors {
  id: ActivityThemeId;
  label: string;
  /** When true, Display uses reduced motion (no shimmer/cascade/drop). */
  calmMode: boolean;
}

const CLASSIC_DARK: ActivityThemeColors = {
  bg: '#0f1115',
  panel: '#1b1f27',
  card: '#252a33',
  text: '#f0f0f0',
  muted: '#9aa3ad',
  accent: '#e8b923',
  border: '#3d4552'
};

const CLASSIC_LIGHT: ActivityThemeColors = {
  bg: '#f5f5f5',
  panel: '#fff',
  card: '#fafafa',
  text: '#1a1a1a',
  muted: '#666',
  accent: '#c99700',
  border: '#ddd'
};

const CALM_DARK: ActivityThemeColors = {
  bg: '#1a1f26',
  panel: '#252c36',
  card: '#2e3742',
  text: '#e8ecf0',
  muted: '#8a96a4',
  accent: '#7eb8da',
  border: '#3d4a58'
};

const CALM_LIGHT: ActivityThemeColors = {
  bg: '#f0f4f8',
  panel: '#fff',
  card: '#f8fafc',
  text: '#1e293b',
  muted: '#64748b',
  accent: '#0ea5e9',
  border: '#e2e8f0'
};

const CORPORATE_DARK: ActivityThemeColors = {
  bg: '#0f1419',
  panel: '#192229',
  card: '#242d38',
  text: '#e6edf3',
  muted: '#8b9cad',
  accent: '#58a6ff',
  border: '#30363d'
};

const CORPORATE_LIGHT: ActivityThemeColors = {
  bg: '#f6f8fa',
  panel: '#fff',
  card: '#f6f8fa',
  text: '#1f2328',
  muted: '#656d76',
  accent: '#0969da',
  border: '#d0d7de'
};

const GAME_SHOW_DARK: ActivityThemeColors = {
  bg: '#1a0a2e',
  panel: '#2d1b4e',
  card: '#3d2663',
  text: '#f0e6ff',
  muted: '#a090c0',
  accent: '#d4af37',
  border: 'rgba(212,175,55,0.35)'
};

export const ACTIVITY_THEMES: { id: ActivityThemeId; label: string; calmMode: boolean }[] = [
  { id: 'classic', label: 'Playroom Classic', calmMode: false },
  { id: 'calm', label: 'Calm', calmMode: true },
  { id: 'corporate', label: 'Corporate', calmMode: false },
  { id: 'game-show', label: 'Game Show', calmMode: false }
];

export function getActivityTheme(
  themeId: ActivityThemeId | string | undefined,
  darkMode: boolean
): ActivityThemeColors & { calmMode: boolean } {
  const id = (themeId === 'calm' || themeId === 'corporate' || themeId === 'classic' || themeId === 'game-show' ? themeId : 'classic') as ActivityThemeId;
  const entry = ACTIVITY_THEMES.find((t) => t.id === id) ?? ACTIVITY_THEMES[0];
  let colors: ActivityThemeColors;
  if (id === 'calm') colors = darkMode ? CALM_DARK : CALM_LIGHT;
  else if (id === 'corporate') colors = darkMode ? CORPORATE_DARK : CORPORATE_LIGHT;
  else if (id === 'game-show') colors = GAME_SHOW_DARK;
  else colors = darkMode ? CLASSIC_DARK : CLASSIC_LIGHT;
  return { ...colors, calmMode: entry.calmMode };
}
