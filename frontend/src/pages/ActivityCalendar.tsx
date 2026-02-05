import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../lib/safeFetch';

const API_BASE =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : window.location.origin);

type Observance = { name: string; month: number; day: number; category?: string };
type ScrapedEvent = { month: number; day: number; title: string };

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type ThemeOption = { accent: string; bg: string; icon: string; label: string };

// Multiple theme options per month so activity directors can pick the look (e.g. February: hearts vs chocolates)
const MONTH_THEME_OPTIONS: Record<number, ThemeOption[]> = {
  1: [
    { accent: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', icon: '❄️', label: 'Winter' },
    { accent: '#c084fc', bg: 'rgba(192,132,252,0.1)', icon: '🎉', label: 'New Year' },
    { accent: '#94a3b8', bg: 'rgba(148,163,184,0.08)', icon: '🧣', label: 'Cozy' },
  ],
  2: [
    { accent: '#ec4899', bg: 'rgba(236,72,153,0.12)', icon: '❤️', label: 'Hearts & pink' },
    { accent: '#b91c1c', bg: 'rgba(185,28,28,0.12)', icon: '🍫', label: 'Chocolates & red' },
    { accent: '#e11d48', bg: 'rgba(225,29,72,0.1)', icon: '💝', label: 'Kindness' },
  ],
  3: [
    { accent: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: '🍀', label: 'Shamrocks' },
    { accent: '#65a30d', bg: 'rgba(101,163,13,0.1)', icon: '🌱', label: 'Spring green' },
    { accent: '#0d9488', bg: 'rgba(13,148,136,0.1)', icon: '🌧️', label: 'Rainy' },
  ],
  4: [
    { accent: '#a855f7', bg: 'rgba(168,85,247,0.1)', icon: '🐣', label: 'Easter & spring' },
    { accent: '#f472b6', bg: 'rgba(244,114,182,0.1)', icon: '🌸', label: 'Pastels' },
    { accent: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: '🌿', label: 'Garden' },
  ],
  5: [
    { accent: '#84cc16', bg: 'rgba(132,204,22,0.1)', icon: '🌸', label: 'Spring' },
    { accent: '#eab308', bg: 'rgba(234,179,8,0.1)', icon: '🌻', label: 'Sunflowers' },
    { accent: '#22c55e', bg: 'rgba(34,197,94,0.08)', icon: '🪴', label: 'Bloom' },
  ],
  6: [
    { accent: '#06b6d4', bg: 'rgba(6,182,212,0.1)', icon: '☀️', label: 'Summer' },
    { accent: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '🏖️', label: 'Beach' },
    { accent: '#14b8a6', bg: 'rgba(20,184,166,0.1)', icon: '🌊', label: 'Ocean' },
  ],
  7: [
    { accent: '#dc2626', bg: 'rgba(220,38,38,0.12)', icon: '🎆', label: 'Fireworks & America' },
    { accent: '#1d4ed8', bg: 'rgba(29,78,216,0.1)', icon: '🇺🇸', label: 'Patriotic' },
    { accent: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: '☀️', label: 'Summer' },
  ],
  8: [
    { accent: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '🌊', label: 'Beach & sun' },
    { accent: '#ea580c', bg: 'rgba(234,88,12,0.08)', icon: '🌅', label: 'Late summer' },
    { accent: '#65a30d', bg: 'rgba(101,163,13,0.08)', icon: '🍉', label: 'Picnic' },
  ],
  9: [
    { accent: '#ca8a04', bg: 'rgba(202,138,4,0.1)', icon: '🍂', label: 'Fall & trees' },
    { accent: '#a16207', bg: 'rgba(161,98,7,0.1)', icon: '🌾', label: 'Harvest' },
    { accent: '#b45309', bg: 'rgba(180,83,9,0.08)', icon: '📚', label: 'Back to school' },
  ],
  10: [
    { accent: '#ea580c', bg: 'rgba(234,88,12,0.12)', icon: '🎃', label: 'Halloween' },
    { accent: '#78350f', bg: 'rgba(120,53,15,0.12)', icon: '🍂', label: 'Autumn' },
    { accent: '#1c1917', bg: 'rgba(28,25,23,0.15)', icon: '🦇', label: 'Spooky' },
  ],
  11: [
    { accent: '#b45309', bg: 'rgba(180,83,9,0.12)', icon: '🦃', label: 'Thanksgiving' },
    { accent: '#92400e', bg: 'rgba(146,64,14,0.12)', icon: '🌽', label: 'Harvest' },
    { accent: '#a16207', bg: 'rgba(161,98,7,0.1)', icon: '🥧', label: 'Pie & cozy' },
  ],
  12: [
    { accent: '#2563eb', bg: 'rgba(37,99,235,0.1)', icon: '🎄', label: 'Christmas & snow' },
    { accent: '#dc2626', bg: 'rgba(220,38,38,0.12)', icon: '🎁', label: 'Gifts & red' },
    { accent: '#64748b', bg: 'rgba(100,116,139,0.12)', icon: '❄️', label: 'Snow' },
  ],
};

export default function ActivityCalendar() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [themeOptionByMonth, setThemeOptionByMonth] = useState<Record<number, number>>({});
  const [observances, setObservances] = useState<Observance[]>([]);
  const [scrapedEvents, setScrapedEvents] = useState<ScrapedEvent[]>([]);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const options = MONTH_THEME_OPTIONS[month] ?? MONTH_THEME_OPTIONS[1];
  const themeIndex = themeOptionByMonth[month] ?? 0;
  const theme = options[themeIndex] ?? options[0];
  const setThemeForMonth = (index: number) => setThemeOptionByMonth((prev) => ({ ...prev, [month]: index }));

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

  const scrapeEvents = useCallback(async () => {
    const url = scrapeUrl.trim();
    if (!url) return;
    setScrapeError(null);
    setScrapeLoading(true);
    const res = await fetchJson<{ events: ScrapedEvent[] }>(
      `${API_BASE}/api/scrape-events?url=${encodeURIComponent(url)}`
    );
    setScrapeLoading(false);
    if (res.ok && res.data?.events?.length) {
      setScrapedEvents((prev) => [...prev, ...res.data!.events]);
      setScrapeUrl('');
    } else {
      setScrapeError(res.error || 'No events found. Try a page that lists dates (e.g. January 15, Feb 4).');
    }
  }, [scrapeUrl]);

  const clearScrapedEvents = useCallback(() => setScrapedEvents([]), []);

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month - 1 + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const observancesByDay = observances.reduce<Record<number, Observance[]>>((acc, o) => {
    if (!acc[o.day]) acc[o.day] = [];
    acc[o.day].push(o);
    return acc;
  }, {});

  const scrapedByDay = scrapedEvents
    .filter((e) => e.month === month)
    .reduce<Record<number, ScrapedEvent[]>>((acc, e) => {
      if (!acc[e.day]) acc[e.day] = [];
      acc[e.day].push(e);
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

  const handlePrint = () => window.print();

  const cellStyle: React.CSSProperties = {
    minHeight: 100,
    padding: 8,
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${theme.accent}30`,
    borderRadius: 8,
    fontSize: '0.85rem',
  };
  const dayNumStyle: React.CSSProperties = { fontWeight: 600, marginBottom: 4, color: theme.accent };
  const eventStyle: React.CSSProperties = { fontSize: '0.75rem', color: '#94a3b8', marginTop: 4, lineHeight: 1.3 };
  const scrapedStyle: React.CSSProperties = { fontSize: '0.75rem', color: theme.accent, marginTop: 4, lineHeight: 1.3, fontWeight: 500 };

  return (
    <div
      className="activity-calendar-page"
      style={{
        minHeight: '100vh',
        padding: 24,
        maxWidth: 1000,
        margin: '0 auto',
        background: theme.bg,
        borderLeft: `4px solid ${theme.accent}`,
        borderRight: `4px solid ${theme.accent}`,
      }}
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .activity-calendar-page { background: #fff; border: none; padding: 16px; max-width: 100%; }
          body { background: #fff; }
        }
      `}</style>

      <Link
        to="/"
        className="no-print"
        style={{ display: 'inline-block', marginBottom: 24, color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}
      >
        ← Back to Playroom
      </Link>

      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem', color: theme.accent }}>
          {theme.icon} Activity calendar — {MONTHS[month - 1]} {year}
        </h1>
        <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.5 }}>
          Holidays and observances are cross-checked for accuracy (2026–2027+). Add your venue’s events by pasting your website below—we only use public info from the URL you provide.
        </p>
      </header>

      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={prevMonth} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.08)', border: `1px solid ${theme.accent}50`, borderRadius: 10, color: '#e2e8f0', cursor: 'pointer', fontSize: '1rem' }}>
            ←
          </button>
          <span style={{ fontSize: '1.25rem', fontWeight: 600, minWidth: 200, textAlign: 'center', color: theme.accent }}>
            {MONTHS[month - 1]} {year}
          </span>
          <button type="button" onClick={nextMonth} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.08)', border: `1px solid ${theme.accent}50`, borderRadius: 10, color: '#e2e8f0', cursor: 'pointer', fontSize: '1rem' }}>
            →
          </button>
        </div>
        <button type="button" onClick={handlePrint} style={{ padding: '10px 20px', background: theme.accent, border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
          Print calendar
        </button>
      </div>

      {/* Theme option for this month */}
      <div className="no-print" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginRight: 8 }}>Design:</span>
        {options.map((opt, i) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => setThemeForMonth(i)}
            style={{
              marginRight: 8,
              marginBottom: 4,
              padding: '6px 12px',
              borderRadius: 8,
              border: themeIndex === i ? `2px solid ${opt.accent}` : '1px solid rgba(255,255,255,0.2)',
              background: themeIndex === i ? `${opt.accent}20` : 'rgba(255,255,255,0.06)',
              color: themeIndex === i ? opt.accent : '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {/* Import from your website */}
      <section className="no-print" style={{ marginBottom: 24, padding: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: `1px solid ${theme.accent}40` }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1rem', color: theme.accent }}>Import events from your website</h2>
        <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: '0.9rem' }}>
          Paste your <strong>venue website</strong> events page URL. We’ll pull public dates and event info from that page and add them to this month’s calendar. One click—legal and above board. We only use what’s publicly visible on the URL you provide. Facebook/Instagram: a future “Connect Facebook Page” will use their official API when we add it.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="url"
            placeholder="https://yoursite.com/events"
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && scrapeEvents()}
            style={{ flex: '1 1 280px', padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.accent}50`, background: 'rgba(0,0,0,0.2)', color: '#e2e8f0', fontSize: '0.95rem' }}
          />
          <button type="button" onClick={scrapeEvents} disabled={scrapeLoading || !scrapeUrl.trim()} style={{ padding: '10px 20px', background: theme.accent, border: 'none', borderRadius: 8, color: '#fff', cursor: scrapeLoading ? 'wait' : 'pointer', fontWeight: 600 }}>
            {scrapeLoading ? 'Getting events…' : 'Get events'}
          </button>
          {scrapedEvents.length > 0 && (
            <button type="button" onClick={clearScrapedEvents} style={{ padding: '10px 14px', background: 'transparent', border: '1px solid #64748b', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}>
              Clear imported
            </button>
          )}
        </div>
        {scrapeError && <p style={{ color: '#f87171', marginTop: 8, fontSize: '0.85rem' }}>{scrapeError}</p>}
      </section>

      {error && <p style={{ color: '#f87171', marginBottom: 16 }}>{error}</p>}
      {loading && <p style={{ color: '#94a3b8', marginBottom: 16 }}>Loading…</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 24 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} style={{ ...cellStyle, textAlign: 'center', fontWeight: 600, color: theme.accent, minHeight: 40 }}>
            {d}
          </div>
        ))}
        {Array.from({ length: startWeekday }, (_, i) => (
          <div key={`pad-${i}`} style={{ ...cellStyle, opacity: 0.3 }} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const obs = observancesByDay[day] ?? [];
          const scraped = scrapedByDay[day] ?? [];
          return (
            <div key={day} style={cellStyle}>
              <div style={dayNumStyle}>{day}</div>
              {obs.map((o) => (
                <div key={o.name} style={eventStyle} title={o.category}>
                  {o.name}
                </div>
              ))}
              {scraped.map((s) => (
                <div key={`${s.day}-${s.title}`} style={scrapedStyle} title="Imported from your venue website">
                  {s.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <section style={{ padding: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: `1px solid ${theme.accent}30` }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1rem', color: theme.accent }}>This month’s observances</h2>
        {observances.length === 0 && scrapedEvents.filter((e) => e.month === month).length === 0 && !loading && (
          <p style={{ color: '#94a3b8', margin: 0 }}>None this month.</p>
        )}
        <ul style={{ margin: 0, paddingLeft: 20, color: '#cbd5e0', lineHeight: 1.8 }}>
          {observances.map((o) => (
            <li key={`${o.day}-${o.name}`}>
              <strong>{o.day}</strong> — {o.name}
              {o.category && <span style={{ color: '#94a3b8', fontSize: '0.85em' }}> ({o.category})</span>}
            </li>
          ))}
          {scrapedEvents.filter((e) => e.month === month).map((s) => (
            <li key={`s-${s.day}-${s.title}`} style={{ color: theme.accent }}>
              <strong>{s.day}</strong> — {s.title} <span style={{ fontSize: '0.85em', color: '#94a3b8' }}>(your event)</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
