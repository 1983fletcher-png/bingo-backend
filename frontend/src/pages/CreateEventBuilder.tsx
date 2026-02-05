/**
 * Event Promotion builder. Promote an upcoming event or theme night.
 * No blank states — everything starts filled and editable. Scraper drops in brand.
 */
import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScraperPanel, type ScraperApplyResult } from '../components/ScraperPanel';
import { EventPreview } from '../components/EventPreview';
import {
  type EventBuilderState,
  type MenuTheme,
  type OutputFormat,
  DEFAULT_EVENT_STATE,
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

function getEventBuilderContext(pathname: string): {
  backTo: string;
  title: string;
  tagline: string;
} {
  if (pathname.includes('/education/'))
    return {
      backTo: '/create/education',
      title: 'Class or workshop announcement',
      tagline:
        'Promote a class, workshop, or event. Edit below — preview updates instantly.',
    };
  if (pathname.includes('/care/'))
    return {
      backTo: '/create/care',
      title: 'Activity or program announcement',
      tagline:
        "Today's or this week's activity. Edit below — preview updates instantly.",
    };
  if (pathname.includes('/business/'))
    return {
      backTo: '/create/business',
      title: 'Announcement',
      tagline:
        'All-hands, policy update, workshop. Edit below — preview updates instantly.',
    };
  if (pathname.includes('/general/'))
    return {
      backTo: '/create/general',
      title: pathname.includes('/flyer') ? 'Flyer' : 'Announcement',
      tagline:
        'One message: title, date, body, optional CTA. Edit below — preview updates instantly.',
    };
  return {
    backTo: '/create/hospitality',
    title: 'Event promotion',
    tagline:
      'Promote an upcoming event or theme night. Edit below — preview updates instantly.',
  };
}

export function CreateEventBuilder() {
  const location = useLocation();
  const ctx = getEventBuilderContext(location.pathname);
  const [state, setState] = useState<EventBuilderState>({ ...DEFAULT_EVENT_STATE });
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
        <Link to={ctx.backTo} className="menu-builder__back">
          ← Back
        </Link>
        <h1 className="menu-builder__title">{ctx.title}</h1>
        <p className="menu-builder__tagline">{ctx.tagline}</p>
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
              placeholder="Your venue"
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
            <label className="menu-builder__label">Event title</label>
            <input
              type="text"
              className="menu-builder__input"
              value={state.eventTitle}
              onChange={(e) => setState((p) => ({ ...p, eventTitle: e.target.value }))}
              placeholder="Theme Night"
            />
          </div>
          <div
            className="menu-builder__block"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}
          >
            <div>
              <label className="menu-builder__label">Date</label>
              <input
                type="text"
                className="menu-builder__input"
                value={state.eventDate}
                onChange={(e) => setState((p) => ({ ...p, eventDate: e.target.value }))}
                placeholder="Fri, Dec 15"
              />
            </div>
            <div>
              <label className="menu-builder__label">Time</label>
              <input
                type="text"
                className="menu-builder__input"
                value={state.eventTime}
                onChange={(e) => setState((p) => ({ ...p, eventTime: e.target.value }))}
                placeholder="8:00 PM"
              />
            </div>
          </div>
          <div className="menu-builder__block">
            <label className="menu-builder__label">Description</label>
            <textarea
              className="menu-builder__input"
              rows={3}
              value={state.description}
              onChange={(e) => setState((p) => ({ ...p, description: e.target.value }))}
              placeholder="Join us for…"
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
          <div
            className="menu-builder__block"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}
          >
            <div>
              <label className="menu-builder__label">Button label</label>
              <input
                type="text"
                className="menu-builder__input"
                value={state.ctaLabel}
                onChange={(e) => setState((p) => ({ ...p, ctaLabel: e.target.value }))}
                placeholder="Learn more"
              />
            </div>
            <div>
              <label className="menu-builder__label">Button link</label>
              <input
                type="url"
                className="menu-builder__input"
                value={state.ctaUrl ?? ''}
                onChange={(e) =>
                  setState((p) => ({
                    ...p,
                    ctaUrl: e.target.value.trim() || undefined,
                  }))
                }
                placeholder="https://…"
              />
            </div>
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
          <EventPreview state={state} />
        </div>
      </div>

      <div className="menu-builder__print-area" aria-hidden>
        <EventPreview state={state} forPrint />
      </div>
    </div>
  );
}
