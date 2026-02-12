/**
 * Survey Showdown — Layer 1: frame-only art + safe area. No baked answers/numbers.
 */
import React from 'react';
import { TV_SAFE_AREA, PLAYER_SAFE_AREA, FRAME_ASSETS, isSurveyShowdownDebug } from './surveyShowdownConstants';
import './SurveyShowdownFrame.css';

export interface SurveyShowdownFrameProps {
  variant: 'tv' | 'player';
  children: React.ReactNode;
}

export function SurveyShowdownFrame({ variant, children }: SurveyShowdownFrameProps) {
  const safe = variant === 'tv' ? TV_SAFE_AREA : PLAYER_SAFE_AREA;
  const debug = isSurveyShowdownDebug();

  return (
    <div className={`survey-showdown-frame survey-showdown-frame--${variant}`} data-variant={variant}>
      <img
        src={FRAME_ASSETS[variant]}
        alt=""
        className="survey-showdown-frame__img"
        role="presentation"
      />
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
      {debug && (
        <div className="survey-showdown-frame__debug-outline survey-showdown-frame__debug-outline--frame" aria-hidden />
      )}
    </div>
  );
}
