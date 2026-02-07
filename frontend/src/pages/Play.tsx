import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import WaitingRoomView from '../components/WaitingRoomView';
import PlayerBingoCard from '../components/PlayerBingoCard';
import GameViewHeader from '../components/GameViewHeader';
import SongFactPopUp from '../components/SongFactPopUp';
import { buildCardFromPool } from '../types/game';
import type { Song } from '../types/game';
import type { Socket } from 'socket.io-client';
import '../styles/join.css';

/**
 * Trivia player view: current question, answer input, then correct answer when revealed. Synced with display.
 * TODO (future): Support multiple answer types per question — not just text input. Add multiple choice, single-select,
 * true/false, etc., depending on question type so hosts can use the right format for training and quizzes.
 */
function TriviaPlayerView({
  eventConfig,
  gameTitle,
  gameTypeLabel,
  currentIndex,
  totalQuestions,
  currentQuestion,
  correctAnswer,
  revealed,
  socket,
  code,
}: {
  eventConfig: { gameTitle?: string; venueName?: string; logoUrl?: string | null; [key: string]: unknown };
  gameTitle: string;
  gameTypeLabel: string;
  currentIndex: number;
  totalQuestions: number;
  currentQuestion?: string;
  correctAnswer?: string;
  revealed: boolean;
  socket: Socket | null;
  code: string;
}) {
  const [myAnswer, setMyAnswer] = useState('');
  useEffect(() => {
    setMyAnswer('');
  }, [currentIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && code.trim() && myAnswer.trim()) {
      socket.emit('player:trivia-answer', { code: code.trim().toUpperCase(), questionIndex: currentIndex, answer: myAnswer.trim() });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GameViewHeader config={eventConfig} gameTypeLabel={gameTypeLabel} />
      <div style={{ padding: 24, flex: 1 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, color: 'var(--text-muted)' }}>{gameTitle}</h2>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-muted)' }}>
          Question {currentIndex + 1} of {totalQuestions || 1}
        </p>
        {currentQuestion ? (
          <>
            <p style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 600, lineHeight: 1.4 }}>{currentQuestion}</p>
            {!revealed ? (
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Your answer"
                  value={myAnswer}
                  onChange={(e) => setMyAnswer(e.target.value)}
                  className="join-page__input"
                  style={{ marginBottom: 12, width: '100%', maxWidth: 400 }}
                  autoComplete="off"
                />
                <button type="submit" className="join-page__btn" disabled={!myAnswer.trim() || !socket}>
                  Submit answer
                </button>
              </form>
            ) : (
              <div style={{ padding: '16px 20px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Correct answer</p>
                <p style={{ margin: '8px 0 0', fontSize: 18, fontWeight: 600 }}>{correctAnswer ?? '—'}</p>
              </div>
            )}
          </>
        ) : (
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>The game has started. Waiting for the next question…</p>
        )}
      </div>
    </div>
  );
}

const PLAYROOM_JOIN_KEY = (c: string) => `playroom_join_${c.trim().toUpperCase()}`;

/** Map server gameType to the label shown in the player header (which room we're in). */
function getGameTypeLabel(gameType: string | undefined): string {
  if (!gameType) return 'Game';
  switch (gameType) {
    case 'music-bingo': return 'Music Bingo';
    case 'classic-bingo': return 'Classic Bingo';
    case 'trivia': return 'Trivia';
    case 'icebreakers': return 'Icebreakers';
    case 'edutainment': return 'Edutainment';
    case 'team-building': return 'Team Building';
    default: return gameType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

interface JoinState {
  code: string;
  started: boolean;
  eventConfig: {
    gameTitle?: string;
    venueName?: string;
    logoUrl?: string | null;
    drinkSpecials?: string;
    foodSpecials?: string;
    foodMenuUrl?: string;
    drinkMenuUrl?: string;
    eventsUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    welcomeTitle?: string;
    welcomeMessage?: string;
    venueAllowedUseOfMenuDesign?: boolean;
  };
  waitingRoom: {
    game: 'roll-call' | null;
    theme: string;
    hostMessage: string;
    stretchyImageSource?: 'playroom' | 'venue-logo' | 'custom';
    stretchyImageUrl?: string | null;
  };
  rollCallLeaderboard: { playerId: string; displayName: string; bestTimeMs: number }[];
  songPool?: Song[];
  revealed?: Song[];
  gameType?: string;
  freeSpace?: boolean;
  winCondition?: string;
  /** Trivia: current question index, questions list, and whether answer is revealed */
  trivia?: {
    currentIndex: number;
    questions: { question: string; correctAnswer?: string }[];
    revealed?: boolean;
  };
}

export default function Play() {
  const { code } = useParams<{ code: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [joinState, setJoinState] = useState<JoinState | null>(null);
  const [error, setError] = useState('');
  const [rejoining, setRejoining] = useState(false);
  const [factSong, setFactSong] = useState<Song | null>(null);
  const [showFact, setShowFact] = useState(false);
  const [menuOverlay, setMenuOverlay] = useState<{ url: string; useIframe: boolean } | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const hasRejoinEmitted = useRef(false);

  // Restore session so refresh keeps player in the same room
  useEffect(() => {
    if (!code?.trim()) return;
    hasRejoinEmitted.current = false;
    const key = PLAYROOM_JOIN_KEY(code);
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const { name: storedName } = JSON.parse(raw);
        setName(storedName || 'Anonymous');
        setRejoining(true);
      }
    } catch {
      /* ignore */
    }
  }, [code]);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);
    setSocketConnected(s.connected);
    s.on('connect', () => setSocketConnected(true));
    s.on('disconnect', () => setSocketConnected(false));

    s.on('join:ok', (payload: JoinState) => {
      setJoinState(payload);
      setJoined(true);
      setRejoining(false);
      setError('');
    });

    s.on('join:error', (payload: { message?: string }) => {
      hasRejoinEmitted.current = false;
      if (code?.trim()) try { sessionStorage.removeItem(PLAYROOM_JOIN_KEY(code)); } catch { /* ignore */ }
      setRejoining(false);
      setError(payload?.message || 'Could not join. Check the code or try again.');
    });

    s.on('game:started', () => {
      setJoinState((prev) => (prev ? { ...prev, started: true } : null));
    });

    s.on('game:waiting-room-updated', ({ waitingRoom }: { waitingRoom: JoinState['waitingRoom'] }) => {
      setJoinState((prev) => (prev ? { ...prev, waitingRoom } : null));
    });

    s.on('game:event-config-updated', ({ eventConfig }: { eventConfig?: JoinState['eventConfig'] }) => {
      if (eventConfig) setJoinState((prev) => (prev ? { ...prev, eventConfig } : null));
    });

    s.on('game:roll-call-leaderboard', ({ leaderboard }: { leaderboard: JoinState['rollCallLeaderboard'] }) => {
      setJoinState((prev) => (prev ? { ...prev, rollCallLeaderboard: leaderboard } : null));
    });

    s.on('game:songs-updated', ({ songPool }: { songPool: Song[] }) => {
      setJoinState((prev) => (prev ? { ...prev, songPool } : null));
    });

    s.on('game:revealed', (payload: { revealed?: Song[] }) => {
      const rev = Array.isArray(payload?.revealed) ? payload.revealed : [];
      setJoinState((prev) => (prev ? { ...prev, revealed: rev } : null));
    });

    s.on('game:trivia-state', (payload: { currentIndex?: number; questions?: { question: string; correctAnswer?: string }[]; revealed?: boolean }) => {
      if (!payload || typeof payload !== 'object') return;
      setJoinState((prev) => {
        if (!prev) return null;
        const trivia = {
          currentIndex: payload.currentIndex ?? prev.trivia?.currentIndex ?? 0,
          questions: payload.questions ?? prev.trivia?.questions ?? [],
          revealed: payload.revealed ?? prev.trivia?.revealed,
        };
        return { ...prev, trivia };
      });
    });

    s.on('game:trivia-reveal', () => {
      setJoinState((prev) => {
        if (!prev?.trivia) return prev;
        return { ...prev, trivia: { ...prev.trivia, revealed: true } };
      });
    });

    return () => {
      s.off('connect');
      s.off('disconnect');
      s.off('join:ok');
      s.off('join:error');
      s.off('game:started');
      s.off('game:waiting-room-updated');
      s.off('game:event-config-updated');
      s.off('game:roll-call-leaderboard');
      s.off('game:songs-updated');
      s.off('game:revealed');
      s.off('game:trivia-state');
      s.off('game:trivia-reveal');
    };
  }, [code]);

  // Rejoin with stored session on refresh — run when socket connects so we don't get stuck on "Rejoining game…"
  useEffect(() => {
    if (!code?.trim() || !rejoining || !socketConnected || !socket || hasRejoinEmitted.current) return;
    try {
      const raw = sessionStorage.getItem(PLAYROOM_JOIN_KEY(code));
      if (!raw) return;
      const { name: n } = JSON.parse(raw);
      hasRejoinEmitted.current = true;
      socket.emit('player:join', { code: code.trim().toUpperCase(), name: n || 'Anonymous' });
    } catch {
      /* ignore */
    }
  }, [code, rejoining, socketConnected, socket]);

  // Game-started state: compute once per render, hooks must run unconditionally (before any early return)
  const gameType = joinState?.gameType;
  const gameTypeLabel = getGameTypeLabel(gameType);
  const songPool = joinState?.songPool ?? [];
  const revealed = joinState?.revealed ?? [];
  const displayName = name || 'Anonymous';
  const card = useMemo(() => {
    if (!joinState?.started || (gameType !== 'music-bingo' && gameType !== 'classic-bingo') || songPool.length < 24) return null;
    return buildCardFromPool(songPool, joinState!.code + displayName);
  }, [joinState?.started, joinState?.code, gameType, songPool, displayName]);

  useEffect(() => {
    if (socket && code && card && card.length > 0) {
      socket.emit('player:card', { code: code.toUpperCase(), card });
    }
  }, [socket, code, card]);

  useEffect(() => {
    if (revealed.length > 0) {
      const last = revealed[revealed.length - 1];
      setFactSong(last);
      setShowFact(true);
    }
  }, [revealed]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!socket || !code?.trim()) return;
    const displayName = name.trim() || 'Anonymous';
    setName(displayName);
    try {
      sessionStorage.setItem(PLAYROOM_JOIN_KEY(code), JSON.stringify({ name: displayName }));
    } catch {
      /* ignore */
    }
    socket.emit('player:join', { code: code.trim().toUpperCase(), name: displayName });
  };

  const handleRollCallWin = (timeMs: number) => {
    if (socket && code) socket.emit('player:roll-call-score', { code: code.toUpperCase(), timeMs });
  };

  if (!code) {
    return (
      <div style={{ padding: 24 }}>
        <p>Missing room code. Use the link from your host.</p>
      </div>
    );
  }

  if (!joined) {
    if (rejoining) {
      return (
        <div className="join-welcome">
          <div className="join-welcome__rejoining">
            <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
              {socketConnected ? 'Rejoining game…' : 'Connecting…'}
            </p>
            <p style={{ margin: '8px 0 0', color: 'var(--text-muted)' }}>Room: {code}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="join-welcome">
        <h1 className="join-welcome__title">Welcome</h1>
        <p className="join-welcome__intro">
          Enter your name (optional). You can join as an anonymous player and still play.
        </p>
        <p className="join-welcome__room">Room: {code}</p>
        <form onSubmit={handleJoin}>
          <input
            type="text"
            className="join-page__input"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            autoComplete="name"
          />
          {error && <p style={{ color: 'var(--error, #fc8181)', fontSize: 14, marginBottom: 16 }}>{error}</p>}
          <button type="submit" className="join-page__btn">
            Join game
          </button>
        </form>
      </div>
    );
  }

  // Waiting room: show until host starts
  if (joinState && !joinState.started) {
    return (
      <WaitingRoomView
        gameCode={joinState.code}
        eventTitle={joinState.eventConfig?.gameTitle || 'The Playroom'}
        waitingRoom={joinState.waitingRoom}
        eventConfig={joinState.eventConfig}
        rollCallLeaderboard={joinState.rollCallLeaderboard || []}
        onRollCallWin={handleRollCallWin}
      />
    );
  }

  const handleBingo = () => {
    if (socket && code) socket.emit('player:bingo', { code: code.toUpperCase() });
  };

  if ((gameType === 'music-bingo' || gameType === 'classic-bingo') && joinState?.started) {
    return (
      <>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
          <GameViewHeader
            config={joinState.eventConfig}
            gameTypeLabel={gameTypeLabel}
            onOpenMenu={(url, useIframe) => setMenuOverlay(useIframe ? { url, useIframe: true } : null)}
          />
          {card && card.length > 0 ? (
            <PlayerBingoCard
              card={card}
              revealed={revealed}
              onBingo={handleBingo}
              winCondition={joinState.winCondition}
              eventTitle={joinState?.eventConfig?.gameTitle}
            />
          ) : (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ margin: 0, fontSize: '1.125rem' }}>Preparing your card…</p>
              <p style={{ margin: '8px 0 0', fontSize: 14 }}>The game has started. Your card will appear in a moment.</p>
            </div>
          )}
        </div>
        {menuOverlay && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              <span style={{ fontWeight: 600 }}>Menu</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={menuOverlay.url} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', background: 'var(--accent)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Open in new tab</a>
                <button type="button" onClick={() => setMenuOverlay(null)} style={{ padding: '8px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Back to game</button>
              </div>
            </div>
            <iframe src={menuOverlay.url} title="Venue menu" style={{ flex: 1, width: '100%', border: 'none' }} />
          </div>
        )}
        <SongFactPopUp
          song={factSong}
          show={showFact}
          onDismiss={() => setShowFact(false)}
        />
      </>
    );
  }

  // Trivia (and trivia-based: icebreakers, edutainment, team-building use same flow; header shows actual game type from server)
  if (joinState?.started && (gameType === 'trivia' || gameType === 'icebreakers' || gameType === 'edutainment' || gameType === 'team-building')) {
    const trivia = joinState.trivia;
    const questions = trivia?.questions ?? [];
    const currentIndex = trivia?.currentIndex ?? 0;
    const revealed = trivia?.revealed === true;
    const currentQ = questions[currentIndex];
    return (
      <TriviaPlayerView
        eventConfig={joinState.eventConfig}
        gameTitle={joinState?.eventConfig?.gameTitle || gameTypeLabel}
        gameTypeLabel={gameTypeLabel}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        currentQuestion={currentQ?.question}
        correctAnswer={currentQ?.correctAnswer}
        revealed={revealed}
        socket={socket}
        code={code ?? ''}
      />
    );
  }

  // Other / unknown game type
  return (
    <div style={{ padding: 24, minHeight: '100vh', background: 'var(--bg)' }}>
      <GameViewHeader config={joinState?.eventConfig} gameTypeLabel={gameTypeLabel} />
      <div style={{ padding: '24px 0' }}>
        <h2 style={{ margin: '0 0 8px' }}>{joinState?.eventConfig?.gameTitle || gameTypeLabel}</h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>The game has started.</p>
      </div>
    </div>
  );
}
