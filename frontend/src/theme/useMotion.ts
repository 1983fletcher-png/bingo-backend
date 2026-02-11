/**
 * Hook for Playroom motion level and reduced-motion preference.
 * Requires ThemeProvider.
 */

import { usePlayroomTheme } from './ThemeProvider';
import type { MotionLevel } from './theme.types';
import { useMemo, useSyncExternalStore } from 'react';

function subscribePrefersReducedMotion(cb: () => void) {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

function getPrefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useMotion(): {
  motionLevel: MotionLevel;
  setMotionLevel: (level: MotionLevel) => void;
  effectiveMotion: MotionLevel;
  reducedMotion: boolean;
} {
  const { motionLevel, setMotionLevel } = usePlayroomTheme();
  const prefersReduced = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotion,
    () => false
  );
  const effectiveMotion: MotionLevel = useMemo(() => {
    if (prefersReduced) return 'calm';
    return motionLevel;
  }, [prefersReduced, motionLevel]);
  return {
    motionLevel,
    setMotionLevel,
    effectiveMotion,
    reducedMotion: prefersReduced
  };
}
