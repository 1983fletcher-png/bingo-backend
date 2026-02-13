/**
 * Shared game layout for Display / Player / Host. Applies theme, scene, chrome.
 * @see docs/PLAYROOM-THEMING-SPEC.md §6
 */

import React from 'react';
import type { ThemeId, SceneId, MotionLevel } from '../../theme/theme.types';
import { getTheme } from '../../theme/themeRegistry';
import { getThemeCSSVars } from '../../theme/applyTheme';
import { usePlayroomTheme } from '../../theme/ThemeProvider';
import { BackgroundScene } from '../../theme/scenes/BackgroundScene';
import { MarqueeHeader, StageFrame, StatusBar } from './chrome';
import type { MarqueeVariant } from './chrome/MarqueeHeader';
import type { StageFrameStyle } from '../../theme/theme.types';
import { getSessionThemeSettings, type GameKey } from './sessionTheme';
import './GameShell.css';

export type ViewMode = 'display' | 'player' | 'host';
export type FooterVariant = 'statusbar' | 'minimal' | 'none';

export interface GameShellProps {
  gameKey: GameKey;
  viewMode: ViewMode;
  title: string;
  subtitle?: string;
  themeId?: ThemeId;
  sceneId?: SceneId;
  motionLevel?: MotionLevel;
  headerVariant?: MarqueeVariant;
  footerVariant?: FooterVariant;
  /** Optional data attributes on root (e.g. data-feud-view for Survey Showdown overlay) */
  optionalData?: Record<string, string>;
  headerRightSlot?: React.ReactNode;
  mainSlot: React.ReactNode;
  sidebarSlot?: React.ReactNode;
  statusBarProps?: {
    joinCount?: number;
    joinCode?: string;
    showQR?: boolean;
    onToggleQR?: () => void;
    timer?: string | number;
    stateBadge?: string;
  };
  className?: string;
}

export function GameShell({
  gameKey,
  viewMode,
  title,
  subtitle,
  themeId: themeOverride,
  sceneId: sceneOverride,
  motionLevel: motionOverride,
  headerVariant = 'banner',
  footerVariant = 'statusbar',
  optionalData,
  headerRightSlot,
  mainSlot,
  sidebarSlot,
  statusBarProps,
  className = ''
}: GameShellProps) {
  const { themeId: siteThemeId, motionLevel: siteMotion } = usePlayroomTheme();
  const session = getSessionThemeSettings(gameKey, siteThemeId, {
    themeId: themeOverride,
    sceneId: sceneOverride,
    motionLevel: motionOverride ?? siteMotion
  });
  const themeId = session.skinMode === 'override_theme' && session.themeId ? session.themeId : siteThemeId;
  const sceneId = sceneOverride ?? session.sceneId;
  const motionLevel = motionOverride ?? session.motionLevel;
  const tokens = getTheme(themeId);

  const themeStyle = React.useMemo(
    () => getThemeCSSVars(tokens, motionLevel),
    [tokens, motionLevel]
  );
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stageVariant = (tokens.gameChromeDefaults.stageFrame || 'none') as StageFrameStyle;
  const effectiveHeaderVariant =
    tokens.gameChromeDefaults.marqueeHeader && headerVariant !== 'minimal'
      ? 'marqueePop'
      : headerVariant;

  React.useEffect(() => {
    if (gameKey !== 'survey_showdown') return;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d66f648c-52ab-4d0d-8633-ae9fa71a16a6', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'GameShell.tsx:MarqueeHeader', message: 'survey_showdown header props', data: { hypothesisId: 'H2', title, subtitle: subtitle ?? null, subtitleLength: (subtitle ?? '').length }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
  }, [gameKey, title, subtitle]);

  return (
    <div
      className={`pr-app pr-gameshell pr-gameshell--${viewMode} ${className}`.trim()}
      data-game={gameKey}
      data-view={viewMode}
      data-pr-theme={themeId}
      data-pr-motion={motionLevel}
      {...(optionalData ?? {})}
      style={themeStyle}
    >
      <div className="pr-scene-layer" aria-hidden>
        <BackgroundScene
          sceneId={sceneId}
          intensity={1}
          reducedMotion={reducedMotion}
          className="pr-gameshell__scene"
        />
      </div>
      <div className="pr-gameshell__chrome">
        <header className="pr-gameshell__header">
          <div className="pr-gameshell__header-left">
            <MarqueeHeader
              title={title}
              subtitle={subtitle}
              variant={effectiveHeaderVariant}
            />
          </div>
          {headerRightSlot && (
            <div className="pr-gameshell__header-right">{headerRightSlot}</div>
          )}
        </header>
        <div className="pr-gameshell__stage-wrap">
          <StageFrame
            variant={stageVariant}
            floorReflection={themeId !== 'classic'}
            shimmer={motionLevel === 'hype'}
          >
            <div className="pr-gameshell__main">{mainSlot}</div>
          </StageFrame>
        </div>
        {sidebarSlot && <aside className="pr-gameshell__sidebar">{sidebarSlot}</aside>}
        {footerVariant === 'statusbar' && (
          <StatusBar
            joinCount={statusBarProps?.joinCount}
            joinCode={statusBarProps?.joinCode}
            showQR={statusBarProps?.showQR}
            onToggleQR={statusBarProps?.onToggleQR}
            timer={statusBarProps?.timer}
            stateBadge={statusBarProps?.stateBadge}
          />
        )}
      </div>
    </div>
  );
}

