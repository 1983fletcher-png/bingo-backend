/**
 * Theme Lab — preview theme, scene, motion and sample components.
 * Internal dev route: /theme-lab
 * @see docs/PLAYROOM-THEMING-SPEC.md §11
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import type { ThemeId, SceneId, MotionLevel } from '../../theme/theme.types';
import { THEME_IDS, getTheme } from '../../theme/themeRegistry';
import { getThemeCSSVars } from '../../theme/applyTheme';
import { MarqueeHeader, StageFrame, Tile, AnswerPlate } from '../../games/shared/chrome';
import { GameShell } from '../../games/shared/GameShell';
import { BackgroundScene } from '../../theme/scenes/BackgroundScene';

const SCENE_IDS: SceneId[] = ['arcadeCarpet', 'studio', 'mountains'];
const MOTION_LEVELS: MotionLevel[] = ['calm', 'standard', 'hype'];

export default function ThemeLabPage() {
  const [themeId, setThemeId] = useState<ThemeId>('classic');
  const [sceneId, setSceneId] = useState<SceneId>('arcadeCarpet');
  const [motionLevel, setMotionLevel] = useState<MotionLevel>('standard');
  const [clickDebug, setClickDebug] = useState(false);
  const outlineRef = useRef<HTMLDivElement | null>(null);

  const tokens = useMemo(() => getTheme(themeId), [themeId]);
  const themeStyle = useMemo(() => getThemeCSSVars(tokens, motionLevel), [tokens, motionLevel]);

  const handlePageClick = useCallback(
    (e: React.MouseEvent) => {
      if (!clickDebug) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el) {
        console.log('[ThemeLab click debug] elementFromPoint:', el.tagName, el.className, el);
        const rect = el.getBoundingClientRect();
        if (outlineRef.current) {
          outlineRef.current.style.display = 'block';
          outlineRef.current.style.left = `${rect.left}px`;
          outlineRef.current.style.top = `${rect.top}px`;
          outlineRef.current.style.width = `${rect.width}px`;
          outlineRef.current.style.height = `${rect.height}px`;
        }
      }
    },
    [clickDebug]
  );

  return (
    <div
      className="pr-page"
      style={{ ...themeStyle, position: 'relative' }}
      data-pr-theme={themeId}
      data-pr-motion={motionLevel}
      onClick={handlePageClick}
    >
      {/* Dev-only: red outline of element under cursor when click debug is on */}
      {clickDebug && (
        <div
          ref={outlineRef}
          aria-hidden
          style={{
            display: 'none',
            position: 'fixed',
            border: '3px solid red',
            pointerEvents: 'none',
            zIndex: 99999,
            boxSizing: 'border-box',
          }}
        />
      )}
      <div style={{ padding: '1rem', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>THEME LAB LOADED</div>
        <h1 style={{ fontFamily: 'var(--pr-font-display)', marginBottom: '0.5rem' }}>
          Theme Lab
        </h1>
        <p style={{ color: 'var(--pr-muted)', marginBottom: '1.5rem' }}>
          Preview skins, scenes, and motion. Use dropdowns to switch.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <label>
            Theme
            <select
              value={themeId}
              onChange={(e) => setThemeId(e.target.value as ThemeId)}
              style={{
                marginLeft: 8,
                padding: '0.25rem 0.5rem',
                background: 'var(--pr-surface)',
                color: 'var(--pr-text)',
                border: '1px solid var(--pr-border)',
                borderRadius: 'var(--pr-radius-sm)'
              }}
            >
              {THEME_IDS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Scene
            <select
              value={sceneId}
              onChange={(e) => setSceneId(e.target.value as SceneId)}
              style={{
                marginLeft: 8,
                padding: '0.25rem 0.5rem',
                background: 'var(--pr-surface)',
                color: 'var(--pr-text)',
                border: '1px solid var(--pr-border)',
                borderRadius: 'var(--pr-radius-sm)'
              }}
            >
              {SCENE_IDS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Motion
            <select
              value={motionLevel}
              onChange={(e) => setMotionLevel(e.target.value as MotionLevel)}
              style={{
                marginLeft: 8,
                padding: '0.25rem 0.5rem',
                background: 'var(--pr-surface)',
                color: 'var(--pr-text)',
                border: '1px solid var(--pr-border)',
                borderRadius: 'var(--pr-radius-sm)'
              }}
            >
              {MOTION_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label style={{ marginLeft: '1rem' }}>
            <input
              type="checkbox"
              checked={clickDebug}
              onChange={(e) => setClickDebug(e.target.checked)}
            />
            <span style={{ marginLeft: 6, fontSize: 13, color: 'var(--pr-muted)' }}>
              Click debug (outline + console)
            </span>
          </label>
        </div>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            Site card + buttons
          </h2>
          <div className="pr-surface" style={{ padding: '1rem', marginBottom: '0.5rem' }}>
            <p style={{ margin: 0 }}>Sample card using --pr-surface</p>
          </div>
          <button type="button" className="pr-btn pr-btn-primary" style={{ marginRight: '0.5rem' }}>
            Primary
          </button>
          <button type="button" className="pr-btn">
            Secondary
          </button>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            Marquee header
          </h2>
          <MarqueeHeader title="Survey Showdown" subtitle="Round 1" variant="marqueePop" />
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            Stage frame
          </h2>
          <StageFrame variant="lightbar" floorReflection shimmer={motionLevel === 'hype'}>
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--pr-muted)' }}>
              Stage content area
            </div>
          </StageFrame>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            Sample grid tiles
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Tile variant="flat">Flat</Tile>
            <Tile variant="bezel">Bezel</Tile>
            <Tile variant="neon">Neon</Tile>
            <Tile variant="bezel" selected>Selected</Tile>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            Answer plates
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <AnswerPlate variant="flat">Flat answer</AnswerPlate>
            <AnswerPlate variant="hingeFlip" revealed>Hinge revealed</AnswerPlate>
            <AnswerPlate variant="rolodexFlip">Rolodex</AnswerPlate>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            GameShell — Display mock
          </h2>
          <div style={{ height: 320, position: 'relative', borderRadius: 'var(--pr-radius-lg)', overflow: 'hidden' }}>
            <GameShell
              gameKey="survey_showdown"
              viewMode="display"
              title="Survey Showdown"
              subtitle="Round 1"
              sceneId={sceneId}
              themeId={themeId}
              motionLevel={motionLevel}
              headerRightSlot={<span style={{ fontSize: '0.875rem', color: 'var(--pr-muted)' }}>ABC123</span>}
              mainSlot={
                <div style={{ padding: '1rem', color: 'var(--pr-muted)', fontSize: '0.9rem' }}>
                  Display view — main slot
                </div>
              }
              statusBarProps={{ joinCode: 'ABC123', joinCount: 12, stateBadge: 'Waiting' }}
            />
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            GameShell — Player mock
          </h2>
          <div style={{ height: 320, position: 'relative', borderRadius: 'var(--pr-radius-lg)', overflow: 'hidden' }}>
            <GameShell
              gameKey="survey_showdown"
              viewMode="player"
              title="Survey Showdown"
              sceneId={sceneId}
              themeId={themeId}
              motionLevel={motionLevel}
              mainSlot={
                <div style={{ padding: '1rem', color: 'var(--pr-muted)', fontSize: '0.9rem' }}>
                  Player view — main slot
                </div>
              }
              footerVariant="minimal"
            />
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            Background scene only
          </h2>
          <div style={{ height: 200, position: 'relative', borderRadius: 'var(--pr-radius-md)', overflow: 'hidden' }}>
            <BackgroundScene sceneId={sceneId} intensity={1} />
          </div>
        </section>
      </div>
    </div>
  );
}
