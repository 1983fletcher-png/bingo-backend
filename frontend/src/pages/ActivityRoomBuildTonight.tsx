/**
 * Build Tonight — primary UX path: choose preset, then what to run.
 * Preset applies defaults (theme, scoring, host tips).
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ACTIVITY_PRESETS, type PresetId } from '../data/activityPresets';

const ACTIVITY_PRESET_KEY = 'playroom-activity-preset';

const START_OPTIONS = [
  { title: 'Survey Showdown (Feud)', description: 'Family Feud–style: one prompt, short answers, Top 8 board, reveal and strike.', href: '/host?type=feud' },
  { title: 'Music Bingo', description: 'Run a music bingo game. Add songs, share QR, reveal as you play.', href: '/host?type=music-bingo' },
  { title: 'Trivia', description: 'Host a trivia room. Pick a pack, start the session, run questions.', href: '/host/create?trivia' },
  { title: 'Trivia (build your own)', description: 'Build a custom trivia pack, then host it.', href: '/host/build/trivia' },
  { title: 'Icebreakers & team building', description: 'Guided activities and prompts for groups.', href: '/host?type=icebreakers' },
  { title: 'Estimation Show', description: 'Price guess / numeric estimation. Collect answers, show distribution, reveal correct value. (Coming soon.)', href: '/host?type=estimation' },
  { title: 'Category Grid (Jeopardy-style)', description: 'Board of clues, teams or individuals, lock and reveal. (Coming soon.)', href: '/host?type=jeopardy' },
  { title: 'Interactive poll', description: 'Ask a question, show results live. One link for everyone.', href: '/poll/start' },
];

export default function ActivityRoomBuildTonight() {
  const [preset, setPreset] = useState<PresetId | ''>(() => {
    if (typeof localStorage === 'undefined') return '';
    const s = localStorage.getItem(ACTIVITY_PRESET_KEY);
    return (s && ACTIVITY_PRESETS.some((p) => p.id === s)) ? (s as PresetId) : '';
  });

  const applyPreset = (id: PresetId) => {
    setPreset(id);
    try {
      localStorage.setItem(ACTIVITY_PRESET_KEY, id);
    } catch {}
  };

  const selectedPreset = preset ? ACTIVITY_PRESETS.find((p) => p.id === preset) : null;

  return (
    <div className="activity-room__build">
      <h2 className="activity-room__build-title">Build Tonight</h2>
      <p className="activity-room__build-intro">
        Choose your preset, then what to run. One link for players; open Display on the TV for the room.
      </p>

      <section className="activity-room__card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.0625rem' }}>1. Choose your preset</h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 12px' }}>
          Presets set display theme, scoring, and host tips for your audience.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ACTIVITY_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className="activity-room__btn"
              style={{
                background: preset === p.id ? 'var(--accent)' : 'var(--surface2)',
                color: preset === p.id ? 'var(--accent-contrast, #111)' : 'var(--text)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        {selectedPreset && selectedPreset.hostTips.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <strong style={{ fontSize: 14 }}>Host tips for {selectedPreset.label}:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {selectedPreset.hostTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.0625rem' }}>2. Choose what to run</h3>
      <div className="activity-room__start-cards">
        {START_OPTIONS.map((opt) => (
          <Link
            key={opt.href}
            to={preset ? `${opt.href}${opt.href.includes('?') ? '&' : '?'}preset=${preset}` : opt.href}
            className="activity-room__start-card"
          >
            <h3>{opt.title}</h3>
            <p>{opt.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
