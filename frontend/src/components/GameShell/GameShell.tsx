/**
 * GameShell — premium stage frame for TV (display), Player, and Host.
 * Renders marquee header, stage area with bevel/border/glow. No game logic.
 * Use theme vars; optional --stage-overlay from theme.
 */
import React from 'react';
import './GameShell.css';

export type GameShellMode = 'display' | 'player' | 'host';

export interface GameShellProps {
  title: string;
  subtitle?: string;
  code?: string;
  mode: GameShellMode;
  topRightSlot?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  /** Host mode: optional left rail content (buttons, links) */
  hostRail?: React.ReactNode;
  className?: string;
}

export function GameShell({
  title,
  subtitle,
  code,
  mode,
  topRightSlot,
  headerActions,
  children,
  hostRail,
  className = '',
}: GameShellProps) {
  const rightContent = topRightSlot ?? (code ? <span className="gshell__code">{code.toUpperCase()}</span> : null);

  return (
    <div className={`gshell gshell--${mode} ${className}`.trim()}>
      <header className="gshell__header">
        <div className="gshell__header-left">
          <h1 className="gshell__marquee-title">{title}</h1>
          {subtitle && <p className="gshell__marquee-subtitle">{subtitle}</p>}
        </div>
        <div className="gshell__header-right">
          {rightContent}
          {headerActions}
        </div>
      </header>

      {mode === 'host' && hostRail && <aside className="gshell__host-rail">{hostRail}</aside>}

      <div className="stage-frame gshell__stage">
        <div className="gshell__stage-inner">{children}</div>
      </div>
    </div>
  );
}
