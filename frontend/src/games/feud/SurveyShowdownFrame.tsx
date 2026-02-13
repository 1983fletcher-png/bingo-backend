/**
 * Survey Showdown — Layer 1: frame art + contain-aware slots so content lands inside the rendered image.
 * Slots/masks are positioned relative to the contained image rect (object-fit: contain), not the container.
 */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

export type ImgRect = { x: number; y: number; w: number; h: number };

export function computeContainedImageRect(
  containerW: number,
  containerH: number,
  imgW: number,
  imgH: number
): ImgRect {
  if (containerW <= 0 || containerH <= 0 || imgW <= 0 || imgH <= 0) {
    return { x: 0, y: 0, w: containerW, h: containerH };
  }
  const scale = Math.min(containerW / imgW, containerH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  const x = (containerW - w) / 2;
  const y = (containerH - h) / 2;
  return { x, y, w, h };
}

export interface SurveyShowdownFrameProps {
  variant: 'tv' | 'player';
  scene?: PlayerFrameScene;
  children?: React.ReactNode;
  titleSlot?: React.ReactNode;
  promptSlot?: React.ReactNode;
  contentSlot?: React.ReactNode;
  uiSlot?: React.ReactNode;
  /** Optional rects (0..1 of image) to mask baked placeholder regions until blank assets are used. */
  maskRects?: SafeArea[];
}

function SlotDiv({
  slot,
  className,
  children,
  imgRect,
}: {
  slot: SafeArea;
  className: string;
  children: React.ReactNode;
  imgRect: ImgRect;
}) {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        left: imgRect.x + slot.x * imgRect.w,
        top: imgRect.y + slot.y * imgRect.h,
        width: slot.w * imgRect.w,
        height: slot.h * imgRect.h,
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
  maskRects,
}: SurveyShowdownFrameProps) {
  const useSlots = titleSlot != null || promptSlot != null || contentSlot != null;
  const safe = variant === 'tv' ? TV_SAFE_AREA : PLAYER_SAFE_AREA;
  const debug = isSurveyShowdownDebug();
  const src = getFrameSrc(variant, scene);
  const slots = variant === 'tv' ? TV_SLOTS : PLAYER_SLOTS;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [imgRect, setImgRect] = useState<ImgRect>({ x: 0, y: 0, w: 0, h: 0 });

  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setImgNatural({ w: img.naturalWidth || 0, h: img.naturalHeight || 0 });
  };

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const updateRect = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      setImgRect(computeContainedImageRect(cw, ch, imgNatural.w, imgNatural.h));
    };

    const ro = new ResizeObserver(updateRect);
    ro.observe(el);
    return () => ro.disconnect();
  }, [imgNatural.w, imgNatural.h]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    setImgRect(computeContainedImageRect(cw, ch, imgNatural.w, imgNatural.h));
  }, [imgNatural.w, imgNatural.h]);

  return (
    <div
      ref={wrapRef}
      className={`survey-showdown-frame survey-showdown-frame--${variant}${scene ? ` survey-showdown-frame--${scene}` : ''}`}
      data-variant={variant}
      data-scene={scene ?? undefined}
    >
      <img
        ref={imgRef}
        onLoad={onImgLoad}
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
      {maskRects != null && maskRects.length > 0 && (
        <div className="survey-showdown-frame__mask" aria-hidden="true">
          {maskRects.map((r, i) => (
            <div
              key={i}
              className="survey-showdown-frame__maskRect"
              style={{
                position: 'absolute',
                left: imgRect.x + r.x * imgRect.w,
                top: imgRect.y + r.y * imgRect.h,
                width: r.w * imgRect.w,
                height: r.h * imgRect.h,
              }}
            />
          ))}
        </div>
      )}
      {useSlots ? (
        <>
          {variant === 'tv' && titleSlot != null && (
            <SlotDiv slot={TV_SLOTS.title} imgRect={imgRect} className="survey-showdown-frame__slot survey-showdown-frame__slot--title">
              {titleSlot}
            </SlotDiv>
          )}
          {promptSlot != null && (
            <SlotDiv slot={slots.prompt} imgRect={imgRect} className="survey-showdown-frame__slot survey-showdown-frame__slot--prompt">
              {promptSlot}
            </SlotDiv>
          )}
          {contentSlot != null && (
            <SlotDiv slot={slots.content} imgRect={imgRect} className="survey-showdown-frame__slot survey-showdown-frame__slot--content">
              {contentSlot}
            </SlotDiv>
          )}
        </>
      ) : (
        <div
          className={`survey-showdown-frame__safe ${debug ? 'survey-showdown-frame__safe--debug' : ''}`}
          style={{
            position: 'absolute',
            left: imgRect.x + safe.x * imgRect.w,
            top: imgRect.y + safe.y * imgRect.h,
            width: safe.w * imgRect.w,
            height: safe.h * imgRect.h,
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
        <div
          className="survey-showdown-frame__imgRectDebug"
          style={{
            position: 'absolute',
            left: imgRect.x,
            top: imgRect.y,
            width: imgRect.w,
            height: imgRect.h,
            outline: '2px dashed rgba(0, 200, 255, 0.8)',
            outlineOffset: '-2px',
            zIndex: 2,
            pointerEvents: 'none',
          }}
          aria-hidden
        />
      )}
      {debug && (
        <div className="survey-showdown-frame__debug-outline survey-showdown-frame__debug-outline--frame" aria-hidden />
      )}
    </div>
  );
}
