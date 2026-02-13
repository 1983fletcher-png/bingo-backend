/**
 * Survey Showdown — Layer 1: frame art + slot-based layout for game-show polish.
 * Use titleSlot / promptSlot / contentSlot so dynamic content sits in the right regions of the frame.
 */
import React from 'react';
import {
  TV_SAFE_AREA,
  PLAYER_SAFE_AREA,
  TV_SLOTS,
  PLAYER_SLOTS,
  getFrameSrc,
  type PlayerFrameScene,
  isSurveyShowdownDebug,
  type SafeArea,
} from './surveyShowdownConstants';
import './SurveyShowdownFrame.css';

export interface SurveyShowdownFrameProps {
  variant: 'tv' | 'player';
  /** Player only: which screen so the correct frame is used (answer | waiting | reveal). */
  scene?: PlayerFrameScene;
  /**
   * Legacy: single content area. Ignored when any of titleSlot/promptSlot/contentSlot are provided.
   */
  children?: React.ReactNode;
  /** TV: game name, "Round N". Player: not used. */
  titleSlot?: React.ReactNode;
  /** Question / prompt text (both TV and player). */
  promptSlot?: React.ReactNode;
  /** Main content: standby card, collect (QR + counts), board, or player form/waiting. */
  contentSlot?: React.ReactNode;
  /** Overlay channel: UI pills/banners (e.g. "TOP 3") that sit above slots, same z-tier. */
  uiSlot?: React.ReactNode;
}

function SlotDiv({ slot, className, children }: { slot: SafeArea; className: string; children: React.ReactNode }) {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        left: `${slot.x * 100}%`,
        top: `${slot.y * 100}%`,
        width: `${slot.w * 100}%`,
        height: `${slot.h * 100}%`,
      }}
    >
      {children}
    </div>
  );
}

export function SurveyShowdownFrame({
  variant,
  scene,
  children,
  titleSlot,
  promptSlot,
  contentSlot,
  uiSlot,
}: SurveyShowdownFrameProps) {
  const useSlots = titleSlot != null || promptSlot != null || contentSlot != null;
  const safe = variant === 'tv' ? TV_SAFE_AREA : PLAYER_SAFE_AREA;
  const debug = isSurveyShowdownDebug();
  const src = getFrameSrc(variant, scene);
  const slots = variant === 'tv' ? TV_SLOTS : PLAYER_SLOTS;

  return (
    <div
      className={`survey-showdown-frame survey-showdown-frame--${variant}${scene ? ` survey-showdown-frame--${scene}` : ''}`}
      data-variant={variant}
      data-scene={scene ?? undefined}
    >
      <img
        src={src}
        alt=""
        className="survey-showdown-frame__img"
        role="presentation"
      />
      <div className="survey-showdown-frame__fx" aria-hidden="true">
        <div className="survey-showdown-frame__marquee" />
        <div className="survey-showdown-frame__sweep" />
        <div className="survey-showdown-frame__sparkle" />
      </div>
      {useSlots ? (
        <>
          {variant === 'tv' && titleSlot != null && (
            <SlotDiv slot={TV_SLOTS.title} className="survey-showdown-frame__slot survey-showdown-frame__slot--title">
              {titleSlot}
            </SlotDiv>
          )}
          {promptSlot != null && (
            <SlotDiv slot={slots.prompt} className="survey-showdown-frame__slot survey-showdown-frame__slot--prompt">
              {promptSlot}
            </SlotDiv>
          )}
          {contentSlot != null && (
            <SlotDiv slot={slots.content} className="survey-showdown-frame__slot survey-showdown-frame__slot--content">
              {contentSlot}
            </SlotDiv>
          )}
        </>
      ) : (
        <div
          className={`survey-showdown-frame__safe ${debug ? 'survey-showdown-frame__safe--debug' : ''}`}
          style={{
            left: `${safe.x * 100}%`,
            top: `${safe.y * 100}%`,
            width: `${safe.w * 100}%`,
            height: `${safe.h * 100}%`,
          }}
        >
          {children}
        </div>
      )}
      {uiSlot != null && (
        <div className="survey-showdown-frame__ui">
          {uiSlot}
        </div>
      )}
      {debug && (
        <div className="survey-showdown-frame__debug-outline survey-showdown-frame__debug-outline--frame" aria-hidden />
      )}
    </div>
  );
}
