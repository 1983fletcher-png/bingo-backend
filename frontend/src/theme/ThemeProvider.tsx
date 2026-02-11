/**
 * Playroom theme context — site theme id + motion level, persisted to localStorage.
 * @see docs/PLAYROOM-THEMING-SPEC.md
 */

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { MotionLevel, ThemeId } from './theme.types';
import { getTheme } from './themeRegistry';
import {
  applyTheme,
  getStoredMotionLevel,
  getStoredThemeId,
  setStoredMotionLevel,
  setStoredThemeId
} from './applyTheme';

const DEFAULT_THEME: ThemeId = 'classic';
const DEFAULT_MOTION: MotionLevel = 'standard';

export interface PlayroomThemeContextValue {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  motionLevel: MotionLevel;
  setMotionLevel: (level: MotionLevel) => void;
}

const ctx = createContext<PlayroomThemeContextValue | null>(null);

function parseThemeId(raw: string | null): ThemeId {
  if (
    raw === 'classic' ||
    raw === 'prestige-retro' ||
    raw === 'retro-studio' ||
    raw === 'retro-arcade'
  ) {
    return raw;
  }
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(() =>
    parseThemeId(getStoredThemeId())
  );
  const [motionLevel, setMotionLevelState] = useState<MotionLevel>(() => {
    const stored = getStoredMotionLevel();
    return stored ?? DEFAULT_MOTION;
  });

  useEffect(() => {
    const tokens = getTheme(themeId);
    applyTheme(tokens, motionLevel);
  }, [themeId, motionLevel]);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    setStoredThemeId(id);
  }, []);

  const setMotionLevel = useCallback((level: MotionLevel) => {
    setMotionLevelState(level);
    setStoredMotionLevel(level);
  }, []);

  const value = useMemo<PlayroomThemeContextValue>(
    () => ({ themeId, setThemeId, motionLevel, setMotionLevel }),
    [themeId, setThemeId, motionLevel, setMotionLevel]
  );

  return <ctx.Provider value={value}>{children}</ctx.Provider>;
}

export function usePlayroomTheme(): PlayroomThemeContextValue {
  const v = React.useContext(ctx);
  if (!v) {
    throw new Error('usePlayroomTheme must be used within ThemeProvider');
  }
  return v;
}

export const PlayroomThemeContext = ctx;
