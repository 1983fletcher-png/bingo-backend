/**
 * Playroom theme context — site theme, scene, motion; persisted to localStorage.
 * Applies data-theme, data-scene, data-motion on <html> for themes.css.
 * @see docs/PLAYROOM-THEMING-SPEC.md
 */

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { MotionLevel, ThemeId } from './theme.types';
import type { SiteTheme, SiteScene, SiteMotion } from './themeTypes';
import { getTheme } from './themeRegistry';
import { siteThemeToRegistryId, registryIdToSiteTheme } from './themeTypes';
import {
  applyTheme,
  applyThemeToDom,
  getStoredMotionLevel,
  getStoredThemeId,
  setStoredMotionLevel,
  setStoredThemeId,
  getStoredSceneId,
  setStoredSceneId,
  getStoredSiteTheme,
  setStoredSiteTheme,
  getStoredSiteMotion,
  setStoredSiteMotion
} from './applyTheme';

const DEFAULT_THEME: ThemeId = 'classic';
const DEFAULT_MOTION: MotionLevel = 'standard';
const DEFAULT_SCENE: SiteScene = 'studio';

export interface PlayroomThemeContextValue {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  motionLevel: MotionLevel;
  setMotionLevel: (level: MotionLevel) => void;
  sceneId: SiteScene;
  setSceneId: (id: SiteScene) => void;
  /** Theme for data-theme (classic | prestige | retro | retro-arcade) */
  theme: SiteTheme;
  /** Motion for data-motion (standard | calm | high-energy) */
  motion: SiteMotion;
  setTheme: (t: SiteTheme) => void;
  setScene: (s: SiteScene) => void;
  setMotion: (m: SiteMotion) => void;
  /** Reset to defaults and persist */
  resetToDefaults: () => void;
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

function motionToDataMotion(level: MotionLevel): SiteMotion {
  if (level === 'hype') return 'high-energy';
  return level as SiteMotion;
}

function dataMotionToMotion(m: string): MotionLevel {
  if (m === 'high-energy') return 'hype';
  if (m === 'calm' || m === 'standard') return m;
  return 'standard';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    const site = getStoredSiteTheme();
    const reg = getStoredThemeId();
    if (site) {
      const id = siteThemeToRegistryId(site as SiteTheme) as ThemeId;
      return parseThemeId(id) || parseThemeId(reg);
    }
    return parseThemeId(reg);
  });
  const [motionLevel, setMotionLevelState] = useState<MotionLevel>(() => {
    const stored = getStoredSiteMotion() || getStoredMotionLevel();
    return stored ? dataMotionToMotion(stored) : DEFAULT_MOTION;
  });
  const [sceneId, setSceneIdState] = useState<SiteScene>(() => {
    const stored = getStoredSceneId();
    return (stored as SiteScene) ?? DEFAULT_SCENE;
  });

  const theme: SiteTheme = registryIdToSiteTheme(themeId);
  const motion: SiteMotion = motionToDataMotion(motionLevel);

  useEffect(() => {
    const tokens = getTheme(themeId);
    applyTheme(tokens, motionLevel);
    applyThemeToDom({
      theme,
      scene: sceneId,
      motion
    });
  }, [themeId, motionLevel, sceneId, theme, motion]);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    setStoredThemeId(id);
    setStoredSiteTheme(registryIdToSiteTheme(id));
  }, []);

  const setMotionLevel = useCallback((level: MotionLevel) => {
    setMotionLevelState(level);
    setStoredMotionLevel(level);
    setStoredSiteMotion(motionToDataMotion(level));
  }, []);

  const setSceneId = useCallback((id: SiteScene) => {
    setSceneIdState(id);
    setStoredSceneId(id);
  }, []);

  const setTheme = useCallback((t: SiteTheme) => {
    const id = siteThemeToRegistryId(t) as ThemeId;
    setThemeIdState(id);
    setStoredThemeId(id);
    setStoredSiteTheme(t);
  }, []);

  const setScene = useCallback((s: SiteScene) => {
    setSceneIdState(s);
    setStoredSceneId(s);
  }, []);

  const setMotion = useCallback((m: SiteMotion) => {
    const level = dataMotionToMotion(m);
    setMotionLevelState(level);
    setStoredMotionLevel(level);
    setStoredSiteMotion(m);
  }, []);

  const resetToDefaults = useCallback(() => {
    setThemeIdState(DEFAULT_THEME);
    setMotionLevelState(DEFAULT_MOTION);
    setSceneIdState(DEFAULT_SCENE);
    setStoredThemeId(DEFAULT_THEME);
    setStoredSiteTheme('classic');
    setStoredMotionLevel(DEFAULT_MOTION);
    setStoredSiteMotion('standard');
    setStoredSceneId(DEFAULT_SCENE);
  }, []);

  const value = useMemo<PlayroomThemeContextValue>(
    () => ({
      themeId,
      setThemeId,
      motionLevel,
      setMotionLevel,
      sceneId,
      setSceneId,
      theme,
      motion,
      setTheme,
      setScene,
      setMotion,
      resetToDefaults
    }),
    [themeId, setThemeId, motionLevel, setMotionLevel, sceneId, setSceneId, theme, motion, setTheme, setScene, setMotion, resetToDefaults]
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

/** Task spec: useTheme() -> { theme, scene, motion, setTheme, setScene, setMotion } */
export function useTheme(): {
  theme: SiteTheme;
  scene: SiteScene;
  motion: SiteMotion;
  setTheme: (t: SiteTheme) => void;
  setScene: (s: SiteScene) => void;
  setMotion: (m: SiteMotion) => void;
} {
  const v = usePlayroomTheme();
  return {
    theme: v.theme,
    scene: v.sceneId,
    motion: v.motion,
    setTheme: v.setTheme,
    setScene: v.setScene,
    setMotion: v.setMotion
  };
}

export const PlayroomThemeContext = ctx;
