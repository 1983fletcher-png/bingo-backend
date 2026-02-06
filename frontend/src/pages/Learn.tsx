import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../lib/safeFetch';
import { bakingSodaVolcanoPage, timeTravelPage, nikolaTeslaPage } from '../types/learningEngine';
import sectionsConfig from '../data/learn-sections.json';
import '../styles/learn.css';

const API_BASE =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : window.location.origin);

type CardSummary = { id: string; title: string; summary: string; tags?: string[] };

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

type Section = { id: string; title: string; description?: string; tags: string[] };
const SECTIONS: Section[] = (sectionsConfig as { sections: Section[] }).sections;

function normalizeTag(t: string): string {
  return t.trim().toLowerCase();
}

function cardMatchesSection(card: CardSummary, section: Section): boolean {
  if (!section.tags?.length) return true; // "All"
  const cardTagSet = new Set((card.tags ?? []).map(normalizeTag));
  return section.tags.some((tag) => cardTagSet.has(normalizeTag(tag)));
}

function cardMatchesTagFilter(card: CardSummary, tagFilter: string | null): boolean {
  if (!tagFilter) return true;
  const set = new Set((card.tags ?? []).map(normalizeTag));
  return set.has(normalizeTag(tagFilter));
}

export default function Learn() {
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);

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

  const activeSection = useMemo(
    () => SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0],
    [sectionId]
  );

  const visibleCards = useMemo(() => {
    return cards.filter(
      (c) => cardMatchesSection(c, activeSection) && cardMatchesTagFilter(c, tagFilter)
    );
  }, [cards, activeSection, tagFilter]);

  const allTagsFromCards = useMemo(() => {
    const set = new Set<string>();
    visibleCards.forEach((c) => (c.tags ?? []).forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [visibleCards]);

  return (
    <div className="learn-page">
      <Link to="/" className="learn-page__back">
        ← Back to Playroom
      </Link>
      <h1 className="learn-page__title">Learn & Grow</h1>
      <p className="learn-page__intro">
        Pick a topic, dive in—then use it in trivia. Everything here is categorized and cross-tagged so you can hunt for what you need.
      </p>

      {loading && <p className="learn-page__loading">Loading…</p>}
      {error && <p className="learn-page__error">{error}</p>}

      {!loading && !error && (
        <>
          <nav className="learn-sections" aria-label="Topics">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`learn-section-pill ${s.id === sectionId ? 'learn-section-pill--on' : ''}`}
                onClick={() => { setSectionId(s.id); setTagFilter(null); }}
                aria-pressed={s.id === sectionId}
              >
                {s.title}
              </button>
            ))}
          </nav>

          {tagFilter && (
            <div className="learn-tag-filter">
              <span className="learn-tag-filter__label">Tag:</span>
              <button
                type="button"
                className="learn-tag-chip learn-tag-chip--active"
                onClick={() => setTagFilter(null)}
              >
                {tagFilter} ×
              </button>
            </div>
          )}

          {allTagsFromCards.length > 0 && !tagFilter && (
            <div className="learn-tag-row">
              <span className="learn-tag-row__label">Filter by tag:</span>
              {allTagsFromCards.slice(0, 12).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="learn-tag-chip"
                  onClick={() => setTagFilter(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div className="learn-cards">
            {visibleCards.map((card) => (
              <Link
                key={card.id}
                to={`/learn/${card.id}`}
                className="learn-card-link"
              >
                <h3 className="learn-card-link__title">{card.title}</h3>
                <p className="learn-card-link__summary">{card.summary}</p>
                {card.tags && card.tags.length > 0 && (
                  <div className="learn-card-link__tags">
                    {card.tags.slice(0, 5).map((tag) => (
                      <span key={tag} className="learn-card-link__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {visibleCards.length === 0 && (
            <p className="learn-page__empty">
              No topics here yet. Try another section or tag.
            </p>
          )}
        </>
      )}
    </div>
  );
}
