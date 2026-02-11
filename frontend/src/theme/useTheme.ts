/**
 * Hook for current Playroom theme id and setter.
 * Requires ThemeProvider. For theme tokens use getTheme(themeId) from themeRegistry.
 */

import { usePlayroomTheme } from './ThemeProvider';
import type { ThemeId } from './theme.types';

export function useTheme(): { themeId: ThemeId; setThemeId: (id: ThemeId) => void } {
  const { themeId, setThemeId } = usePlayroomTheme();
  return { themeId, setThemeId };
}
