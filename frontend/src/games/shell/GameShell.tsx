/**
 * GameShell — task API: title, subtitle, code, variant, children.
 * Wraps shared GameShell; background/scene layers use pointer-events: none.
 * @see docs/CREATIVE-ROOM-CODE-AND-WIRING.md
 */

import React from 'react';
import { GameShell as SharedGameShell } from '../shared/GameShell';
import type { GameKey } from '../shared/sessionTheme';
import './GameShell.css';

export type GameShellVariant = 'display' | 'player' | 'host';

export interface GameShellProps {
  title: string;
  subtitle?: string;
  code?: string;
  variant: GameShellVariant;
  children: React.ReactNode;
  /** Optional: for session theme override */
  gameKey?: GameKey;
}

/**
 * GameShell with task spec props. Background scene uses --pr-scene-bg (via shared shell);
 * decorative layers have pointer-events: none in GameShell.css.
 */
export function GameShell({
  title,
  subtitle,
  code,
  variant,
  children,
  gameKey = 'survey_showdown'
}: GameShellProps) {
  return (
    <SharedGameShell
      gameKey={gameKey}
      viewMode={variant}
      title={title}
      subtitle={subtitle}
      headerRightSlot={
        code ? (
          <span className="pr-gameshell-shell__code" style={{ fontSize: '0.875rem', color: 'var(--pr-muted)' }}>
            {code}
          </span>
        ) : undefined
      }
      mainSlot={children}
      statusBarProps={code ? { joinCode: code } : undefined}
    />
  );
}
