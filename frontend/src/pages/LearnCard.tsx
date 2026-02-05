import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchJson } from '../lib/safeFetch';

const API_BASE =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : window.location.origin);

type Card = {
  id: string;
  title: string;
  summary: string;
  audienceLayers?: Record<string, { summary?: string; sections?: Record<string, string> }>;
  sections?: { key: string; title: string }[];
  sources?: { title: string; institution: string; url?: string }[];
  tags?: string[];
};

export default function LearnCard() {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layer, setLayer] = useState<'child' | 'learner' | 'explorer' | 'deepDive'>('learner');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const res = await fetchJson<Card>(`${API_BASE}/api/learn/cards/${encodeURIComponent(id)}`);
      if (cancelled) return;
      if (res.ok && res.data) setCard(res.data);
      else setError(res.error || 'Card not found');
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (error || !card) {
    return (
      <div style={{ padding: 24 }}>
        <Link to="/learn" style={{ color: '#6cb4ee' }}>← Back to Learn & Grow</Link>
        <p style={{ color: '#f87171', marginTop: 16 }}>{error || 'Not found'}</p>
      </div>
    );
  }

  const layerContent = card.audienceLayers?.[layer];
  const sectionKeys = card.sections?.map((s) => s.key) ?? [];
  const sectionText = layerContent?.sections
    ? sectionKeys
        .filter((k) => layerContent.sections![k])
        .map((k) => {
          const title = card.sections?.find((s) => s.key === k)?.title ?? k;
          return { title, body: layerContent.sections![k] };
        })
    : [];

  return (
    <div style={{ minHeight: '100vh', padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <Link to="/learn" style={{ display: 'inline-block', marginBottom: 24, color: '#94a3b8', textDecoration: 'none' }}>
        ← Back to Learn & Grow
      </Link>
      <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem' }}>{card.title}</h1>
      <p style={{ color: '#94a3b8', marginBottom: 24, lineHeight: 1.5 }}>{card.summary}</p>

      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginRight: 8 }}>View as:</span>
        {(['child', 'learner', 'explorer', 'deepDive'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLayer(l)}
            style={{
              marginRight: 8,
              padding: '6px 12px',
              background: layer === l ? 'rgba(108,180,238,0.25)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${layer === l ? '#6cb4ee' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 8,
              color: '#e2e8f0',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {l === 'child' ? 'Child' : l === 'learner' ? 'Learner' : l === 'explorer' ? 'Explorer' : 'Deep dive'}
          </button>
        ))}
      </div>

      {layerContent?.summary && (
        <p style={{ color: '#cbd5e0', marginBottom: 24, fontStyle: 'italic' }}>{layerContent.summary}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {sectionText.map(({ title, body }) => (
          <section key={title}>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 600 }}>{title}</h2>
            <p style={{ margin: 0, color: '#cbd5e0', lineHeight: 1.6 }}>{body}</p>
          </section>
        ))}
      </div>

      {card.sources && card.sources.length > 0 && (
        <section style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 600 }}>Sources</h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {card.sources.map((s, i) => (
              <li key={i}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#6cb4ee' }}>
                    {s.title}
                  </a>
                ) : (
                  s.title
                )}
                {s.institution && ` — ${s.institution}`}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
