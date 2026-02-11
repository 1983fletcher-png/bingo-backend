/**
 * Playroom background scenes — procedural/SVG/CSS only (no copyrighted images).
 * @see docs/PLAYROOM-THEMING-SPEC.md §5
 */

import type { SceneId } from '../theme.types';
import './BackgroundScene.css';

export interface BackgroundSceneProps {
  sceneId: SceneId;
  intensity?: number;
  reducedMotion?: boolean;
  className?: string;
}

export function BackgroundScene({
  sceneId,
  intensity = 1,
  reducedMotion = false,
  className = ''
}: BackgroundSceneProps) {
  const opacity = Math.max(0, Math.min(1, intensity));

  return (
    <div
      className={`pr-scene pr-scene-${sceneId} ${reducedMotion ? 'pr-scene-reduced-motion' : ''} ${className}`.trim()}
      data-scene-id={sceneId}
      aria-hidden
      style={{ ['--pr-scene-intensity' as string]: String(opacity) }}
    >
      {sceneId === 'arcadeCarpet' && <ArcadeCarpetScene />}
      {sceneId === 'studio' && <StudioScene />}
      {sceneId === 'mountains' && <MountainsScene />}
    </div>
  );
}

function ArcadeCarpetScene() {
  return (
    <>
      <div className="pr-scene-carpet-base" />
      <div className="pr-scene-carpet-pattern" />
      <div className="pr-scene-noise" />
      <div className="pr-scene-vignette" />
    </>
  );
}

function StudioScene() {
  return (
    <>
      <div className="pr-scene-studio-base" />
      <div className="pr-scene-studio-beams" />
      <div className="pr-scene-studio-floor" />
      <div className="pr-scene-noise" />
      <div className="pr-scene-vignette" />
    </>
  );
}

function MountainsScene() {
  return (
    <>
      <div className="pr-scene-mountains-sky" />
      <div className="pr-scene-mountains-silhouettes">
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className="pr-scene-mountains-svg">
          <defs>
            <linearGradient id="pr-mt-far" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor="var(--pr-mountains-far, #1a2332)" />
            </linearGradient>
            <linearGradient id="pr-mt-mid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor="var(--pr-mountains-mid, #0f1623)" />
            </linearGradient>
            <linearGradient id="pr-mt-near" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor="var(--pr-mountains-near, #0a0e14)" />
            </linearGradient>
          </defs>
          {/* Far layer */}
          <path
            fill="url(#pr-mt-far)"
            d="M0,900 L0,520 Q200,400 400,480 T800,420 T1200,500 T1600,380 L1600,900 Z"
          />
          {/* Mid layer */}
          <path
            fill="url(#pr-mt-mid)"
            d="M0,900 L0,600 Q300,450 600,550 T1200,480 T1600,620 L1600,900 Z"
          />
          {/* Near layer */}
          <path
            fill="url(#pr-mt-near)"
            d="M0,900 L0,720 Q400,580 800,700 T1600,640 L1600,900 Z"
          />
        </svg>
      </div>
      <div className="pr-scene-mountains-stars" />
      <div className="pr-scene-noise" />
      <div className="pr-scene-vignette" />
    </>
  );
}
