/**
 * Game chrome — status bar: join count, code, QR toggles, timer, state badges.
 */

import React from 'react';
import './StatusBar.css';

export interface StatusBarProps {
  joinCount?: number;
  joinCode?: string;
  showQR?: boolean;
  onToggleQR?: () => void;
  timer?: string | number;
  stateBadge?: string;
  className?: string;
  children?: React.ReactNode;
}

export function StatusBar({
  joinCount,
  joinCode,
  showQR = false,
  onToggleQR,
  timer,
  stateBadge,
  className = '',
  children
}: StatusBarProps) {
  return (
    <footer className={`pr-statusbar ${className}`.trim()}>
      {stateBadge != null && stateBadge !== '' && (
        <span className="pr-statusbar__badge">{stateBadge}</span>
      )}
      {joinCode != null && joinCode !== '' && (
        <span className="pr-statusbar__code">{joinCode}</span>
      )}
      {typeof joinCount === 'number' && (
        <span className="pr-statusbar__count">{joinCount} joined</span>
      )}
      {onToggleQR != null && (
        <button
          type="button"
          className="pr-statusbar__qr pr-focus-ring"
          onClick={onToggleQR}
          aria-pressed={showQR}
        >
          {showQR ? 'Hide QR' : 'Show QR'}
        </button>
      )}
      {timer != null && <span className="pr-statusbar__timer">{String(timer)}</span>}
      {children}
    </footer>
  );
}
