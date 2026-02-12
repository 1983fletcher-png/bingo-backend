/**
 * PlayerLayout — top: mini stage preview (scaled TV look); bottom: input panel with CTA.
 * Same theme tokens and stage framing. Used by Survey Showdown, Market Match, CCT player views.
 */
import React from 'react';
import './PlayerLayout.css';

export interface PlayerLayoutProps {
  stage: React.ReactNode;
  input: React.ReactNode;
  className?: string;
}

export function PlayerLayout({ stage, input, className = '' }: PlayerLayoutProps) {
  return (
    <div className={`player-layout ${className}`.trim()}>
      <div className="stage-frame player-layout__stage" aria-label="Game stage preview">
        {stage}
      </div>
      <div className="player-layout__input">
        {input}
      </div>
    </div>
  );
}
