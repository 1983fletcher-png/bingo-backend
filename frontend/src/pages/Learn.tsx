import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../lib/safeFetch';

const API_BASE =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : window.location.origin);

type CardSummary = { id: string; title: string; summary: string; tags?: string[] };

export default function Learn() {
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetchJson<{ cards: CardSummary[] }>(`${API_BASE}/api/learn/cards`);
      if (cancelled) return;
      if (res.ok && res.data?.cards) setCards(res.data.cards);
      else setError(res.error || 'Could not load cards');
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ minHeight: '100vh', padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Link
        to="/"
        style={{ display: 'inline-block', marginBottom: 24, color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}
      >
        ← Back to Playroom
      </Link>
      <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem' }}>Learn & Grow</h1>
      <p style={{ color: '#94a3b8', marginBottom: 28, lineHeight: 1.5 }}>
        Trusted, cited learning cards—plants, animals, crafts, science, and more. Pick a topic and explore at your own pace.
      </p>

      {loading && <p style={{ color: '#94a3b8' }}>Loading…</p>}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {!loading && !error && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {cards.map((card) => (
            <Link
              key={card.id}
              to={`/learn/${card.id}`}
              style={{
                display: 'block',
                padding: 20,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                textDecoration: 'none',
                color: '#e2e8f0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
              }}
            >
              <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 600 }}>{card.title}</h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.45 }}>{card.summary}</p>
              {card.tags && card.tags.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {card.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        color: '#cbd5e0',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
