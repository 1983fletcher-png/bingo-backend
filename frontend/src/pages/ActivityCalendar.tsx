import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../lib/safeFetch';

const API_BASE =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : window.location.origin);

type Observance = { name: string; month: number; day: number; category?: string };

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function ActivityCalendar() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [observances, setObservances] = useState<Observance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetchJson<{ observances: Observance[] }>(
        `${API_BASE}/api/observances/calendar?year=${year}&month=${month}`
      );
      if (cancelled) return;
      if (res.ok && res.data?.observances) setObservances(res.data.observances);
      else setError(res.error || 'Could not load calendar');
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [year, month]);

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month - 1 + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const observancesByDay = observances.reduce<Record<number, Observance[]>>((acc, o) => {
    if (!acc[o.day]) acc[o.day] = [];
    acc[o.day].push(o);
    return acc;
  }, {});

  const prevMonth = () => {
    if (month === 1) setYear((y) => y - 1);
    setMonth((m) => (m === 1 ? 12 : m - 1));
  };
  const nextMonth = () => {
    if (month === 12) setYear((y) => y + 1);
    setMonth((m) => (m === 12 ? 1 : m + 1));
  };

  const cellStyle: React.CSSProperties = {
    minHeight: 100,
    padding: 8,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8,
    fontSize: '0.85rem',
  };
  const dayNumStyle: React.CSSProperties = { fontWeight: 600, marginBottom: 4, color: '#e2e8f0' };
  const eventStyle: React.CSSProperties = { fontSize: '0.75rem', color: '#94a3b8', marginTop: 4, lineHeight: 1.3 };

  return (
    <div style={{ minHeight: '100vh', padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Link
        to="/"
        style={{ display: 'inline-block', marginBottom: 24, color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}
      >
        ← Back to Playroom
      </Link>

      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem' }}>Activity calendar</h1>
        <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.5 }}>
          Holidays and observances to plan themes and events. Use these dates for trivia, specials, and activities.
        </p>
      </header>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={prevMonth}
            style={{
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            ←
          </button>
          <span style={{ fontSize: '1.25rem', fontWeight: 600, minWidth: 200, textAlign: 'center' }}>
            {MONTHS[month - 1]} {year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            style={{
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            →
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#f87171', marginBottom: 16 }}>{error}</p>}
      {loading && <p style={{ color: '#94a3b8', marginBottom: 16 }}>Loading…</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 8,
          marginBottom: 24,
        }}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div
            key={d}
            style={{
              ...cellStyle,
              textAlign: 'center',
              fontWeight: 600,
              color: '#94a3b8',
              minHeight: 40,
            }}
          >
            {d}
          </div>
        ))}
        {Array.from({ length: startWeekday }, (_, i) => (
          <div key={`pad-${i}`} style={{ ...cellStyle, opacity: 0.3 }} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const obs = observancesByDay[day] ?? [];
          return (
            <div key={day} style={cellStyle}>
              <div style={dayNumStyle}>{day}</div>
              {obs.map((o) => (
                <div key={o.name} style={eventStyle} title={o.category}>
                  {o.name}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <section
        style={{
          padding: 20,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <h2 style={{ margin: '0 0 12px', fontSize: '1rem' }}>This month’s observances</h2>
        {observances.length === 0 && !loading && <p style={{ color: '#94a3b8', margin: 0 }}>None this month.</p>}
        <ul style={{ margin: 0, paddingLeft: 20, color: '#cbd5e0', lineHeight: 1.8 }}>
          {observances.map((o) => (
            <li key={`${o.day}-${o.name}`}>
              <strong>{o.day}</strong> — {o.name}
              {o.category && <span style={{ color: '#94a3b8', fontSize: '0.85em' }}> ({o.category})</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
