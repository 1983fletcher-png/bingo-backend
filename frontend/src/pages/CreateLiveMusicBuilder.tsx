/**
 * Live Music / Featured Performer builder. Who's playing, when, one line of vibe.
 * No blank states — everything starts filled and editable. Scraper drops in brand.
 */
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScraperPanel, type ScraperApplyResult } from '../components/ScraperPanel';
import { LiveMusicPreview } from '../components/LiveMusicPreview';
import {
  type LiveMusicBuilderState,
  type MenuTheme,
  type OutputFormat,
  DEFAULT_LIVE_MUSIC_STATE,
} from '../types/pageBuilder';
import { fetchJson, normalizeBackendUrl } from '../lib/safeFetch';
import '../styles/create.css';
import '../styles/menu-builder.css';

const THEMES: { value: MenuTheme; label: string }[] = [
  { value: 'classic', label: 'Classic & Elegant' },
  { value: 'warm', label: 'Warm & Rustic' },
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'modern', label: 'Modern & Clean' },
  { value: 'coastal', label: 'Outdoor / Local / Coastal' },
];

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: 'print', label: 'Print' },
  { value: 'tv', label: 'TV display' },
  { value: 'phone', label: 'Phone / QR' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
];

export function CreateLiveMusicBuilder() {
  const [state, setState] = useState<LiveMusicBuilderState>({
    ...DEFAULT_LIVE_MUSIC_STATE,
  });
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const applyScrape = useCallback((result: ScraperApplyResult) => {
    setState((prev) => {
      const next = { ...prev };
      if (result.brand) next.brand = { ...prev.brand, ...result.brand };
      if (result.description) next.brand.subtitle = result.description;
      return next;
    });
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleShare = useCallback(async () => {
    setShareError(null);
    setShareSlug(null);
    const apiBase = normalizeBackendUrl(
      import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || ''
    );
    if (!apiBase) {
      setShareError(
        'Backend URL not set. Set VITE_SOCKET_URL to your Railway backend to get a share link.'
      );
      return;
    }
    const res = await fetchJson<{ slug?: string; error?: string }>(
      `${apiBase}/api/page-builder/save`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: state }),
      }
    );
    if (!res.ok || res.data?.error) {
      setShareError(res.error || res.data?.error || 'Failed to save');
      return;
    }
    const slug = res.data?.slug;
    if (slug) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      setShareSlug(`${origin}/view/${slug}`);
    }
  }, [state]);

  return (
    <div className="menu-builder">
      <header className="menu-builder__header">
        <Link to="/create/hospitality" className="menu-builder__back">
          ← Back
        </Link>
        <h1 className="menu-builder__title">Live music / featured performer</h1>
        <p className="menu-builder__tagline">
          Show who&apos;s playing and when. Edit below — preview updates instantly.
        </p>
      </header>

      <div className="menu-builder__layout">
        <aside className="menu-builder__panel">
          <ScraperPanel onApply={applyScrape} compact />

          <div className="menu-builder__block">
            <label className="menu-builder__label">Venue / brand name</label>
            <input
              type="text"
              className="menu-builder__input"
              value={state.brand.title ?? ''}
              onChange={(e) =>
                setState((p) => ({ ...p, brand: { ...p.brand, title: e.target.value } }))
              }
              placeholder="Live at the House"
            />
          </div>
          <div className="menu-builder__block">
            <label className="menu-builder__label">Logo URL</label>
            <input
              type="url"
              className="menu-builder__input"
              value={state.brand.logoUrl ?? ''}
              onChange={(e) =>
                setState((p) => ({
                  ...p,
                  brand: { ...p.brand, logoUrl: e.target.value.trim() || undefined },
                }))
              }
              placeholder="Optional"
            />
          </div>
          <div className="menu-builder__block">
            <label className="menu-builder__label">Performer name</label>
            <input
              type="text"
              className="menu-builder__input"
              value={state.performerName}
              onChange={(e) =>
                setState((p) => ({ ...p, performerName: e.target.value }))
              }
              placeholder="Live Music Tonight"
            />
          </div>
          <div className="menu-builder__block">
            <label className="menu-builder__label">Date & time</label>
            <input
              type="text"
              className="menu-builder__input"
              value={state.dateTime}
              onChange={(e) => setState((p) => ({ ...p, dateTime: e.target.value }))}
              placeholder="Tonight at 9"
            />
          </div>
          <div className="menu-builder__block">
            <label className="menu-builder__label">Short blurb</label>
            <textarea
              className="menu-builder__input"
              rows={2}
              value={state.blurb}
              onChange={(e) => setState((p) => ({ ...p, blurb: e.target.value }))}
              placeholder="Acoustic set — no cover. Full bar and kitchen."
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className="menu-builder__block">
            <label className="menu-builder__label">Image URL (optional)</label>
            <input
              type="url"
              className="menu-builder__input"
              value={state.imageUrl ?? ''}
              onChange={(e) =>
                setState((p) => ({
                  ...p,
                  imageUrl: e.target.value.trim() || undefined,
                }))
              }
              placeholder="https://…"
            />
          </div>
          <div className="menu-builder__block">
            <label className="menu-builder__label">More events link (optional)</label>
            <input
              type="url"
              className="menu-builder__input"
              value={state.moreEventsUrl ?? ''}
              onChange={(e) =>
                setState((p) => ({
                  ...p,
                  moreEventsUrl: e.target.value.trim() || undefined,
                }))
              }
              placeholder="https://…"
            />
          </div>
          <div className="menu-builder__block">
            <label className="menu-builder__label">Accent color</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="color"
                style={{
                  width: 36,
                  height: 28,
                  padding: 0,
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                }}
                value={state.brand.accentColor ?? '#e94560'}
                onChange={(e) =>
                  setState((p) => ({
                    ...p,
                    brand: { ...p.brand, accentColor: e.target.value },
                  }))
                }
                aria-label="Accent color"
              />
              <input
                type="text"
                className="menu-builder__input"
                style={{ flex: 1 }}
                value={state.brand.accentColor ?? '#e94560'}
                onChange={(e) =>
                  setState((p) => ({
                    ...p,
                    brand: { ...p.brand, accentColor: e.target.value },
                  }))
                }
              />
            </div>
          </div>
          <div className="menu-builder__block">
            <span className="menu-builder__label">Theme</span>
            <div className="menu-builder__chips menu-builder__chips--wrap">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`menu-builder__chip ${
                    state.theme === t.value ? 'menu-builder__chip--on' : ''
                  }`}
                  onClick={() => setState((p) => ({ ...p, theme: t.value }))}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="menu-builder__block">
            <span className="menu-builder__label">Output format</span>
            <div className="menu-builder__chips menu-builder__chips--wrap">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={`menu-builder__chip ${
                    state.format === f.value ? 'menu-builder__chip--on' : ''
                  }`}
                  onClick={() => setState((p) => ({ ...p, format: f.value }))}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="menu-builder__block menu-builder__export">
            <button
              type="button"
              className="menu-builder__btn menu-builder__btn--primary"
              onClick={handlePrint}
            >
              Print
            </button>
            <button
              type="button"
              className="menu-builder__btn menu-builder__btn--secondary"
              onClick={handleShare}
            >
              Get share link
            </button>
            {shareSlug && (
              <p className="menu-builder__share-url">
                <a
                  href={shareSlug}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {shareSlug}
                </a>
              </p>
            )}
            {shareError && (
              <p className="menu-builder__share-error">{shareError}</p>
            )}
          </div>
        </aside>
        <div className="menu-builder__preview-wrap">
          <LiveMusicPreview state={state} />
        </div>
      </div>

      <div className="menu-builder__print-area" aria-hidden>
        <LiveMusicPreview state={state} forPrint />
      </div>
    </div>
  );
}
