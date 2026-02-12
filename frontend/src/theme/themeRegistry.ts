/**
 * Playroom theme registry — loads all theme packs.
 * @see docs/PLAYROOM-THEMING-SPEC.md
 */

import type { ThemeId, ThemeTokens } from './theme.types';
import classic from './packs/classic.json';
import prestigeRetro from './packs/prestige-retro.json';
import retroStudio from './packs/retro-studio.json';
import retroArcade from './packs/retro-arcade.json';
import gameShow from './packs/game-show.json';

const packs = [
  classic as ThemeTokens,
  prestigeRetro as ThemeTokens,
  retroStudio as ThemeTokens,
  retroArcade as ThemeTokens,
  gameShow as ThemeTokens
];

export const ThemeRegistry: Record<ThemeId, ThemeTokens> = {
  classic: packs.find((p) => p.meta.id === 'classic')!,
  'prestige-retro': packs.find((p) => p.meta.id === 'prestige-retro')!,
  'retro-studio': packs.find((p) => p.meta.id === 'retro-studio')!,
  'retro-arcade': packs.find((p) => p.meta.id === 'retro-arcade')!,
  'game-show': packs.find((p) => p.meta.id === 'game-show')!
};

export const THEME_IDS: ThemeId[] = ['classic', 'prestige-retro', 'retro-studio', 'retro-arcade', 'game-show'];

export function getTheme(themeId: ThemeId): ThemeTokens {
  return ThemeRegistry[themeId] ?? ThemeRegistry.classic;
}
