import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../lib/safeFetch';
import {
  buildCalendarPrintPack,
  type CalendarPrintDay,
  type CalendarPlanningDay,
  type ObservancesIndexDay,
} from '../lib/printMaterials';
import type { CalendarObservance } from '../types/observance';

const API_BASE =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : window.location.origin);

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type ThemeOption = { accent: string; bg: string; icon: string; label: string };

const NEUTRAL_THEME: ThemeOption = {
  accent: '#1e293b',
  bg: '#f8fafc',
  icon: '📅',
  label: 'Neutral / High Contrast',
};

const CALENDAR_STORAGE_VERSION = 'v1';

function storageKeyTheme(): string {
  return `playroom.calendar.${CALENDAR_STORAGE_VERSION}.theme`;
}

function storageKeyMonth(year: number, month: number): string {
  const mm = String(month).padStart(2, '0');
  return `playroom.calendar.${CALENDAR_STORAGE_VERSION}.${year}-${mm}`;
}

type MonthStorage = {
  selectionsByDate: Record<number, string[]>;
  notesByDate: Record<number, string>;
};

function loadMonthStorage(year: number, month: number): MonthStorage {
  try {
    const raw = localStorage.getItem(storageKeyMonth(year, month));
    if (!raw) return { selectionsByDate: {}, notesByDate: {} };
    const data = JSON.parse(raw) as Partial<MonthStorage>;
    return {
      selectionsByDate: data.selectionsByDate && typeof data.selectionsByDate === 'object' ? data.selectionsByDate : {},
      notesByDate: data.notesByDate && typeof data.notesByDate === 'object' ? data.notesByDate : {},
    };
  } catch {
    return { selectionsByDate: {}, notesByDate: {} };
  }
}

function saveMonthStorage(year: number, month: number, data: MonthStorage): void {
  try {
    localStorage.setItem(storageKeyMonth(year, month), JSON.stringify(data));
  } catch (_) {}
}

function loadThemeIndex(): number {
  try {
    const raw = localStorage.getItem(storageKeyTheme());
    if (raw === null) return 0;
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 0) return n;
  } catch (_) {}
  return 0;
}

function saveThemeIndex(index: number): void {
  try {
    localStorage.setItem(storageKeyTheme(), String(index));
  } catch (_) {}
}

// Month-specific fun themes (existing)
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

function getThemeOptions(month: number): ThemeOption[] {
  const monthThemes = MONTH_THEME_OPTIONS[month] ?? MONTH_THEME_OPTIONS[1];
  return [NEUTRAL_THEME, ...monthThemes];
}

const NOTES_DEBOUNCE_MS = 500;

export default function ActivityCalendar() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [themeIndex, setThemeIndexState] = useState(loadThemeIndex);
  const [observances, setObservances] = useState<CalendarObservance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [selectionsByDate, setSelectionsByDate] = useState<Record<number, string[]>>({});
  const [notesByDate, setNotesByDate] = useState<Record<number, string>>({});
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const options = getThemeOptions(month);
  const theme = options[themeIndex] ?? options[0];

  const setThemeIndex = useCallback((index: number) => {
    setThemeIndexState(index);
    saveThemeIndex(index);
  }, []);

  useEffect(() => {
    const loaded = loadMonthStorage(year, month);
    setSelectionsByDate(loaded.selectionsByDate);
    setNotesByDate(loaded.notesByDate);
  }, [year, month]);

  useEffect(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      persistTimer.current = null;
      saveMonthStorage(year, month, { selectionsByDate, notesByDate });
    }, NOTES_DEBOUNCE_MS);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [year, month, selectionsByDate, notesByDate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetchJson<{ observances: CalendarObservance[] }>(
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

  const observancesByDay = observances.reduce<Record<number, CalendarObservance[]>>((acc, o) => {
    if (!acc[o.day]) acc[o.day] = [];
    acc[o.day].push(o);
    return acc;
  }, {});

  const toggleSelection = useCallback((day: number, observanceName: string) => {
    setSelectionsByDate((prev) => {
      const list = prev[day] ?? [];
      const next = list.includes(observanceName)
        ? list.filter((n) => n !== observanceName)
        : [...list, observanceName];
      return { ...prev, [day]: next };
    });
  }, []);

  const setNoteForDay = useCallback((day: number, text: string) => {
    setNotesByDate((prev) => ({ ...prev, [day]: text }));
  }, []);

  const clearDayNotes = useCallback((day: number) => {
    if (!window.confirm('Clear all notes for this day?')) return;
    setNotesByDate((prev) => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
  }, []);

  const clearDaySelections = useCallback((day: number) => {
    if (!window.confirm('Clear all selections for this day?')) return;
    setSelectionsByDate((prev) => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
  }, []);

  const prevMonth = () => {
    if (month === 1) setYear((y) => y - 1);
    setMonth((m) => (m === 1 ? 12 : m - 1));
    setExpandedDay(null);
  };
  const nextMonth = () => {
    if (month === 12) setYear((y) => y + 1);
    setMonth((m) => (m === 12 ? 1 : m + 1));
    setExpandedDay(null);
  };

  const handleDayClick = (day: number) => {
    setExpandedDay((prev) => (prev === day ? null : day));
  };

  const allDaysWithObservances = Array.from(
    new Set(observances.map((o) => o.day))
  ).sort((a, b) => a - b);
  const daysToShowInIndex = allDaysWithObservances;

  const handlePrint = useCallback(() => {
    const gridDays: CalendarPrintDay[] = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const obs = observancesByDay[day] ?? [];
      return { day, primaryName: obs[0]?.name ?? null };
    });
    const planningDays: CalendarPlanningDay[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const selected = selectionsByDate[d] ?? [];
      const note = (notesByDate[d] ?? '').trim();
      if (selected.length === 0 && !note) continue;
      const date = new Date(year, month - 1, d);
      const dateLabel = `${WEEKDAYS[date.getDay()]}, ${MONTHS[month - 1]} ${d}, ${year}`;
      planningDays.push({
        day: d,
        dateLabel,
        selectedNames: selected,
        noteText: note,
      });
    }
    const observancesIndex: ObservancesIndexDay[] = allDaysWithObservances.map((d) => ({
      day: d,
      observances: (observancesByDay[d] ?? []).map((o) => ({ name: o.name, category: o.categories?.[0] })),
      noteText: notesByDate[d] ?? '',
    }));
    const html = buildCalendarPrintPack(
      year,
      month,
      MONTHS[month - 1],
      daysInMonth,
      startWeekday,
      gridDays,
      planningDays,
      {
        printStyle: 'neutral',
        observancesIndex,
        includeBlankLinesUnderObservances: false,
      }
    );
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank', 'noopener');
    if (!w) {
      URL.revokeObjectURL(url);
      return;
    }
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [year, month, daysInMonth, startWeekday, observancesByDay, selectionsByDate, notesByDate, allDaysWithObservances]);

  const cellStyle: React.CSSProperties = {
    minHeight: 100,
    padding: 8,
    background: theme.bg === NEUTRAL_THEME.bg ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${theme.accent}30`,
    borderRadius: 8,
    fontSize: '0.85rem',
    cursor: 'pointer',
  };
  const dayNumStyle: React.CSSProperties = { fontWeight: 600, marginBottom: 4, color: theme.accent };
  const eventStyle: React.CSSProperties = { fontSize: '0.75rem', color: theme.accent === NEUTRAL_THEME.accent ? '#475569' : '#94a3b8', marginTop: 4, lineHeight: 1.3 };
  const moreStyle: React.CSSProperties = { fontSize: '0.7rem', color: theme.accent === NEUTRAL_THEME.accent ? '#64748b' : '#94a3b8', marginTop: 2 };

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
        .activity-calendar-grid-wrap { width: 100%; min-width: 0; overflow: hidden; }
        .activity-calendar-landscape-tip { display: none; }
        [data-theme="light"] .activity-calendar-month-btn { color: #1e293b !important; }
        @media (max-width: 640px) {
          .activity-calendar-landscape-tip { display: block; }
          .activity-calendar-grid-wrap { gap: 4px; }
          .activity-calendar-grid-wrap .activity-calendar-cell { min-height: 64px; padding: 4px; font-size: 0.75rem; }
          .activity-calendar-grid-wrap .activity-calendar-cell-day { font-size: 0.8rem; }
        }
        @media print {
          .no-print { display: none !important; }
          .activity-calendar-page { background: #fff; border: none; padding: 16px; max-width: 100%; }
          body { background: #fff; }
        }
      `}</style>

      <Link
        to="/"
        className="no-print"
        style={{ display: 'inline-block', marginBottom: 16, color: theme.accent === NEUTRAL_THEME.accent ? '#475569' : '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}
      >
        ← Back to Playroom
      </Link>

      <header style={{ marginBottom: 24, textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.75rem', color: theme.accent }}>
          {theme.icon} Activity calendar
        </h1>
        <p style={{ margin: '0 0 8px', fontSize: '1.15rem', fontWeight: 600, color: theme.accent }}>
          {MONTHS[month - 1]}
        </p>
        <p style={{ margin: 0, color: theme.accent === NEUTRAL_THEME.accent ? '#475569' : '#94a3b8', lineHeight: 1.5, fontSize: '0.9rem' }}>
          Verified observances for planning. Your selections and notes stay on this device only.
        </p>
      </header>

      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <button type="button" className="activity-calendar-month-btn" onClick={prevMonth} style={{ padding: '10px 16px', background: theme.bg === NEUTRAL_THEME.bg ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', border: `1px solid ${theme.accent}50`, borderRadius: 10, color: theme.accent === NEUTRAL_THEME.accent ? '#1e293b' : '#e2e8f0', cursor: 'pointer', fontSize: '1rem' }}>
          ←
        </button>
        <span style={{ fontSize: '1.25rem', fontWeight: 600, minWidth: 200, textAlign: 'center', color: theme.accent }}>
          {MONTHS[month - 1]} {year}
        </span>
        <button type="button" className="activity-calendar-month-btn" onClick={nextMonth} style={{ padding: '10px 16px', background: theme.bg === NEUTRAL_THEME.bg ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', border: `1px solid ${theme.accent}50`, borderRadius: 10, color: theme.accent === NEUTRAL_THEME.accent ? '#1e293b' : '#e2e8f0', cursor: 'pointer', fontSize: '1rem' }}>
          →
        </button>
      </div>

      <div className="no-print" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: '0.85rem', color: theme.accent === NEUTRAL_THEME.accent ? '#475569' : '#94a3b8', marginRight: 4 }}>Design:</span>
        {options.map((opt, i) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => setThemeIndex(i)}
            style={{
              marginRight: 0,
              marginBottom: 4,
              padding: '6px 12px',
              borderRadius: 8,
              border: themeIndex === i ? `2px solid ${opt.accent}` : `1px solid ${theme.accent}40`,
              background: themeIndex === i ? (opt.accent === NEUTRAL_THEME.accent ? 'rgba(30,41,59,0.12)' : `${opt.accent}20`) : 'transparent',
              color: themeIndex === i ? opt.accent : (theme.accent === NEUTRAL_THEME.accent ? '#64748b' : '#94a3b8'),
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
        <span style={{ width: 16, display: 'inline-block' }} />
        <button type="button" onClick={handlePrint} style={{ padding: '10px 20px', background: theme.accent, border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
          Print calendar
        </button>
      </div>

      {error && <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>}
      {loading && <p style={{ color: theme.accent === NEUTRAL_THEME.accent ? '#64748b' : '#94a3b8', marginBottom: 16 }}>Loading…</p>}

      <p className="no-print activity-calendar-landscape-tip" style={{ margin: '0 0 8px', fontSize: '0.8rem', color: theme.accent === NEUTRAL_THEME.accent ? '#64748b' : '#94a3b8', textAlign: 'center' }} aria-hidden>
        Tip: Turn your phone sideways for a full calendar view.
      </p>
      <div className="activity-calendar-grid-wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 24 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="activity-calendar-cell" style={{ ...cellStyle, textAlign: 'center', fontWeight: 600, color: theme.accent, minHeight: 40, cursor: 'default' }}>
            {d}
          </div>
        ))}
        {Array.from({ length: startWeekday }, (_, i) => (
          <div key={`pad-${i}`} className="activity-calendar-cell" style={{ ...cellStyle, opacity: 0.3, cursor: 'default' }} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const obs = observancesByDay[day] ?? [];
          const primary = obs[0];
          const moreCount = obs.length > 1 ? obs.length - 1 : 0;
          const isExpanded = expandedDay === day;
          return (
            <div
              key={day}
              className="activity-calendar-cell"
              role="button"
              tabIndex={0}
              onClick={() => handleDayClick(day)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDayClick(day); } }}
              style={{
                ...cellStyle,
                outline: isExpanded ? `2px solid ${theme.accent}` : 'none',
                outlineOffset: 2,
              }}
            >
              <div className="activity-calendar-cell-day" style={dayNumStyle}>{day}</div>
              {primary && <div style={eventStyle}>{primary.name}</div>}
              {moreCount > 0 && <div style={moreStyle}>+{moreCount} more</div>}
            </div>
          );
        })}
      </div>

      {expandedDay !== null && (() => {
        const day = expandedDay;
        const obs = observancesByDay[day] ?? [];
        const selected = selectionsByDate[day] ?? [];
        const note = notesByDate[day] ?? '';
        const date = new Date(year, month - 1, day);
        const dateLabel = `${WEEKDAYS[date.getDay()]}, ${MONTHS[month - 1]} ${day}, ${year}`;
        const mutedColor = theme.accent === NEUTRAL_THEME.accent ? '#64748b' : '#94a3b8';
        const borderColor = theme.accent === NEUTRAL_THEME.accent ? '#cbd5e1' : 'rgba(255,255,255,0.3)';
        return (
          <section
            className="no-print"
            style={{
              marginBottom: 24,
              padding: 20,
              background: theme.bg === NEUTRAL_THEME.bg ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
              borderRadius: 12,
              border: `1px solid ${theme.accent}40`,
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: theme.accent }}>{dateLabel}</h2>
            {obs.length === 0 && (
              <p style={{ color: mutedColor, fontSize: '0.9rem', margin: 0 }}>None this day.</p>
            )}
            {obs.map((o) => {
              const isSelected = selected.includes(o.name);
              const displayName = o.short_name ?? o.name;
              const isCommunity = o.authorship?.created_by === 'community';
              const isVerified = o.verification?.confidence === 'high';
              const countryLabel = o.country === 'US' ? 'United States' : o.country;
              const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(o.name)}`;
              const aboutUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(o.name)}`;
              return (
                <div
                  key={o.id ?? o.name}
                  style={{
                    marginBottom: 20,
                    padding: 16,
                    background: theme.bg === NEUTRAL_THEME.bg ? '#fff' : 'rgba(0,0,0,0.08)',
                    borderRadius: 10,
                    border: `1px solid ${theme.accent}30`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: theme.accent }}>{displayName}</h3>
                    <button
                      type="button"
                      onClick={() => toggleSelection(day, o.name)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 999,
                        border: `1px solid ${isSelected ? theme.accent : borderColor}`,
                        background: isSelected ? `${theme.accent}25` : 'transparent',
                        color: isSelected ? theme.accent : (theme.accent === NEUTRAL_THEME.accent ? '#475569' : '#cbd5e0'),
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      {isSelected ? '✓ Selected' : 'Select for planning'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {isCommunity && (
                      <span style={{ padding: '4px 8px', borderRadius: 6, background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: 600 }}>Community-Created</span>
                    )}
                    {isVerified && (
                      <span style={{ padding: '4px 8px', borderRadius: 6, background: '#dcfce7', color: '#166534', fontSize: '0.75rem', fontWeight: 600 }}>Verified</span>
                    )}
                    {o.country && (
                      <span style={{ padding: '4px 8px', borderRadius: 6, background: theme.bg === NEUTRAL_THEME.bg ? '#f1f5f9' : 'rgba(255,255,255,0.15)', color: mutedColor, fontSize: '0.75rem' }}>{countryLabel}</span>
                    )}
                    {(o.categories?.length ?? 0) > 0 && o.categories.slice(0, 4).map((c) => (
                      <span key={c} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${theme.accent}40`, color: theme.accent, fontSize: '0.75rem' }}>{c}</span>
                    ))}
                  </div>
                  {o.why_matters && (
                    <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: theme.accent === NEUTRAL_THEME.accent ? '#334155' : '#cbd5e0', lineHeight: 1.45 }}>
                      <strong style={{ color: mutedColor, fontSize: '0.8rem' }}>Why this day matters:</strong> {o.why_matters}
                    </p>
                  )}
                  {o.activity_hint && (
                    <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: theme.accent, lineHeight: 1.45 }}>
                      <strong>Activity idea:</strong> {o.activity_hint}
                    </p>
                  )}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.accent}20`, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <a href={searchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: theme.accent }}>Search Google</a>
                    <a href={aboutUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: theme.accent }}>About this observance</a>
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: theme.accent === NEUTRAL_THEME.accent ? '#334155' : '#e2e8f0' }}>
                Notes (private to this device, included in print)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNoteForDay(day, e.target.value)}
                placeholder="Add planning notes…"
                rows={3}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${theme.accent}50`,
                  background: theme.bg === NEUTRAL_THEME.bg ? '#fff' : 'rgba(0,0,0,0.2)',
                  color: theme.accent === NEUTRAL_THEME.accent ? '#1e293b' : '#e2e8f0',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => clearDayNotes(day)}
                style={{ padding: '8px 14px', background: 'transparent', border: '1px solid #64748b', borderRadius: 8, color: theme.accent === NEUTRAL_THEME.accent ? '#475569' : '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Clear this day’s notes
              </button>
              <button
                type="button"
                onClick={() => clearDaySelections(day)}
                style={{ padding: '8px 14px', background: 'transparent', border: '1px solid #64748b', borderRadius: 8, color: theme.accent === NEUTRAL_THEME.accent ? '#475569' : '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Clear this day’s selections
              </button>
            </div>
          </section>
        );
      })()}

      <section style={{ padding: 20, background: theme.bg === NEUTRAL_THEME.bg ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)', borderRadius: 12, border: `1px solid ${theme.accent}30` }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1rem', color: theme.accent }}>This month’s observances</h2>
        {observances.length === 0 && !loading && (
          <p style={{ color: theme.accent === NEUTRAL_THEME.accent ? '#64748b' : '#94a3b8', margin: 0 }}>None this month.</p>
        )}
        <div style={{ margin: 0 }}>
          {daysToShowInIndex.map((d) => {
            const obs = observancesByDay[d] ?? [];
            if (obs.length === 0) return null;
            return (
              <div key={d} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: theme.accent, fontSize: '0.9rem' }}>{MONTHS[month - 1]} {d}</div>
                <ul style={{ margin: 0, paddingLeft: 18, color: theme.accent === NEUTRAL_THEME.accent ? '#334155' : '#cbd5e0', lineHeight: 1.6, fontSize: '0.875rem' }}>
                  {obs.map((o) => (
                    <li key={o.id ?? o.name}>{o.short_name ?? o.name}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
