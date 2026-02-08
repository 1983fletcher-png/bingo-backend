/**
 * Trivia Room — role-based runtime (host | player | display).
 * Same room code/QR for waiting → game → end; state from ROOM_SNAPSHOT.
 */
import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import type { Socket } from 'socket.io-client';
import type { RoomSnapshotPayload, RoomModel, PlayerModel, TriviaQuestionModel } from '../lib/models';
import { isStartButtonEnabled, isStartReadyCheckEnabled } from '../lib/models';
import '../styles/join.css';

const ROOM_HOST_KEY = 'playroom_room_host';
const PLAYER_IDENTITY_KEY = 'playroom_identity';

type Role = 'host' | 'player' | 'display';

function getStoredHostToken(roomId: string): string | null {
  try {
    const raw = localStorage.getItem(ROOM_HOST_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.roomId === roomId ? data.hostToken : null;
  } catch {
    return null;
  }
}

function saveHostToken(roomId: string, hostToken: string) {
  try {
    localStorage.setItem(ROOM_HOST_KEY, JSON.stringify({ roomId, hostToken }));
  } catch (_) {}
}

function getStoredPlayerIdentity(): { roomId?: string; playerId: string; displayName: string; isAnonymous: boolean } | null {
  try {
    const raw = localStorage.getItem(PLAYER_IDENTITY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePlayerIdentity(roomId: string, playerId: string, displayName: string, isAnonymous: boolean) {
  try {
    localStorage.setItem(PLAYER_IDENTITY_KEY, JSON.stringify({
      roomId,
      playerId,
      displayName,
      isAnonymous,
    }));
  } catch (_) {}
}

function generatePlayerId(): string {
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  return Array.from({ length: 16 }, hex).join('');
}

const FUNNY_NAMES = [
  'Breezy Otter', 'Cosmic Pretzel Wizard', 'Salty Marshmallow', 'Dapper Penguin',
  'Cheerful Llama', 'Velvet Thunder', 'Silly Goose', 'Brave Potato', 'Mystic Muffin',
];
function randomFunnyName(): string {
  return FUNNY_NAMES[Math.floor(Math.random() * FUNNY_NAMES.length)];
}

/** Get the correct-answer display text for host/display when revealed (mc/tf: option text; short: primary). */
function getAnswerDisplayText(q: TriviaQuestionModel | null): string {
  if (!q?.answer) return '';
  const ans = q.answer as unknown as Record<string, unknown>;
  if (ans.options && Array.isArray(ans.options) && typeof ans.correct === 'string') {
    const opt = (ans.options as { id: string; text: string }[]).find((o) => o.id === ans.correct);
    return opt?.text ?? String(ans.correct);
  }
  if (typeof ans.primary === 'string') return ans.primary;
  if (q.type === 'tf' && (ans.correct === 'true' || ans.correct === 'false')) return ans.correct === 'true' ? 'True' : 'False';
  return String(ans.correct ?? '');
}

// —— Host panel (operations-grade controls) ——
function HostPanel({
  room,
  players,
  currentQuestion,
  responsesCount,
  leaderboardTop,
  pack,
  socket,
  roomId,
}: {
  room: RoomModel;
  players: PlayerModel[];
  currentQuestion: TriviaQuestionModel | null;
  responsesCount: number;
  leaderboardTop: PlayerModel[];
  pack?: { title?: string; questions?: unknown[] };
  socket: Socket | null;
  roomId: string;
}) {
  const packLoaded = Boolean(pack?.questions?.length);
  const hostConnected = Boolean(socket?.connected);
  const startReadyCheckEnabled = isStartReadyCheckEnabled(room.state, packLoaded, hostConnected);
  const beginRoundEnabled = isStartButtonEnabled(room.state, packLoaded, hostConnected);

  const setState = (nextState: RoomModel['state']) => {
    if (socket?.connected) socket.emit('room:host-set-state', { roomId, nextState });
  };

  const goNext = () => {
    if (socket?.connected) socket.emit('room:host-next', { roomId });
  };

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}` : '';

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 24 }}>Host — {pack?.title || 'Trivia'}</h1>
      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>
        Room <strong>{roomId}</strong> · {room.state} · {players.length} player(s) · {responsesCount} responses
      </p>
      <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-muted)', wordBreak: 'break-all' }}>
        Players join: <strong>{joinUrl}</strong>
      </p>
      <p style={{ margin: '8px 0 0', fontSize: 14 }}>
        <Link to="/host?type=trivia">← Back to host</Link>
      </p>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {room.state === 'WAITING_ROOM' && (
          <button
            className="join-page__btn"
            disabled={!startReadyCheckEnabled}
            onClick={() => setState('READY_CHECK')}
          >
            Start ready check
          </button>
        )}
        {room.state === 'READY_CHECK' && (
          <button
            className="join-page__btn"
            disabled={!beginRoundEnabled}
            onClick={() => setState('ACTIVE_ROUND')}
          >
            Begin round
          </button>
        )}
        {room.state === 'ACTIVE_ROUND' && (
          <button
            className="join-page__btn"
            onClick={() => setState('REVEAL')}
          >
            Reveal answer
          </button>
        )}
        {(room.state === 'REVEAL' || room.state === 'LEADERBOARD' || room.state === 'REVIEW') && (
          <button className="join-page__btn" onClick={goNext}>
            Next
          </button>
        )}
        {room.state !== 'END_ROOM' && (
          <button
            className="join-page__btn"
            style={{ background: 'var(--surface)', color: 'var(--text)' }}
            onClick={() => setState('END_ROOM')}
          >
            End room
          </button>
        )}
      </div>

      {currentQuestion && (room.state === 'ACTIVE_ROUND' || room.state === 'REVEAL') && (
        <div style={{ marginTop: 24, padding: 16, background: 'var(--surface)', borderRadius: 12 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{currentQuestion.prompt}</p>
          {room.state === 'REVEAL' && (
            <p style={{ margin: '16px 0 0', padding: '12px 16px', background: 'var(--accent)', color: '#111', borderRadius: 8, fontSize: 20, fontWeight: 700 }}>
              Answer: {getAnswerDisplayText(currentQuestion)}
            </p>
          )}
        </div>
      )}

      {leaderboardTop.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 16 }}>Leaderboard</h2>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {leaderboardTop.slice(0, 10).map((p) => (
              <li key={p.playerId}>{p.displayName} — {p.score} pts</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// —— Player panel (answer cards, timer) ——
function PlayerPanel({
  room,
  currentQuestion,
  pack,
  socket,
  roomId,
}: {
  room: RoomModel;
  currentQuestion: TriviaQuestionModel | null;
  pack?: { title?: string };
  socket: Socket | null;
  roomId: string;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const identity = getStoredPlayerIdentity();
  const playerId = identity?.playerId;

  useEffect(() => {
    setSelectedOption(null);
    setLocked(false);
  }, [currentQuestion?.id]);

  const submitMc = (optionId: string) => {
    if (!socket?.connected || !playerId || !currentQuestion) return;
    if (locked) return;
    if (selectedOption === optionId) {
      setLocked(true);
      socket.emit('room:submit-response', {
        roomId,
        questionId: currentQuestion.id,
        playerId,
        payload: { optionId },
      });
    } else {
      setSelectedOption(optionId);
    }
  };

  const options = currentQuestion?.type === 'mc' && currentQuestion.answer && 'options' in currentQuestion.answer
    ? (currentQuestion.answer.options || [])
    : [];

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-muted)' }}>
        {pack?.title || 'Trivia'} · {room.state} · Q{room.runtime.currentQuestionIndex + 1}
      </div>
      {room.state === 'WAITING_ROOM' || room.state === 'READY_CHECK' ? (
        <p style={{ fontSize: 18 }}>Waiting for host to start the round…</p>
      ) : currentQuestion ? (
        <>
          <div style={{ marginBottom: 20, padding: 16, background: 'var(--surface)', borderRadius: 12 }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 600, lineHeight: 1.4 }}>{currentQuestion.prompt}</p>
          </div>
          {room.state === 'ACTIVE_ROUND' && options.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="join-page__btn"
                  style={{
                    minHeight: 44,
                    background: selectedOption === opt.id ? 'var(--accent)' : 'var(--surface)',
                    border: selectedOption === opt.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                  }}
                  onClick={() => submitMc(opt.id)}
                  disabled={locked}
                >
                  {opt.id}. {opt.text} {locked && selectedOption === opt.id ? ' ✓ Locked' : ''}
                </button>
              ))}
            </div>
          )}
          {room.state === 'REVEAL' && (
            <p style={{ color: 'var(--text-muted)' }}>Answer revealed. Next question soon.</p>
          )}
        </>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>No question right now.</p>
      )}
    </div>
  );
}

// —— Display panel (TV: big question + 2x2 answers) ——
function DisplayPanel({
  room,
  currentQuestion,
  pack,
}: {
  room: RoomModel;
  currentQuestion: TriviaQuestionModel | null;
  pack?: { title?: string };
}) {
  const options = currentQuestion?.type === 'mc' && currentQuestion.answer && 'options' in currentQuestion.answer
    ? (currentQuestion.answer.options || [])
    : [];
  const correctId = currentQuestion?.type === 'mc' && currentQuestion.answer && 'correct' in currentQuestion.answer
    ? (currentQuestion.answer as { correct: string }).correct
    : null;
  const showCorrect = room.state === 'REVEAL';
  const answerText = showCorrect ? getAnswerDisplayText(currentQuestion) : '';

  return (
    <div style={{ padding: 32, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 20, color: 'var(--text-muted)', marginBottom: 16 }}>{pack?.title || 'Trivia'}</div>
      {currentQuestion ? (
        <>
          <p style={{ fontSize: 'clamp(24px, 4vw, 48px)', fontWeight: 700, textAlign: 'center', maxWidth: 900, margin: '0 0 48px' }}>
            {currentQuestion.prompt}
          </p>
          {options.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 800 }}>
              {options.map((opt) => (
                <div
                  key={opt.id}
                  style={{
                    padding: 24,
                    minHeight: 80,
                    background: showCorrect && opt.id === correctId ? 'var(--accent)' : 'var(--surface)',
                    border: showCorrect && opt.id === correctId ? '3px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 12,
                    fontSize: 'clamp(18px, 2.5vw, 28px)',
                    fontWeight: 600,
                    opacity: showCorrect && opt.id !== correctId ? 0.6 : 1,
                  }}
                >
                  {opt.id}. {opt.text}
                </div>
              ))}
            </div>
          )}
          {showCorrect && answerText && options.length === 0 && (
            <p style={{ margin: 0, padding: '24px 32px', background: 'var(--accent)', color: '#111', borderRadius: 12, fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700 }}>
              Answer: {answerText}
            </p>
          )}
        </>
      ) : (
        <p style={{ fontSize: 28, color: 'var(--text-muted)' }}>Waiting for question…</p>
      )}
    </div>
  );
}

// —— Player join (name or anonymous) ——
function PlayerJoinForm({
  roomId,
  socket,
  onJoined,
}: {
  roomId: string;
  socket: Socket | null;
  onJoined: () => void;
}) {
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [funny, setFunny] = useState(() => randomFunnyName());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket?.connected) return;
    const playerId = generatePlayerId();
    const displayName = anonymous ? funny : name.trim() || funny;
    savePlayerIdentity(roomId, playerId, displayName, anonymous);
    socket.emit('room:join', {
      roomId,
      role: 'player',
      playerId,
      displayName,
      isAnonymous: anonymous,
    });
    onJoined();
  };

  return (
    <div style={{ padding: 24, maxWidth: 400, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 16px', fontSize: 22 }}>Join trivia room</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Display name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="join-page__input"
          style={{ width: '100%', marginBottom: 12 }}
          disabled={anonymous}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => {
              setAnonymous(e.target.checked);
              if (e.target.checked) setFunny(randomFunnyName());
            }}
          />
          Join anonymously
        </label>
        {anonymous && (
          <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--text-muted)' }}>
            You’ll appear as: <strong>{funny}</strong>{' '}
            <button type="button" onClick={() => setFunny(randomFunnyName())} style={{ fontSize: 12 }}>
              Regenerate
            </button>
          </p>
        )}
        <button type="submit" className="join-page__btn" disabled={!socket?.connected}>
          Join room
        </button>
      </form>
    </div>
  );
}

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get('role') || 'player') as Role;
  const identity = getStoredPlayerIdentity();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [snapshot, setSnapshot] = useState<RoomSnapshotPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerJoined, setPlayerJoined] = useState(false);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!roomId) return;
    const s = getSocket();
    setSocket(s);

    const onSnapshot = (payload: RoomSnapshotPayload) => setSnapshot(payload);
    const onError = (e: { message?: string }) => setError(e?.message || 'Room error');
    const onCreated = (data: { roomId: string; hostToken?: string }) => {
      if (data.hostToken) saveHostToken(data.roomId, data.hostToken);
    };

    s.on('room:snapshot', onSnapshot);
    s.on('room:error', onError);
    s.on('room:created', onCreated);

    if (!joinedRef.current) {
      joinedRef.current = true;
      if (role === 'host') {
        const hostToken = getStoredHostToken(roomId);
        s.emit('room:join', { roomId, role, hostToken });
      } else if (role === 'player') {
        const identity = getStoredPlayerIdentity();
        if (identity?.roomId === roomId && identity?.playerId) {
          s.emit('room:join', {
            roomId,
            role,
            playerId: identity.playerId,
            displayName: identity.displayName,
            isAnonymous: identity.isAnonymous,
          });
        }
      } else {
        s.emit('room:join', { roomId, role });
      }
    }

    return () => {
      s.off('room:snapshot', onSnapshot);
      s.off('room:error', onError);
      s.off('room:created', onCreated);
    };
  }, [roomId, role]);

  if (!roomId) {
    return (
      <div style={{ padding: 24 }}>
        <p>Missing room ID.</p>
        <a href="/">Go home</a>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <p>{error}</p>
        <a href="/">Go home</a>
      </div>
    );
  }

  const playerNeedsJoin = role === 'player' && (!identity || identity.roomId !== roomId);

  if (playerNeedsJoin && !snapshot && !playerJoined) {
    return (
      <PlayerJoinForm
        roomId={roomId}
        socket={socket}
        onJoined={() => setPlayerJoined(true)}
      />
    );
  }

  if (!snapshot) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>Connecting to room…</p>
      </div>
    );
  }

  const { room, players, currentQuestion, responsesCount, leaderboardTop, pack } = snapshot;

  if (role === 'host') {
    return (
      <HostPanel
        room={room}
        players={players}
        currentQuestion={currentQuestion}
        responsesCount={responsesCount}
        leaderboardTop={leaderboardTop}
        pack={pack}
        socket={socket}
        roomId={roomId}
      />
    );
  }
  if (role === 'display') {
    return (
      <DisplayPanel
        room={room}
        currentQuestion={currentQuestion}
        pack={pack}
      />
    );
  }
  return (
    <PlayerPanel
      room={room}
      currentQuestion={currentQuestion}
      pack={pack}
      socket={socket}
      roomId={roomId}
    />
  );
}
