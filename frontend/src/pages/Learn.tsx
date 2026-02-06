import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../lib/safeFetch';
import { bakingSodaVolcanoPage, timeTravelPage, nikolaTeslaPage } from '../types/learningEngine';
import libraryConfig from '../data/learn-library.json';
import '../styles/learn.css';

const API_BASE =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : window.location.origin);

type CardSummary = { id: string; title: string; summary: string; tags?: string[] };

/** Static learning pages (canonical schema) — merged into the card list so they appear on Learn. */
const STATIC_CARDS: CardSummary[] = [
  {
    id: 'baking-soda-volcano',
    title: bakingSodaVolcanoPage.title,
    summary: bakingSodaVolcanoPage.subtitle ?? 'A small eruption that teaches big science.',
    tags: bakingSodaVolcanoPage.topics,
  },
  {
    id: 'time-travel',
    title: timeTravelPage.title,
    summary: timeTravelPage.subtitle ?? 'Movies, science, and what you do with the time you\'ve got.',
    tags: timeTravelPage.topics,
  },
  {
    id: 'time-travel-wormhole',
    title: 'Time Travel Wormhole',
    summary: 'Explore time travel in film, TV, literature, comics, and music—curated entries and fun facts.',
    tags: ['Time Travel', 'Sci-Fi', 'Movies', 'TV', 'Comics', 'Music', 'Literature'],
  },
  {
    id: 'nikola-tesla',
    title: nikolaTeslaPage.title,
    summary: nikolaTeslaPage.subtitle ?? 'The man who electrified the world.',
    tags: nikolaTeslaPage.topics,
  },
];

type LearnLibraryConfig = typeof libraryConfig;
type PrimaryCategory = LearnLibraryConfig['library']['primaryCategories'][number];
type Subcategory = PrimaryCategory['subcategories'][number];

const LIBRARY = libraryConfig as LearnLibraryConfig;

// Current cards → library subcategory mapping (hand-curated for canonical pages).
const CARD_TO_LIBRARY: Record<string, { primaryId: string; subId: string }> = {
  'baking-soda-volcano': { primaryId: 'stem_crafts', subId: 'experiments' },
  'time-travel': { primaryId: 'time_travel_media', subId: 'films' },
  'time-travel-wormhole': { primaryId: 'time_travel_media', subId: 'films' },
  'nikola-tesla': { primaryId: 'scientists_inventors', subId: 'nikola_tesla' },
};

export default function Learn() {
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePrimaryId, setActivePrimaryId] = useState<string>(
    LIBRARY.library.primaryCategories[0]?.id ?? 'stem_crafts'
  );
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetchJson<{ cards: CardSummary[] }>(`${API_BASE}/api/learn/cards`);
      if (cancelled) return;
      const apiCards = res.ok && res.data?.cards ? res.data.cards : [];
      const merged = [...STATIC_CARDS];
      for (const c of apiCards) {
        if (!merged.some((s) => s.id === c.id)) merged.push(c);
      }
      setCards(merged);
      if (!res.ok) setError(res.error || 'Could not load cards');
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const activePrimary = useMemo(
    () => LIBRARY.library.primaryCategories.find((c) => c.id === activePrimaryId) ?? LIBRARY.library.primaryCategories[0],
    [activePrimaryId]
  );

  const activeSubcategory: Subcategory | null = useMemo(() => {
    if (!activePrimary) return null;
    if (!activeSubId) return null;
    return activePrimary.subcategories.find((s) => s.id === activeSubId) ?? null;
  }, [activePrimary, activeSubId]);

  const cardsForActiveSubcategory = useMemo(() => {
    if (!activePrimary) return [];
    if (!activeSubId) return [];
    return cards.filter((c) => {
      const mapping = CARD_TO_LIBRARY[c.id];
      return mapping?.primaryId === activePrimary.id && mapping?.subId === activeSubId;
    });
  }, [cards, activePrimary, activeSubId]);

  useEffect(() => {
    // Ensure subcategory selection stays valid when switching primary categories.
    if (!activePrimary) return;
    const firstSub = activePrimary.subcategories[0]?.id ?? null;
    setActiveSubId((prev) => {
      if (prev && activePrimary.subcategories.some((s) => s.id === prev)) return prev;
      return firstSub;
    });
  }, [activePrimary]);

  return (
    <div className="learn-page">
      <Link to="/" className="learn-page__back">
        ← Back to Playroom
      </Link>
      <h1 className="learn-page__title">{LIBRARY.library.name}</h1>
      <p className="learn-page__intro">{LIBRARY.library.description}</p>

      {LIBRARY.uiConfig?.breadcrumbNavigation && (
        <nav className="learn-breadcrumbs" aria-label="Breadcrumb">
          <span className="learn-breadcrumbs__item">Learn</span>
          <span className="learn-breadcrumbs__sep">/</span>
          <span className="learn-breadcrumbs__item">{activePrimary?.title ?? 'Category'}</span>
          {activeSubcategory && (
            <>
              <span className="learn-breadcrumbs__sep">/</span>
              <span className="learn-breadcrumbs__item">{activeSubcategory.title}</span>
            </>
          )}
        </nav>
      )}

      {loading && <p className="learn-page__loading">Loading…</p>}
      {error && <p className="learn-page__error">{error}</p>}

      {!loading && !error && activePrimary && (
        <div className="learn-library">
          <section className="learn-library__primary" aria-label="Primary categories">
            <div className="learn-library-grid">
              {LIBRARY.library.primaryCategories.map((cat) => {
                const isOn = cat.id === activePrimaryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`learn-library-card ${isOn ? 'learn-library-card--on' : ''}`}
                    onMouseEnter={() => cat.hoverAction === 'revealSubcategories' && setActivePrimaryId(cat.id)}
                    onFocus={() => setActivePrimaryId(cat.id)}
                    onClick={() => setActivePrimaryId(cat.id)}
                    aria-pressed={isOn}
                  >
                    <div className="learn-library-card__icon" aria-hidden="true">
                      {cat.icon}
                    </div>
                    <div className="learn-library-card__body">
                      <div className="learn-library-card__title">{cat.title}</div>
                      <div className="learn-library-card__desc">{cat.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="learn-library__sub" aria-label="Subcategories">
            <h2 className="learn-category__title">{activePrimary.title}</h2>
            <p className="learn-category__desc">{activePrimary.description}</p>

            <div className="learn-subcategories">
              {activePrimary.subcategories.map((sub) => {
                const isOn = sub.id === activeSubId;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    className={`learn-subcategory ${isOn ? 'learn-subcategory--on' : ''}`}
                    onClick={() => setActiveSubId(sub.id)}
                    aria-pressed={isOn}
                  >
                    <div className="learn-subcategory__title">{sub.title}</div>
                    {sub.description && <div className="learn-subcategory__desc">{sub.description}</div>}
                    {sub.placeholder && <div className="learn-subcategory__badge">Coming soon</div>}
                  </button>
                );
              })}
            </div>

            {activeSubId && (
              <div className="learn-subcategory-panel">
                <h3 className="learn-subcategory-panel__title">{activeSubcategory?.title ?? 'Topic'}</h3>
                {activeSubcategory?.description && (
                  <p className="learn-subcategory-panel__desc">{activeSubcategory.description}</p>
                )}

                {cardsForActiveSubcategory.length > 0 ? (
                  <div className="learn-cards">
                    {cardsForActiveSubcategory.map((card) => (
                      <Link key={card.id} to={`/learn/${card.id}`} className="learn-card-link">
                        <h4 className="learn-card-link__title">{card.title}</h4>
                        <p className="learn-card-link__summary">{card.summary}</p>
                        {card.tags && card.tags.length > 0 && (
                          <div className="learn-card-link__tags">
                            {card.tags.slice(0, 4).map((tag) => (
                              <span key={tag} className="learn-card-link__tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="learn-subcategory-panel__empty">
                    <p className="learn-page__loading" style={{ margin: 0 }}>
                      No cards wired to this topic yet.
                    </p>
                    {activeSubcategory?.cardExample?.title && (
                      <div className="learn-subcategory-example">
                        <div className="learn-subcategory-example__label">Example card shape</div>
                        <div className="learn-subcategory-example__title">{activeSubcategory.cardExample.title}</div>
                        {activeSubcategory.cardExample.hook && (
                          <div className="learn-subcategory-example__hook">{activeSubcategory.cardExample.hook}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
