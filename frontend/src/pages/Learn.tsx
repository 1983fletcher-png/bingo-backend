import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../lib/safeFetch';
import { bakingSodaVolcanoPage, timeTravelPage, nikolaTeslaPage } from '../types/learningEngine';
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

const CATEGORIES: { id: string; label: string; description: string }[] = [
  { id: 'biology', label: 'Biology & Nature', description: 'Plants, botany, gardening, and how living things grow and work.' },
  { id: 'crafts-stem', label: 'Crafts & Gentle STEM', description: 'Hands-on activities and simple science you can do at home.' },
  { id: 'animals', label: 'Animals', description: 'From backyard wildlife to ocean giants — trusted facts about the animal kingdom.' },
  { id: 'movies-culture', label: 'Time Travel & Culture', description: 'Movies, filmography, science fiction, and the big what-if — with real science and a practical twist.' },
  { id: 'scientists-inventors', label: 'Scientists & Inventors', description: 'Biographies and contributions of history\'s great inventors and scientists — cited, engaging, trivia-ready.' },
];

function getCategoryId(card: CardSummary): string {
  if (card.id === 'nikola-tesla' || card.tags?.some((t) => ['Nikola Tesla', 'inventor', 'biography', 'scientists'].includes(t))) return 'scientists-inventors';
  if (card.id === 'time-travel-wormhole' || card.id === 'time-travel' || card.tags?.some((t) => ['time travel', 'movies', 'science fiction', "Hitchhiker's Guide to the Galaxy", 'Back to the Future'].includes(t))) return 'movies-culture';
  if (card.id === 'baking-soda-volcano' || (card.tags?.some((t) => t === 'science experiments' || t === 'chemistry'))) return 'crafts-stem';
  if (card.id === 'plants-and-how-they-grow' || card.tags?.some((t) => ['plants', 'botany', 'gardening'].includes(t))) return 'biology';
  if (card.id === 'crafts-and-gentle-stem' || (card.tags?.some((t) => ['crafts', 'STEM'].includes(t)) && card.title.toLowerCase().includes('craft'))) return 'crafts-stem';
  return 'animals';
}

export default function Learn() {
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const cardsByCategory = useMemo(() => {
    const map: Record<string, CardSummary[]> = { biology: [], 'crafts-stem': [], animals: [], 'movies-culture': [], 'scientists-inventors': [] };
    for (const card of cards) {
      const cat = getCategoryId(card);
      if (map[cat]) map[cat].push(card);
    }
    return map;
  }, [cards]);

  return (
    <div className="learn-page">
      <Link to="/" className="learn-page__back">
        ← Back to Playroom
      </Link>
      <h1 className="learn-page__title">Learn & Grow</h1>
      <p className="learn-page__intro">
        Trusted, cited learning cards—plants, animals, crafts, science, and more. Pick a category, then a topic, and explore at your own pace.
      </p>

      {loading && <p className="learn-page__loading">Loading…</p>}
      {error && <p className="learn-page__error">{error}</p>}

      {!loading && !error && (
        <>
          {CATEGORIES.map((cat) => {
            const list = cardsByCategory[cat.id] ?? [];
            if (list.length === 0) return null;
            return (
              <section key={cat.id} className="learn-category" aria-labelledby={`learn-cat-${cat.id}`}>
                <h2 id={`learn-cat-${cat.id}`} className="learn-category__title">{cat.label}</h2>
                <p className="learn-category__desc">{cat.description}</p>
                <div className="learn-cards">
                  {list.map((card) => (
                    <Link
                      key={card.id}
                      to={`/learn/${card.id}`}
                      className="learn-card-link"
                    >
                      <h3 className="learn-card-link__title">{card.title}</h3>
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
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
