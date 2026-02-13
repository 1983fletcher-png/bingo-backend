/**
 * Reusable GameShell wrapper — reads useTheme(), provides consistent Host/Display/Player framing.
 * Background scene layer (data-scene), marquee header, stage frame, optional footer (code/status).
 * Use for Survey Showdown, Market Match, Crowd Control so theme applies consistently.
 */

import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { GameShell as SharedGameShell } from '../games/shared/GameShell';
import type { GameKey } from '../games/shared/sessionTheme';
import type { ThemeId } from '../theme/theme.types';
import { siteThemeToRegistryId } from '../theme/themeTypes';

export type GameShellVariant = 'host' | 'display' | 'player';

export interface GameShellProps {
  title: string;
  subtitle?: string;
  code?: string;
  variant: GameShellVariant;
  children: React.ReactNode;
  gameKey?: GameKey;
  /** Optional theme override (session theme from room) */
  themeId?: ThemeId;
  /** Optional status bar (join count, QR, timer). If omitted and code is set, only joinCode is shown. */
  statusBarProps?: {
    joinCount?: number;
    joinCode?: string;
    showQR?: boolean;
    onToggleQR?: () => void;
    timer?: string | number;
    stateBadge?: string;
  };
  /** Override footer: 'minimal' | 'statusbar' | 'none'. Default: player=minimal, host/display=statusbar */
  footerVariant?: 'minimal' | 'statusbar' | 'none';
  /** Survey Showdown player view state — picks which mockup overlay to show (answer | waiting | reveal) */
  feudView?: 'answer' | 'waiting' | 'reveal';
  /** When "mockup", shell layout is neutralized so SurveyShowdownFrame slot geometry is stable. */
  frameMode?: 'mockup' | 'css';
}

/** Map variant to shared viewMode */
const variantToViewMode = (v: GameShellVariant): 'host' | 'display' | 'player' => v;

export function GameShell({
  title,
  subtitle,
  code,
  variant,
  children,
  gameKey = 'survey_showdown',
  themeId,
  statusBarProps: statusBarOverride,
  footerVariant: footerOverride,
  feudView,
  frameMode,
}: GameShellProps) {
  const { theme } = useTheme();
  const themeIdResolved = themeId ?? (siteThemeToRegistryId(theme) as ThemeId);
  const statusBarProps = statusBarOverride ?? (code ? { joinCode: code.toUpperCase() } : undefined);
  const footerVariant = footerOverride ?? (variant === 'player' ? 'minimal' : 'statusbar');
  const optionalData: Record<string, string> = { ...(feudView ? { 'data-feud-view': feudView } : {}), ...(frameMode ? { 'data-frame': frameMode } : {}) };
  const optionalDataOrUndefined = Object.keys(optionalData).length > 0 ? optionalData : undefined;

  return (
    <SharedGameShell
      gameKey={gameKey}
      viewMode={variantToViewMode(variant)}
      title={title}
      subtitle={subtitle}
      themeId={themeIdResolved}
      optionalData={optionalDataOrUndefined}
      headerRightSlot={
        code ? (
          <span style={{ fontSize: '0.875rem', color: 'var(--pr-muted)', letterSpacing: '0.1em' }}>
            {code.toUpperCase()}
          </span>
        ) : undefined
      }
      mainSlot={children}
      statusBarProps={statusBarProps}
      footerVariant={footerVariant}
    />
  );
}
