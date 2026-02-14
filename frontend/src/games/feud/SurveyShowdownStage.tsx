/**
 * Survey Showdown — Content-first stage: the game-show set is built *around* the blocks.
 * No backdrop image alignment; title, prompt, content, and UI slots are layout regions
 * that the stage wraps. Tabs, text entry, and reveals live inside these blocks.
 */
import React from 'react';
import './SurveyShowdownStage.css';

export interface SurveyShowdownStageProps {
  variant: 'tv' | 'player';
  /** Game/round title (e.g. "Survey Showdown · Round 1") */
  titleSlot?: React.ReactNode;
  /** Question or phase prompt */
  promptSlot?: React.ReactNode;
  /** Main content: form, waiting list, board, etc. */
  contentSlot?: React.ReactNode;
  /** Overlay UI (e.g. "TOP 3" badge, controls) — positioned on the stage, not in flow */
  uiSlot?: React.ReactNode;
  children?: React.ReactNode;
  /** Arcade game-show look: multi-color bulbs, retro carpet floor, prominent marquee */
  stageTheme?: 'default' | 'arcade';
  /** Marquee subtitle (e.g. "Playroom") — small, corner/cursive, neon style */
  marqueeSubtitle?: string;
  /** Marquee main title (e.g. "Crowd Control Trivia") — center pop-out, bold */
  marqueeTitle?: string;
  /** Content block alignment: 'center' (default) or 'top' (stage fills from top, e.g. CCT TV) */
  contentPosition?: 'center' | 'top';
}

export function SurveyShowdownStage({
  variant,
  titleSlot,
  promptSlot,
  contentSlot,
  uiSlot,
  children,
  stageTheme = 'default',
  marqueeSubtitle,
  marqueeTitle,
  contentPosition = 'center',
}: SurveyShowdownStageProps) {
  const isArcade = stageTheme === 'arcade';
  const hasArcadeMarquee = isArcade && (marqueeSubtitle != null || marqueeTitle != null);

  return (
    <div
      className={`survey-showdown-stage survey-showdown-stage--${variant}${isArcade ? ' survey-showdown-stage--arcade' : ''}${contentPosition === 'top' ? ' survey-showdown-stage--content-top' : ''}`}
      data-variant={variant}
      data-stage-theme={stageTheme}
      data-content-position={contentPosition}
    >
      {/* Big light marquee — border of bulbs around the stage (arcade: multi-color cycle) */}
      <div className="survey-showdown-stage__marquee-lights" aria-hidden>
        <span className="survey-showdown-stage__marquee-edge survey-showdown-stage__marquee-edge--top" />
        <span className="survey-showdown-stage__marquee-edge survey-showdown-stage__marquee-edge--right" />
        <span className="survey-showdown-stage__marquee-edge survey-showdown-stage__marquee-edge--bottom" />
        <span className="survey-showdown-stage__marquee-edge survey-showdown-stage__marquee-edge--left" />
      </div>

      {/* Ambient FX (sweep / glow) — behind content */}
      <div className="survey-showdown-stage__fx" aria-hidden>
        <div className="survey-showdown-stage__ambient" />
        <div className="survey-showdown-stage__sweep" />
      </div>

      {/* Floor — default shiny strip; arcade: retro arcade carpet */}
      <div className="survey-showdown-stage__floor" aria-hidden />

      {/* Content blocks: the stage is literally built around these */}
      <div className="survey-showdown-stage__inner">
        {hasArcadeMarquee && (
          <div className="survey-showdown-stage__arcade-marquee">
            {marqueeSubtitle != null && marqueeSubtitle !== '' && (
              <span className="survey-showdown-stage__arcade-marquee-subtitle">{marqueeSubtitle}</span>
            )}
            {marqueeTitle != null && marqueeTitle !== '' && (
              <h1 className="survey-showdown-stage__arcade-marquee-title">{marqueeTitle}</h1>
            )}
          </div>
        )}
        {titleSlot != null && (
          <div className="survey-showdown-stage__block survey-showdown-stage__block--title">
            {titleSlot}
          </div>
        )}
        {promptSlot != null && (
          <div className="survey-showdown-stage__block survey-showdown-stage__block--prompt">
            {promptSlot}
          </div>
        )}
        {contentSlot != null && (
          <div className="survey-showdown-stage__block survey-showdown-stage__block--content">
            {contentSlot}
          </div>
        )}
        {children}
      </div>

      {/* UI overlay (badges, etc.) — above blocks, pointer-events on children only */}
      {uiSlot != null && (
        <div className="survey-showdown-stage__ui">
          {uiSlot}
        </div>
      )}
    </div>
  );
}
