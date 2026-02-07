/**
 * Trivia Builder — choose session template and pack, then Create & host.
 * Flow: Host page → click Trivia → this page → pick pack → Create & host → Host room.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import type { TriviaPack, TriviaQuestion } from '../data/triviaPacks';
import type { EventConfig } from '../types/game';
import { defaultTriviaPacks } from '../data/triviaPacks';
import { barTriviaStandardPack } from '../data/barTriviaPack';
import '../styles/host-create.css';

const PLAYROOM_HOST_CREATED_KEY = 'playroom_host_created';

interface GameCreated {
  code: string;
  joinUrl: string;
  gameType: string;
  eventConfig?: EventConfig;
  waitingRoom: { game: 'roll-call' | null; theme: string; hostMessage: string };
  trivia?: { questions: TriviaQuestion[] };
}

const TRIVIA_PACKS: TriviaPack[] = [
  barTriviaStandardPack,
  ...defaultTriviaPacks.filter((p) => p.id !== barTriviaStandardPack.id),
];

export default function TriviaBuilder() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState<ReturnType<typeof getSocket> | null>(null);
  const [connected, setConnected] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<string>(() => barTriviaStandardPack.id);
  const [createPending, setCreatePending] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [gameTitle, setGameTitle] = useState(barTriviaStandardPack.title);
  const createdRef = useRef(false);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);
    setConnected(s.connected);
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    return () => {
      s.off('connect');
      s.off('disconnect');
    };
  }, []);

  useEffect(() => {
    const pack = TRIVIA_PACKS.find((p) => p.id === selectedPackId);
    if (pack) setGameTitle(pack.title);
  }, [selectedPackId]);

  const handleCreateAndHost = () => {
    const pack = TRIVIA_PACKS.find((p) => p.id === selectedPackId);
    if (!socket || !pack) return;
    createdRef.current = false;
    setCreatePending(true);
    setCreateError(null);

    const handler = (payload: GameCreated) => {
      if (createdRef.current) return;
      createdRef.current = true;
      socket.off('game:created', handler);
      setCreatePending(false);
      try {
        sessionStorage.setItem(PLAYROOM_HOST_CREATED_KEY, JSON.stringify(payload));
      } catch {
        // ignore
      }
      navigate('/host', { replace: true });
    };

    socket.once('game:created', handler);
    socket.emit('host:create', {
      baseUrl: window.location.origin,
      gameType: 'trivia',
      eventConfig: { gameTitle: gameTitle || pack.title },
      questions: pack.questions,
    });

    setTimeout(() => {
      if (createdRef.current) return;
      socket.off('game:created', handler);
      setCreatePending(false);
      setCreateError('Room did not open. Try again.');
    }, 8000);
  };

  const selectedPack = TRIVIA_PACKS.find((p) => p.id === selectedPackId);
  const canCreate = connected && selectedPack && (selectedPack.questions?.length ?? 0) > 0;

  return (
    <div className="host-create" style={{ maxWidth: 560, margin: '0 auto' }}>
      <Link to="/host" className="host-create__back">
        ← Back to Host
      </Link>
      <h1 className="host-create__title">Trivia Builder</h1>
      <p className="host-create__sub">
        Choose a session pack. You can remove or reorder questions in the Questions tab after creating the room.
      </p>

      <div className="host-create__content host-create__packs-wrap">
        <label className="host-create__label">Session / pack</label>
        <select
          className="host-create__select"
          value={selectedPackId}
          onChange={(e) => setSelectedPackId(e.target.value)}
          aria-label="Choose trivia pack"
        >
          {TRIVIA_PACKS.map((pack) => (
            <option key={pack.id} value={pack.id}>
              {pack.title} — {pack.questions.length} questions
            </option>
          ))}
        </select>
        {selectedPack?.description && (
          <p className="host-create__hint">{selectedPack.description}</p>
        )}
      </div>

      {selectedPack?.rounds && (
        <div className="host-create__content" style={{ marginTop: 12 }}>
          <span className="host-create__label">Round structure</span>
          <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
            {selectedPack.rounds.map((r, i) => (
              <li key={i}>
                Round {i + 1}: {r.name} — {r.questionCount} questions
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        className="host-create__btn-primary"
        onClick={handleCreateAndHost}
        disabled={!canCreate || createPending}
        style={{ marginTop: 24 }}
      >
        {createPending ? 'Creating…' : 'Create & host'}
      </button>
      {createError && (
        <p className="host-create__hint" style={{ color: 'var(--error, #fc8181)', marginTop: 8 }}>
          {createError}
        </p>
      )}
      {!connected && (
        <p className="host-create__hint" style={{ marginTop: 8 }}>Waiting for connection…</p>
      )}
    </div>
  );
}

export { PLAYROOM_HOST_CREATED_KEY };
