/**
 * Survey Showdown — Layer 1: frame art + safe area. Right frame per screen (TV vs player answer/waiting/reveal).
 */
import React from 'react';
import { TV_SAFE_AREA, PLAYER_SAFE_AREA, getFrameSrc, type PlayerFrameScene, isSurveyShowdownDebug } from './surveyShowdownConstants';
import './SurveyShowdownFrame.css';

export interface SurveyShowdownFrameProps {
  variant: 'tv' | 'player';
  /** Player only: which screen so the correct frame is used (answer | waiting | reveal). */
  scene?: PlayerFrameScene;
  children: React.ReactNode;
}

export function SurveyShowdownFrame({ variant, scene, children }: SurveyShowdownFrameProps) {
  const safe = variant === 'tv' ? TV_SAFE_AREA : PLAYER_SAFE_AREA;
  const debug = isSurveyShowdownDebug();
  const src = getFrameSrc(variant, scene);

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
