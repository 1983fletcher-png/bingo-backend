/**
 * Host Trivia creation flow: Game type → Play a Pack → Pack picker → Preview → Host options → Start Hosting.
 * Creates room via room:host-create and redirects to /room/:roomId?role=host.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import { getTriviaRoomPacks } from '../data/triviaRoomPacks';
import type { TriviaPackModel, TriviaQuestionModel, RoomSettings } from '../lib/models';
import type { Socket } from 'socket.io-client';
import '../styles/host-create.css';

const ROOM_HOST_KEY = 'playroom_room_host';

function saveHostToken(roomId: string, hostToken: string) {
  try {
    localStorage.setItem(ROOM_HOST_KEY, JSON.stringify({ roomId, hostToken }));
  } catch (_) {}
}

type Step = 'type' | 'pack' | 'preview' | 'options';

const PRESET_LABELS: Record<string, { duration: string; vibe: string; audience: string }> = {
  weekly_bar_classic: { duration: '90 min', vibe: 'Classic bar night', audience: 'Adults' },
  weekly_bar_extended: { duration: '120 min', vibe: 'Longer, harder', audience: 'Adults' },
  quick_bar_happy_hour: { duration: '30–40 min', vibe: 'Quick & fun', audience: 'Adults' },
  display_automated: { duration: 'Continuous', vibe: 'No host required', audience: 'Any' },
  theme_night_fan: { duration: '90 min', vibe: 'Fan deep dive', audience: 'Fans' },
  family_friendly: { duration: '60 min', vibe: 'All ages', audience: 'Family' },
  speed_trivia: { duration: '20–30 min', vibe: 'High energy', audience: 'Adults' },
  seasonal_holiday: { duration: '60–90 min', vibe: 'Seasonal', audience: 'Any' },
};

export default function HostCreateTrivia() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromHost = searchParams.get('trivia') != null || searchParams.get('from') === 'host';
  const [step, setStep] = useState<Step>(() => (fromHost ? 'pack' : 'type'));
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedPack, setSelectedPack] = useState<TriviaPackModel | null>(null);
  const [settings, setSettings] = useState<Partial<RoomSettings>>({
    leaderboardsVisibleToPlayers: true,
    leaderboardsVisibleOnDisplay: true,
    mcTipsEnabled: true,
    autoAdvanceEnabled: false,
    speedBonusEnabled: false,
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packs = getTriviaRoomPacks();

  useEffect(() => {
    const s = getSocket();
    setSocket(s);
    const onCreated = (data: { roomId: string; hostToken?: string }) => {
      if (data.roomId && data.hostToken) saveHostToken(data.roomId, data.hostToken);
      setCreating(false);
      navigate(`/room/${data.roomId}?role=host`, { replace: true });
    };
    const onError = (e: { message?: string }) => {
      setError(e?.message || 'Failed to create room');
      setCreating(false);
    };
    s.on('room:created', onCreated);
    s.on('room:error', onError);
    return () => {
      s.off('room:created', onCreated);
      s.off('room:error', onError);
    };
  }, [navigate]);

  const handleStartHosting = () => {
    if (!selectedPack || !socket?.connected) return;
    setError(null);
    setCreating(true);
    socket.emit('room:host-create', {
      pack: selectedPack,
      settings,
    });
  };

  if (step === 'type') {
    return (
      <div className="host-create" style={{ padding: 24, maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 8px' }}>Create game</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 24px' }}>Choose game type (Trivia only for now).</p>
        <button
          type="button"
          className="join-page__btn"
          style={{ width: '100%', marginBottom: 12 }}
          onClick={() => setStep('pack')}
        >
          Trivia
        </button>
        <Link to="/host?type=trivia" style={{ display: 'block', marginTop: 16, fontSize: 14 }}>← Back to host</Link>
      </div>
    );
  }

  if (step === 'pack') {
    return (
      <div className="host-create" style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 8px' }}>Play a Trivia Pack</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 24px' }}>Select a verified pack.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {packs.map((pack) => {
            const meta = PRESET_LABELS[pack.presetType] || { duration: `${pack.durationMinutes} min`, vibe: '', audience: pack.audienceRating };
            return (
              <button
                key={pack.id}
                type="button"
                className="join-page__btn"
                style={{
                  textAlign: 'left',
                  background: selectedPack?.id === pack.id ? 'var(--accent)' : 'var(--surface)',
                  border: selectedPack?.id === pack.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                }}
                onClick={() => setSelectedPack(pack)}
              >
                <strong>{pack.title}</strong>
                <span style={{ display: 'block', fontSize: 14, opacity: 0.9 }}>
                  {meta.duration} · {meta.vibe} · {meta.audience}
                  {pack.verified ? ' · Verified' : ''}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          {fromHost ? (
            <Link to="/host?type=trivia" className="join-page__btn" style={{ textDecoration: 'none', color: 'inherit' }}>← Back to host</Link>
          ) : (
            <button type="button" className="join-page__btn" onClick={() => setStep('type')}>Back</button>
          )}
          <button
            type="button"
            className="join-page__btn"
            disabled={!selectedPack}
            onClick={() => setStep('preview')}
          >
            Preview pack
          </button>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    const pack: TriviaPackModel | undefined = selectedPack ?? packs[0] ?? undefined;
    const questions = (pack?.questions ?? []) as TriviaQuestionModel[];
    return (
      <div className="host-create" style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 8px' }}>Pack preview</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 16px' }}>
          {pack?.title} · {questions.length} questions
          {pack?.verified ? ' · Verified' : ''}
        </p>
        <div style={{ marginBottom: 24, padding: 16, background: 'var(--surface)', borderRadius: 12, maxHeight: 240, overflow: 'auto' }}>
          {questions.slice(0, 10).map((q, i) => (
            <div key={q.id} style={{ marginBottom: 8, fontSize: 14 }}>
              {i + 1}. {q.prompt}
            </div>
          ))}
          {questions.length > 10 && (
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>… and {questions.length - 10} more</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" className="join-page__btn" onClick={() => setStep('pack')}>Back</button>
          <button type="button" className="join-page__btn" onClick={() => setStep('options')}>Load pack → Host options</button>
        </div>
      </div>
    );
  }

  return (
    <div className="host-create" style={{ padding: 24, maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 8px' }}>Host options</h1>
      <p style={{ color: 'var(--text-muted)', margin: '0 0 24px' }}>Leaderboard and tips (defaults are good for most).</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={settings.leaderboardsVisibleToPlayers ?? true}
            onChange={(e) => setSettings((s) => ({ ...s, leaderboardsVisibleToPlayers: e.target.checked }))}
          />
          Leaderboards visible to players
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={settings.leaderboardsVisibleOnDisplay ?? true}
            onChange={(e) => setSettings((s) => ({ ...s, leaderboardsVisibleOnDisplay: e.target.checked }))}
          />
          Leaderboards on display/TV
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={settings.mcTipsEnabled ?? true}
            onChange={(e) => setSettings((s) => ({ ...s, mcTipsEnabled: e.target.checked }))}
          />
          MC tips (fun facts, banter)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={settings.autoAdvanceEnabled ?? false}
            onChange={(e) => setSettings((s) => ({ ...s, autoAdvanceEnabled: e.target.checked }))}
          />
          Auto-advance timers
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={settings.speedBonusEnabled ?? false}
            onChange={(e) => setSettings((s) => ({ ...s, speedBonusEnabled: e.target.checked }))}
          />
          Speed bonus
        </label>
      </div>
      {error && <p style={{ color: 'var(--error)', marginTop: 16 }}>{error}</p>}
      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button type="button" className="join-page__btn" onClick={() => setStep('preview')}>Back</button>
        <button
          type="button"
          className="join-page__btn"
          disabled={!selectedPack || creating}
          onClick={handleStartHosting}
        >
          {creating ? 'Creating…' : 'Start hosting'}
        </button>
      </div>
    </div>
  );
}
