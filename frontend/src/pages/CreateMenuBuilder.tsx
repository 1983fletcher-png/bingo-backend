/**
 * Full Menu Builder: scraper integration, steps 1–5, live preview, export.
 * One screen, no page transitions. Scrape → toggle → drop in. Then edit and export.
 * Phase C: observances API for "Suggested by date" theme suggestions.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { ScraperPanel, type ScraperApplyResult } from '../components/ScraperPanel';
import { MenuPreview } from '../components/MenuPreview';
import {
  type MenuBuilderState,
  type MenuType,
  type MenuTheme,
  type OutputFormat,
  type MenuItem,
  getDefaultSections,
} from '../types/pageBuilder';
import { fetchJson, normalizeBackendUrl } from '../lib/safeFetch';
import {
  getSavedMenuDesigns,
  saveMenuDesign,
  type SavedMenuDesign,
} from '../lib/savedMenuDesigns';
import '../styles/create.css';
import '../styles/menu-builder.css';

const MENU_TYPES: { value: MenuType; label: string }[] = [
  { value: 'food', label: 'Food' },
  { value: 'drinks', label: 'Drinks' },
  { value: 'specials', label: 'Specials' },
  { value: 'custom', label: 'Custom list' },
];

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
  { value: 'phone', label: 'Phone / QR menu' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
];

/** Map observance themeId to menu builder theme (PAGE-MENU-BUILDER-SPEC theme registry) */
const THEME_ID_TO_MENU_THEME: Record<string, MenuTheme> = {
  valentines: 'warm',
  stpatricks: 'coastal',
  july4: 'classic',
  thanksgiving: 'warm',
  easter: 'casual',
  halloween: 'modern',
  christmas: 'warm',
  newyear: 'modern',
  veterans: 'classic',
  juneteenth: 'classic',
  music: 'modern',
  fun: 'casual',
};

interface UpcomingObs {
  name: string;
  month: number;
  day: number;
  category?: string;
  themeId?: string;
}

export function CreateMenuBuilder() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const typeParam = searchParams.get('type') as MenuType | null;
  const pathType = location.pathname.includes('/specials') ? 'specials' : null;
  const initialType =
    typeParam && ['food', 'drinks', 'specials', 'custom'].includes(typeParam)
      ? typeParam
      : pathType || 'food';
  const [upcomingObservances, setUpcomingObservances] = useState<UpcomingObs[]>([]);
  const [state, setState] = useState<MenuBuilderState>({
    type: 'menu',
    menuType: initialType,
    sections: getDefaultSections(initialType),
    theme: 'classic',
    format: 'print',
    brand: { title: 'Your venue', accentColor: '#e94560' },
  });
  const previewRef = useRef<HTMLDivElement>(null);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [savedDesigns, setSavedDesigns] = useState<SavedMenuDesign[]>(() => getSavedMenuDesigns());
  const [saveDesignName, setSaveDesignName] = useState('');
  const [loadDesignId, setLoadDesignId] = useState('');
  const [saveDesignMessage, setSaveDesignMessage] = useState<string | null>(null);

  useEffect(() => {
    const apiBase = normalizeBackendUrl(
      import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || ''
    );
    if (!apiBase) return;
    const from = new Date().toISOString().slice(0, 10);
    fetchJson<{ observances?: UpcomingObs[] }>(
      `${apiBase}/api/observances/upcoming?from=${from}&days=30`
    )
      .then((res) => {
        if (res.ok && res.data?.observances) {
          setUpcomingObservances(
            res.data.observances.filter(
              (o) => o.themeId && THEME_ID_TO_MENU_THEME[o.themeId]
            )
          );
        }
      })
      .catch(() => {});
  }, []);

  const applyScrape = useCallback((result: ScraperApplyResult) => {
    setState((prev) => {
      const next = { ...prev };
      if (result.brand) {
        next.brand = { ...prev.brand, ...result.brand };
      }
      if (result.description) next.brand.subtitle = result.description;
      return next;
    });
  }, []);

  const setMenuType = useCallback((menuType: MenuType) => {
    setState((prev) => ({
      ...prev,
      menuType,
      sections: getDefaultSections(menuType),
    }));
  }, []);

  const setSectionName = useCallback((sectionId: string, name: string) => {
    setState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, name } : s)),
    }));
  }, []);

  const moveSection = useCallback((index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= state.sections.length) return;
    setState((prev) => {
      const arr = [...prev.sections];
      const [removed] = arr.splice(index, 1);
      arr.splice(newIndex, 0, removed);
      return { ...prev, sections: arr };
    });
  }, [state.sections.length]);

  const addSection = useCallback(() => {
    const id = `s-new-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id,
          name: 'New section',
          items: [{ id: `i-${id}-0`, name: 'New item', price: '' }],
        },
      ],
    }));
  }, []);

  const removeSection = useCallback((sectionId: string) => {
    setState((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
  }, []);

  const setItem = useCallback(
    (sectionId: string, itemId: string, patch: Partial<MenuItem>) => {
      setState((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            items: s.items.map((it) =>
              it.id === itemId ? { ...it, ...patch } : it
            ),
          };
        }),
      }));
    },
    []
  );

  const addItem = useCallback((sectionId: string) => {
    const itemId = `i-${sectionId}-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: [...s.items, { id: itemId, name: '', price: '' }] }
          : s
      ),
    }));
  }, []);

  const removeItem = useCallback((sectionId: string, itemId: string) => {
    setState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const items = s.items.filter((it) => it.id !== itemId);
        return {
          ...s,
          items: items.length
            ? items
            : [...items, { id: `i-${s.id}-empty`, name: 'New item', price: '' }],
        };
      }),
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

  const handleSaveDesign = useCallback(() => {
    setSaveDesignMessage(null);
    const name = saveDesignName.trim() || 'Untitled menu';
    saveMenuDesign(name, state);
    setSavedDesigns(getSavedMenuDesigns());
    setSaveDesignName('');
    setSaveDesignMessage(`Saved “${name}”. You can load it anytime from “Load a design”.`);
  }, [state, saveDesignName]);

  const handleLoadDesign = useCallback(() => {
    if (!loadDesignId) return;
    const design = savedDesigns.find((d) => d.id === loadDesignId);
    if (!design) return;
    setState(design.document);
    setShareSlug(null);
    setShareError(null);
    setLoadDesignId('');
  }, [loadDesignId, savedDesigns]);

  return (
    <div className="menu-builder">
      <header className="menu-builder__header">
        <Link to="/create/hospitality" className="menu-builder__back">
          ← Back
        </Link>
        <h1 className="menu-builder__title">Menu builder</h1>
        <p className="menu-builder__tagline">
          Edit below. Preview updates instantly. No reloads.
        </p>
      </header>

      <div className="menu-builder__layout">
        <aside className="menu-builder__panel">
          <ScraperPanel onApply={applyScrape} compact />

          <div className="menu-builder__block">
            <label className="menu-builder__label">Logo URL</label>
            <input
              type="url"
              className="menu-builder__input"
              value={state.brand.logoUrl ?? ''}
              onChange={(e) =>
                setState((p) => ({
                  ...p,
                  brand: {
                    ...p.brand,
                    logoUrl: e.target.value.trim() || undefined,
                  },
                }))
              }
              placeholder="Or paste after scraping"
            />
          </div>
          <div className="menu-builder__block">
            <label className="menu-builder__label">Title</label>
            <input
              type="text"
              className="menu-builder__input"
              value={state.brand.title ?? ''}
              onChange={(e) =>
                setState((p) => ({ ...p, brand: { ...p.brand, title: e.target.value } }))
              }
              placeholder="Venue or menu name"
            />
          </div>
          <div className="menu-builder__block">
            <label className="menu-builder__label">Subtitle</label>
            <input
              type="text"
              className="menu-builder__input"
              value={state.brand.subtitle ?? ''}
              onChange={(e) =>
                setState((p) => ({
                  ...p,
                  brand: { ...p.brand, subtitle: e.target.value },
                }))
              }
              placeholder="Optional tagline"
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
                placeholder="#e94560"
              />
            </div>
          </div>

          <div className="menu-builder__block">
            <span className="menu-builder__label">Menu type</span>
            <div className="menu-builder__chips">
              {MENU_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`menu-builder__chip ${
                    state.menuType === t.value ? 'menu-builder__chip--on' : ''
                  }`}
                  onClick={() => setMenuType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="menu-builder__block">
            <span className="menu-builder__label">Sections & items</span>
            {state.sections.map((section, idx) => (
              <div key={section.id} className="menu-builder__section-edit">
                <div className="menu-builder__section-head">
                  <input
                    type="text"
                    className="menu-builder__input menu-builder__input--section"
                    value={section.name}
                    onChange={(e) => setSectionName(section.id, e.target.value)}
                  />
                  <div className="menu-builder__section-actions">
                    <button
                      type="button"
                      className="menu-builder__icon-btn"
                      onClick={() => moveSection(idx, -1)}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="menu-builder__icon-btn"
                      onClick={() => moveSection(idx, 1)}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="menu-builder__icon-btn menu-builder__icon-btn--danger"
                      onClick={() => removeSection(section.id)}
                      aria-label="Remove section"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <ul className="menu-builder__item-list">
                  {section.items.map((item) => (
                    <li key={item.id} className="menu-builder__item-row">
                      <input
                        type="text"
                        className="menu-builder__input menu-builder__input--item"
                        placeholder="Name"
                        value={item.name}
                        onChange={(e) =>
                          setItem(section.id, item.id, { name: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        className="menu-builder__input menu-builder__input--price"
                        placeholder="Price"
                        value={item.price ?? ''}
                        onChange={(e) =>
                          setItem(section.id, item.id, { price: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        className="menu-builder__input menu-builder__input--desc"
                        placeholder="Description"
                        value={item.description ?? ''}
                        onChange={(e) =>
                          setItem(section.id, item.id, {
                            description: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        className="menu-builder__icon-btn"
                        onClick={() => removeItem(section.id, item.id)}
                        aria-label="Remove item"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="menu-builder__add-item"
                  onClick={() => addItem(section.id)}
                >
                  + Item
                </button>
              </div>
            ))}
            <button
              type="button"
              className="menu-builder__add-section"
              onClick={addSection}
            >
              + Section
            </button>
          </div>

          {upcomingObservances.length > 0 && (
            <div className="menu-builder__block">
              <span className="menu-builder__label">Suggested by date</span>
              <p
                className="menu-builder__hint"
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginBottom: 8,
                }}
              >
                Upcoming observances — use a theme to match the occasion.
              </p>
              <div className="menu-builder__chips menu-builder__chips--wrap">
                {upcomingObservances.slice(0, 8).map((o) => {
                  const menuTheme = o.themeId
                    ? THEME_ID_TO_MENU_THEME[o.themeId]
                    : null;
                  if (!menuTheme) return null;
                  return (
                    <button
                      key={`${o.name}-${o.month}-${o.day}`}
                      type="button"
                      className={`menu-builder__chip ${
                        state.theme === menuTheme ? 'menu-builder__chip--on' : ''
                      }`}
                      onClick={() =>
                        setState((p) => ({ ...p, theme: menuTheme }))
                      }
                      title={`Use ${
                        THEMES.find((t) => t.value === menuTheme)?.label ??
                        menuTheme
                      } for ${o.name}`}
                    >
                      {o.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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

          <div className="menu-builder__block">
            <span className="menu-builder__label">Save & load designs</span>
            <p className="menu-builder__hint">
              Save this menu layout to reuse later. When we have accounts, your designs will sync.
            </p>
            <div className="menu-builder__save-load">
              <input
                type="text"
                className="menu-builder__input"
                value={saveDesignName}
                onChange={(e) => setSaveDesignName(e.target.value)}
                placeholder="Design name"
                aria-label="Name for saved design"
              />
              <button
                type="button"
                className="menu-builder__btn menu-builder__btn--secondary"
                onClick={handleSaveDesign}
              >
                Save this design
              </button>
            </div>
            {saveDesignMessage && (
              <p className="menu-builder__save-msg">{saveDesignMessage}</p>
            )}
            {savedDesigns.length > 0 && (
              <div className="menu-builder__load-row">
                <select
                  className="menu-builder__input menu-builder__select"
                  value={loadDesignId}
                  onChange={(e) => setLoadDesignId(e.target.value)}
                  aria-label="Choose a saved design"
                >
                  <option value="">Load a design…</option>
                  {savedDesigns.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({new Date(d.savedAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="menu-builder__btn menu-builder__btn--secondary"
                  onClick={handleLoadDesign}
                  disabled={!loadDesignId}
                >
                  Load
                </button>
              </div>
            )}
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

        <div className="menu-builder__preview-wrap" ref={previewRef}>
          <MenuPreview state={state} />
        </div>
      </div>

      <div className="menu-builder__print-area" aria-hidden>
        <MenuPreview state={state} forPrint />
      </div>
    </div>
  );
}
