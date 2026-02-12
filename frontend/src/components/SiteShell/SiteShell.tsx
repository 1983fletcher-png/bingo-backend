/**
 * SiteShell — consistent page padding, card styling, headers using theme vars.
 * Wrap app routes so non-game pages (Home, Activity Room, Host rail) share the same tokens.
 */
import React from 'react';
import './SiteShell.css';

export interface SiteShellProps {
  children: React.ReactNode;
  /** Optional page title (e.g. for accessibility) */
  title?: string;
  className?: string;
}

export function SiteShell({ children, title, className = '' }: SiteShellProps) {
  return (
    <div className={`site-shell ${className}`.trim()} role={title ? 'main' : undefined} aria-label={title}>
      {children}
    </div>
  );
}
