/**
 * Welcome / Information Display builder. Hours, WiFi, house rules, contact, quick links.
 * No blank states — everything starts filled and editable. Scraper drops in brand + optional links.
 */
import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScraperPanel, type ScraperApplyResult } from '../components/ScraperPanel';
import { WelcomePreview } from '../components/WelcomePreview';
import {
  type WelcomeBuilderState,
  type MenuTheme,
  type OutputFormat,
  DEFAULT_WELCOME_STATE,
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

function getWelcomeBuilderContext(pathname: string): {
  backTo: string;
  title: string;
  tagline: string;
} {
  if (pathname.includes('/education/'))
    return {
      backTo: '/create/education',
      title: 'Welcome / information',
      tagline:
        'Library hours, room rules, contact, quick links. Scrape your site to pull in logo and links — then drop them in.',
    };
  if (pathname.includes('/care/'))
    return {
      backTo: '/create/care',
      title: 'Welcome / information',
      tagline:
        'Hours, contact, wayfinding, house rules, WiFi. Calm and welcoming.',
    };
  if (pathname.includes('/business/'))
    return {
      backTo: '/create/business',
      title: 'Welcome / information',
      tagline:
        'New hire or visitor info. Who to contact, where to go, quick links.',
    };
  if (pathname.includes('/general/'))
    return {
      backTo: '/create/general',
      title: 'Quick info page',
      tagline: 'Title and a few lines or bullets. Mini welcome.',
    };
  return {
    backTo: '/create/hospitality',
    title: 'Welcome / information display',
    tagline:
      'Hours, WiFi, house rules, contact. Scrape your site to pull in logo and links — then drop them in.',
  };
}

export function CreateWelcomeBuilder() {
  const location = useLocation();
  const ctx = getWelcomeBuilderContext(location.pathname);
  const [state, setState] = useState<WelcomeBuilderState>({
    ...DEFAULT_WELCOME_STATE,
  });
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const applyScrape = useCallback((result: ScraperApplyResult) => {
    setState((prev) => {
      const next = { ...prev };
      if (result.brand) next.brand = { ...prev.brand, ...result.brand };
      if (result.description) next.brand.subtitle = result.description;
      const newLinks = [...prev.links];
      if (
        result.foodMenuUrl &&
        !newLinks.some((l) => l.url === result.foodMenuUrl)
      ) {
        newLinks.push({ label: 'Food menu', url: result.foodMenuUrl });
      }
      if (
        result.drinkMenuUrl &&
        !newLinks.some((l) => l.url === result.drinkMenuUrl)
      ) {
        newLinks.push({ label: 'Drink menu', url: result.drinkMenuUrl });
      }
      if (
        result.eventsUrl &&
        !newLinks.some((l) => l.url === result.eventsUrl)
      ) {
        newLinks.push({ label: 'Events', url: result.eventsUrl });
      }
      if (
        result.facebookUrl &&
        !newLinks.some((l) => l.url === result.facebookUrl)
      ) {
        newLinks.push({ label: 'Facebook', url: result.facebookUrl });
      }
      if (
        result.instagramUrl &&
        !newLinks.some((l) => l.url === result.instagramUrl)
      ) {
        newLinks.push({ label: 'Instagram', url: result.instagramUrl });
      }
      next.links = newLinks;
      return next;
    });
  }, []);

  const setLink = useCallback(
    (index: number, patch: { label?: string; url?: string }) => {
      setState((prev) => ({
        ...prev,
        links: prev.links.map((l, i) => (i === index ? { ...l, ...patch } : l)),
      }));
    },
    []
  );

  const addLink = useCallback(() => {
    setState((prev) => ({
      ...prev,
      links: [...prev.links, { label: '', url: '' }],
    }));
  }, []);

  const removeLink = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
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
              placeholder="Welcome"
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
            <label className="menu-builder__label">Headline</label>
            <input
              type="text"
              className="menu-builder__input"
              value={state.headline}
              onChange={(e) => setState((p) => ({ ...p, headline: e.target.value }))}
              placeholder="We're glad you're here"
            />
          </div>
          <div className="menu-builder__block">
            <label className="menu-builder__label">Hours</label>
            <input
              type="text"
              className="menu-builder__input"
              value={state.hours}
              onChange={(e) => setState((p) => ({ ...p, hours: e.target.value }))}
              placeholder="Mon–Thu 11am–10pm · Fri–Sat 11am–11pm"
            />
          </div>
          <div
            className="menu-builder__block"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}
          >
            <div>
              <label className="menu-builder__label">WiFi name</label>
              <input
                type="text"
                className="menu-builder__input"
                value={state.wifiName ?? ''}
                onChange={(e) =>
                  setState((p) => ({
                    ...p,
                    wifiName: e.target.value || undefined,
                  }))
                }
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="menu-builder__label">WiFi password</label>
              <input
                type="text"
                className="menu-builder__input"
                value={state.wifiPassword ?? ''}
                onChange={(e) =>
                  setState((p) => ({
                    ...p,
                    wifiPassword: e.target.value || undefined,
                  }))
                }
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="menu-builder__block">
            <label className="menu-builder__label">House rules</label>
            <textarea
              className="menu-builder__input"
              rows={2}
              value={state.houseRules}
              onChange={(e) =>
                setState((p) => ({ ...p, houseRules: e.target.value }))
              }
              placeholder="Please be kind to staff and other guests."
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className="menu-builder__block">
            <label className="menu-builder__label">Contact / questions</label>
            <input
              type="text"
              className="menu-builder__input"
              value={state.contact}
              onChange={(e) => setState((p) => ({ ...p, contact: e.target.value }))}
              placeholder="Questions? Ask any team member."
            />
          </div>
          <div className="menu-builder__block">
            <span className="menu-builder__label">Quick links</span>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                margin: '0 0 0.35rem',
              }}
            >
              Scrape drops in Food menu, Drink menu, Events, social. Or add your
              own.
            </p>
            {state.links.map((link, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 28px',
                  gap: '0.35rem',
                  alignItems: 'center',
                  marginBottom: '0.35rem',
                }}
              >
                <input
                  type="text"
                  className="menu-builder__input"
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => setLink(i, { label: e.target.value })}
                />
                <input
                  type="url"
                  className="menu-builder__input"
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => setLink(i, { url: e.target.value })}
                />
                <button
                  type="button"
                  className="menu-builder__icon-btn"
                  onClick={() => removeLink(i)}
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="menu-builder__add-item"
              onClick={addLink}
            >
              + Add link
            </button>
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
          <WelcomePreview state={state} />
        </div>
      </div>

      <div className="menu-builder__print-area" aria-hidden>
        <WelcomePreview state={state} forPrint />
      </div>
    </div>
  );
}
