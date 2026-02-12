/**
 * Theme Lab — preview theme, scene, motion and sample components.
 * All controls call ThemeProvider setters (site default persisted to localStorage).
 * Internal dev route: /theme-lab
 * @see docs/PLAYROOM-THEMING-SPEC.md §11
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import { usePlayroomTheme } from '../../theme/ThemeProvider';
import { SITE_THEMES, SITE_SCENES, SITE_MOTIONS } from '../../theme/themeTypes';
import { getTheme } from '../../theme/themeRegistry';
import { getThemeCSSVars } from '../../theme/applyTheme';
import { MarqueeHeader, StageFrame, Tile, AnswerPlate } from '../../games/shared/chrome';
import { GameShell } from '../../games/shared/GameShell';
import { BackgroundScene } from '../../theme/scenes/BackgroundScene';

export default function ThemeLabPage() {
  const {
    themeId,
    sceneId,
    motionLevel,
    theme,
    motion,
    setTheme,
    setScene,
    setMotion,
    resetToDefaults
  } = usePlayroomTheme();
  const [clickDebug, setClickDebug] = useState(false);
  const [lastClickedButton, setLastClickedButton] = useState<string | null>(null);
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
      className="pr-page pr-app"
      style={{ ...themeStyle, position: 'relative', zIndex: 0 }}
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
      {/* Main content: full-height interactive layer so ALL sections (tiles, plates, GameShell chrome) receive clicks */}
      <div
        className="pr-themelab-content"
        style={{
          padding: '1rem',
          maxWidth: 1200,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          pointerEvents: 'auto',
          isolation: 'isolate',
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 12 }}>THEME LAB LOADED</div>
        {/* Debug banner: current theme / scene / motion */}
        <div
          style={{
            marginBottom: 12,
            padding: '0.5rem 0.75rem',
            background: 'var(--pr-surface2)',
            borderRadius: 'var(--pr-radius-md)',
            fontSize: 14,
            color: 'var(--pr-muted)'
          }}
        >
          Theme: <strong style={{ color: 'var(--pr-text)' }}>{theme}</strong>
          {' / '}
          Scene: <strong style={{ color: 'var(--pr-text)' }}>{sceneId}</strong>
          {' / '}
          Motion: <strong style={{ color: 'var(--pr-text)' }}>{motion}</strong>
          {' — '}
          <button
            type="button"
            onClick={resetToDefaults}
            style={{
              padding: '0.2rem 0.5rem',
              fontSize: 12,
              background: 'var(--pr-surface)',
              color: 'var(--pr-text)',
              border: '1px solid var(--pr-border)',
              borderRadius: 'var(--pr-radius-sm)',
              cursor: 'pointer'
            }}
          >
            Reset to defaults
          </button>
        </div>
        <h1 style={{ fontFamily: 'var(--pr-font-display)', marginBottom: '0.5rem' }}>
          Theme Lab
        </h1>
        <p style={{ color: 'var(--pr-muted)', marginBottom: '1.5rem' }}>
          Preview skins, scenes, and motion. Use dropdowns to switch (persisted to localStorage).
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
          <label>
            Theme
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as typeof theme)}
              style={{
                marginLeft: 8,
                padding: '0.25rem 0.5rem',
                background: 'var(--pr-surface)',
                color: 'var(--pr-text)',
                border: '1px solid var(--pr-border)',
                borderRadius: 'var(--pr-radius-sm)'
              }}
            >
              {SITE_THEMES.map((id) => (
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
              onChange={(e) => setScene(e.target.value as typeof sceneId)}
              style={{
                marginLeft: 8,
                padding: '0.25rem 0.5rem',
                background: 'var(--pr-surface)',
                color: 'var(--pr-text)',
                border: '1px solid var(--pr-border)',
                borderRadius: 'var(--pr-radius-sm)'
              }}
            >
              {SITE_SCENES.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Motion
            <select
              value={motion}
              onChange={(e) => setMotion(e.target.value as typeof motion)}
              style={{
                marginLeft: 8,
                padding: '0.25rem 0.5rem',
                background: 'var(--pr-surface)',
                color: 'var(--pr-text)',
                border: '1px solid var(--pr-border)',
                borderRadius: 'var(--pr-radius-sm)'
              }}
            >
              {SITE_MOTIONS.map((l) => (
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

        <section style={{ marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            Site card + buttons
          </h2>
          <div className="pr-surface" style={{ padding: '1rem', marginBottom: '0.5rem' }}>
            <p style={{ margin: 0 }}>Sample card using --pr-surface</p>
          </div>
          <button
            type="button"
            className="pr-btn pr-btn-primary"
            style={{ marginRight: '0.5rem' }}
            onClick={() => setLastClickedButton('Primary')}
          >
            Primary
          </button>
          <button type="button" className="pr-btn" onClick={() => setLastClickedButton('Secondary')}>
            Secondary
          </button>
          {lastClickedButton && (
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--pr-muted)' }}>
              Last clicked: {lastClickedButton}
            </span>
          )}
        </section>

        <section style={{ marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            Marquee header
          </h2>
          <MarqueeHeader title="Survey Showdown" subtitle="Round 1" variant="marqueePop" />
        </section>

        <section style={{ marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            Stage frame
          </h2>
          <StageFrame variant="lightbar" floorReflection shimmer={motionLevel === 'hype'}>
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--pr-muted)' }}>
              Stage content area
            </div>
          </StageFrame>
        </section>

        <section style={{ marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
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

        <section style={{ marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            Answer plates
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <AnswerPlate variant="flat">Flat answer</AnswerPlate>
            <AnswerPlate variant="hingeFlip" revealed>Hinge revealed</AnswerPlate>
            <AnswerPlate variant="rolodexFlip">Rolodex</AnswerPlate>
          </div>
        </section>

        <section style={{ marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            GameShell — Display mock
          </h2>
          <div style={{ height: 320, position: 'relative', zIndex: 1, borderRadius: 'var(--pr-radius-lg)', overflow: 'hidden' }}>
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

        <section style={{ marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            GameShell — Player mock
          </h2>
          <div style={{ height: 320, position: 'relative', zIndex: 1, borderRadius: 'var(--pr-radius-lg)', overflow: 'hidden' }}>
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

        <section style={{ marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--pr-muted)' }}>
            Background scene only
          </h2>
          <div style={{ height: 200, position: 'relative', zIndex: 1, borderRadius: 'var(--pr-radius-md)', overflow: 'hidden' }}>
            <BackgroundScene sceneId={sceneId} intensity={1} />
          </div>
        </section>
      </div>
    </div>
  );
}
