/**
 * Game chrome — stage frame variants: none | lightbar | bezel.
 * Optional floor reflection; optional shimmer when motion=hype.
 */

import React from 'react';
import type { StageFrameStyle } from '../../../theme/theme.types';
import './StageFrame.css';

export interface StageFrameProps {
  variant?: StageFrameStyle;
  floorReflection?: boolean;
  shimmer?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function StageFrame({
  variant = 'none',
  floorReflection = false,
  shimmer = false,
  children,
  className = ''
}: StageFrameProps) {
  return (
    <div
      className={`stage-frame pr-stage pr-stage--${variant} ${floorReflection ? 'pr-stage--floor' : ''} ${shimmer ? 'pr-stage--shimmer' : ''} ${className}`.trim()}
      data-stage={variant}
    >
      {variant === 'lightbar' && <div className="pr-stage__lightbar pr-stage__lightbar--top" />}
      {variant === 'lightbar' && <div className="pr-stage__lightbar pr-stage__lightbar--bottom" />}
      {variant === 'bezel' && <div className="pr-stage__bezel" />}
      <div className="pr-stage__content">{children}</div>
      {floorReflection && <div className="pr-stage__floor" aria-hidden />}
    </div>
  );
}
