/**
 * Shared Panel — theme tokens only; variants: surface1, surface2.
 */

import React from 'react';
import './ui.css';

export type PanelVariant = 'surface1' | 'surface2';

export interface PanelProps {
  variant?: PanelVariant;
  children: React.ReactNode;
  className?: string;
}

export function Panel({ variant = 'surface1', children, className = '' }: PanelProps) {
  return (
    <div className={`pr-ui-panel pr-ui-panel--${variant} ${className}`.trim()}>
      {children}
    </div>
  );
}
