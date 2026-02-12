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
import { TimerPill } from '../components/trivia-room';
import { StandbyCard } from '../components/StandbyCard';
import { GameShell } from '../components/GameShell';
import type { ThemeId } from '../theme/theme.types';
import { getMarketMatchItem } from '../data/marketMatchDataset';
import { getBoard, getQuestion } from '../data/crowdControlTriviaDataset';
import { PlayerLayout, TextAnswerInput } from '../components/PlayerLayout';
import { FeudPlayerReveal } from '../games/feud/FeudPlayerReveal';
import '../styles/join.css';

/**
 * Trivia player view: current question, multiple choice or text answer, then correct answer when revealed.
 */

function TriviaPlayerView({
  eventConfig,
  gameTitle,
  gameTypeLabel,
  currentIndex,
  totalQuestions,
  currentQuestion,
  correctAnswer,
  options,
  revealed,
  socket,
  code,
  questionStartAt,
  timeLimitSec,
  leaderboardsVisibleToPlayers = true,
  scores,
  finalWagerEnabled = false,
}: {
  eventConfig: { gameTitle?: string; venueName?: string; logoUrl?: string | null; [key: string]: unknown };
  gameTitle: string;
  gameTypeLabel: string;
  currentIndex: number;
  totalQuestions: number;
  currentQuestion?: string;
  correctAnswer?: string;
  options?: string[];
  revealed: boolean;
  socket: Socket | null;
  code: string;
  questionStartAt?: string | null;
  timeLimitSec?: number;
  leaderboardsVisibleToPlayers?: boolean;
  scores?: Record<string, number>;
  finalWagerEnabled?: boolean;
}) {
  const [myAnswer, setMyAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [wager, setWager] = useState<number>(0);
  const isLastQuestion = totalQuestions > 0 && currentIndex === totalQuestions - 1;
  const wagerCap = 10;
  useEffect(() => {
    setMyAnswer('');
    setSelectedOption(null);
    setLocked(false);
    setWager(0);
  }, [currentIndex]);

  const emitAnswer = (answer: string, wagerPts?: number) => {
    if (!socket || !code.trim()) return;
    const payload: { code: string; questionIndex: number; answer: string; wager?: number } = {
      code: code.trim().toUpperCase(),
      questionIndex: currentIndex,
      answer,
    };
    if (isLastQuestion && finalWagerEnabled && (wagerPts ?? wager) > 0) {
      payload.wager = Math.min(wagerCap, wagerPts ?? wager);
    }
    socket.emit('player:trivia-answer', payload);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && code.trim() && (myAnswer.trim() || selectedOption != null)) {
      const answer = selectedOption != null ? selectedOption : myAnswer.trim();
      emitAnswer(answer);
      if (options?.length) setLocked(true);
      else setLocked(true);
    }
  };

  const handleSelectOption = (opt: string) => {
    if (revealed || locked) return;
    setSelectedOption(opt);
    emitAnswer(opt);
    setLocked(true);
  };

  const hasOptions = Array.isArray(options) && options.length > 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GameViewHeader config={eventConfig} gameTypeLabel={gameTypeLabel} />
      <div style={{ padding: 24, flex: 1 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, color: 'var(--text-muted)' }}>{gameTitle}</h2>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          Question {currentIndex + 1} of {totalQuestions || 1}
          {!revealed && questionStartAt != null && (timeLimitSec ?? 0) > 0 && (
            <TimerPill questionStartAt={questionStartAt} timeLimitSec={timeLimitSec ?? 30} active />
          )}
        </p>
        {currentQuestion ? (
          <>
            {!revealed && isLastQuestion && finalWagerEnabled && (
              <div style={{ marginBottom: 16, padding: 12, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Final wager (optional, max {wagerCap} pts)</label>
                <input
                  type="number"
                  min={0}
                  max={wagerCap}
                  value={wager || ''}
                  onChange={(e) => setWager(Math.max(0, Math.min(wagerCap, parseInt(e.target.value, 10) || 0)))}
                  className="join-page__input"
                  style={{ width: 80 }}
                  placeholder="0"
                />
              </div>
            )}
            <p style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 600, lineHeight: 1.4 }}>{currentQuestion}</p>
            {!revealed ? (
              hasOptions ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
                  {options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className="join-page__btn"
                      style={{
                        minHeight: 48,
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        background: selectedOption === opt ? 'var(--accent)' : 'var(--surface)',
                      }}
                      onClick={() => handleSelectOption(opt)}
                      disabled={locked}
                    >
                      {opt} {locked && selectedOption === opt ? ' ✓' : ''}
                    </button>
                  ))}
                </div>
              ) : (
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
              )
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
        {leaderboardsVisibleToPlayers && scores && Object.keys(scores).length > 0 && (
          <div style={{ marginTop: 24, padding: 16, background: 'var(--surface)', borderRadius: 12 }}>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--text-muted)' }}>Scores</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(scores)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([id, score]) => (
                  <span key={id} style={{ fontWeight: 600 }}>{score} pts</span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const PLAYROOM_JOIN_KEY = (c: string) => `playroom_join_${c.trim().toUpperCase()}`;

/** 2–3 part names for anonymous players so there is always a verifiable display name */
const FUNNY_NAMES = [
  'Breezy Otter', 'Cosmic Pretzel Wizard', 'Salty Marshmallow', 'Dapper Penguin',
  'Cheerful Llama', 'Velvet Thunder', 'Silly Goose', 'Brave Potato', 'Mystic Muffin',
  'Happy Walrus', 'Clever Koala', 'Swift Sparrow', 'Calm Badger', 'Bold Falcon',
  'Gentle Moose', 'Wise Owl', 'Lucky Clover', 'Stellar Panda', 'Jolly Raccoon',
];
function randomFunnyName(): string {
  return FUNNY_NAMES[Math.floor(Math.random() * FUNNY_NAMES.length)];
}

/**
 * Join routing: /join/:code and /player/:code both render Play.
 * Session is resolved on join:ok (gameType, feud, etc.); we branch on gameType to show the correct game view (e.g. feud -> Survey Showdown player).
 * Rejoin after refresh: stored session triggers player:join; join:ok again supplies gameType so the same view is shown.
 */
function getGameTypeLabel(gameType: string | undefined): string {
  if (!gameType) return 'Game';
  switch (gameType) {
    case 'music-bingo': return 'Music Bingo';
    case 'classic-bingo': return 'Classic Bingo';
    case 'trivia': return 'Trivia';
    case 'icebreakers': return 'Icebreakers';
    case 'edutainment': return 'Edutainment';
    case 'team-building': return 'Team Building';
    case 'feud': return 'Survey Showdown';
    case 'market-match': return 'Market Match';
    case 'crowd-control-trivia': return 'Crowd Control Trivia';
    case 'estimation': return 'Estimation Show';
    case 'jeopardy': return 'Category Grid';
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
    /** Playroom skin (classic, prestige-retro, retro-studio, retro-arcade) for session theme */
    playroomThemeId?: string;
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
  /** When true, host is reviewing/backed up; show standby message (Activity Room spec §10) */
  standby?: boolean;
  /** Feud (Survey Showdown) state when gameType === 'feud' */
  feud?: import('../types/feud').FeudState;
  /** Market Match state when gameType === 'market-match' */
  marketMatch?: { currentIndex: number; revealed: boolean };
  /** Crowd Control Trivia state when gameType === 'crowd-control-trivia' */
  crowdControl?: import('../types/crowdControlTrivia').CrowdControlState;
  /** Trivia: current question index, questions list (with optional options for MC), and whether answer is revealed */
  trivia?: {
    currentIndex: number;
    questions: { question: string; correctAnswer?: string; options?: string[] }[];
    revealed?: boolean;
    settings?: { leaderboardsVisibleToPlayers?: boolean };
    questionStartAt?: string | null;
    timeLimitSec?: number;
    scores?: Record<string, number>;
    finalWagerEnabled?: boolean;
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
  const [feudSubmittedThisRound, setFeudSubmittedThisRound] = useState(false);
  const hasRejoinEmitted = useRef(false);
  const rejoinRef = useRef<{ code: string; name: string } | null>(null);
  rejoinRef.current = joinState && code?.trim() ? { code: code.trim().toUpperCase(), name: (() => { try { const raw = sessionStorage.getItem(PLAYROOM_JOIN_KEY(code)); if (raw) { const p = JSON.parse(raw) as { name?: string }; return p.name || name || 'Anonymous'; } } catch { } return name || 'Anonymous'; })() } : null;

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
    const onConnect = () => {
      setSocketConnected(true);
      const r = rejoinRef.current;
      if (r) {
        s.emit('player:join', { code: r.code, name: r.name });
        if (import.meta.env?.DEV) console.log('[Play] Re-joined room on connect', r.code);
      }
    };
    s.on('connect', onConnect);
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

    s.on('game:trivia-state', (payload: { currentIndex?: number; questions?: { question: string; correctAnswer?: string; options?: string[] }[]; revealed?: boolean; settings?: { leaderboardsVisibleToPlayers?: boolean }; questionStartAt?: string | null; timeLimitSec?: number; scores?: Record<string, number>; finalWagerEnabled?: boolean }) => {
      if (!payload || typeof payload !== 'object') return;
      setJoinState((prev) => {
        if (!prev) return null;
        const trivia = {
          currentIndex: payload.currentIndex ?? prev.trivia?.currentIndex ?? 0,
          questions: payload.questions ?? prev.trivia?.questions ?? [],
          revealed: payload.revealed ?? prev.trivia?.revealed,
          settings: payload.settings ?? prev.trivia?.settings,
          questionStartAt: payload.questionStartAt ?? prev.trivia?.questionStartAt,
          timeLimitSec: payload.timeLimitSec ?? prev.trivia?.timeLimitSec,
          scores: payload.scores ?? prev.trivia?.scores,
          finalWagerEnabled: payload.finalWagerEnabled ?? prev.trivia?.finalWagerEnabled,
        };
        return { ...prev, trivia };
      });
    });

    s.on('game:trivia-reveal', (payload: { questionIndex?: number; correctAnswer?: string; scores?: Record<string, number> }) => {
      setJoinState((prev) => {
        if (!prev?.trivia) return prev;
        const idx = payload.questionIndex ?? prev.trivia.currentIndex ?? 0;
        const questions = [...(prev.trivia.questions || [])];
        if (questions[idx] != null && payload.correctAnswer !== undefined) {
          questions[idx] = { ...questions[idx], correctAnswer: payload.correctAnswer };
        }
        return { ...prev, trivia: { ...prev.trivia, questions, revealed: true } };
      });
    });

    s.on('feud:state', (payload: import('../types/feud').FeudState) => {
      if (import.meta.env?.DEV) console.log('[Play] feud:state', { submissions: payload?.submissions?.length ?? 0, topAnswers: payload?.topAnswers?.length ?? 0 });
      setJoinState((prev) => (prev ? { ...prev, feud: payload } : null));
    });
    s.on('market-match:state', (payload: { currentIndex?: number; revealed?: boolean }) => {
      setJoinState((prev) => (prev ? { ...prev, marketMatch: { currentIndex: payload.currentIndex ?? prev.marketMatch?.currentIndex ?? 0, revealed: payload.revealed ?? prev.marketMatch?.revealed ?? false } } : null));
    });
    s.on('cct:state', (payload: import('../types/crowdControlTrivia').CrowdControlState) => {
      setJoinState((prev) => (prev ? { ...prev, crowdControl: payload } : null));
    });

    return () => {
      s.off('connect', onConnect);
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
      s.off('feud:state');
      s.off('market-match:state');
      s.off('cct:state');
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
    const cid = joinState?.feud?.checkpointId;
    if (cid === 'R1_TITLE' || cid === 'STANDBY') setFeudSubmittedThisRound(false);
  }, [joinState?.feud?.checkpointId]);

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
    const displayName = name.trim() || randomFunnyName();
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

  // Standby: host is reviewing / backed up (Activity Room spec §10)
  if (joinState?.started && joinState?.standby) {
    return (
      <div className="join-welcome" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <StandbyCard />
      </div>
    );
  }

  // Survey Showdown (feud): show game view when round is in progress (collecting/locked/reveal/summary), even before game "started"
  const feudRoundActive =
    gameType === 'feud' &&
    joinState?.feud &&
    joinState.feud.checkpointId !== 'STANDBY';
  const sessionThemeId = (joinState?.eventConfig?.playroomThemeId && ['classic', 'prestige-retro', 'retro-studio', 'retro-arcade', 'game-show'].includes(joinState.eventConfig.playroomThemeId))
    ? (joinState.eventConfig.playroomThemeId as ThemeId)
    : undefined;
  if (gameType === 'feud' && joinState?.feud && (joinState.started || feudRoundActive)) {
    const feud = joinState.feud;
    const canSubmit = !feud.locked && (feud.checkpointId === 'R1_COLLECT' || feud.checkpointId === 'R1_TITLE');
    const showReveal = feud.locked || feud.checkpointId.startsWith('R1_BOARD_') || feud.checkpointId === 'R1_SUMMARY';
    const showWaiting = canSubmit && feudSubmittedThisRound;
    const submissionCount = feud.submissions?.length ?? 0;
    const liveAnswers: string[] = [];
    (feud.submissions ?? []).forEach((s) => {
      (s.answers ?? []).forEach((a) => {
        const t = (a || '').trim();
        if (t) liveAnswers.push(t);
      });
    });

    const handleFeudSubmit = (answers: string[]) => {
      if (socket && code) {
        socket.emit('feud:submit', { code: code.toUpperCase(), answers });
        setFeudSubmittedThisRound(true);
      }
    };

    const miniStage = showReveal ? (
      <FeudPlayerReveal feud={feud} />
    ) : showWaiting ? (
      <div className="feud-player-waiting" style={{ padding: 16, maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--pr-text)' }}>Answers still coming in</h2>
        <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--pr-muted)' }}>
          {submissionCount} player{submissionCount !== 1 ? 's' : ''} have answered
        </p>
        {liveAnswers.length > 0 && (
          <ul style={{ margin: 0, padding: 12, listStyle: 'none', textAlign: 'left', border: '1px solid var(--pr-border)', borderRadius: 12, background: 'rgba(0,0,0,0.15)', maxHeight: 200, overflowY: 'auto' }}>
            {liveAnswers.slice(-24).map((a, i) => (
              <li key={`${i}-${a}`} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--pr-text)', fontSize: 14 }}>
                {a}
              </li>
            ))}
          </ul>
        )}
      </div>
    ) : (
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--pr-text)' }}>{feud.prompt || 'Submit your answers'}</h2>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--pr-muted)' }}>
          {feud.checkpointId === 'R1_COLLECT' ? 'Round collecting' : 'Round in progress'}
        </p>
      </div>
    );

    const inputSlot = showReveal ? (
      <p style={{ margin: 0, color: 'var(--pr-muted)', fontWeight: 500 }}>Watch the screen for the reveal!</p>
    ) : showWaiting ? (
      <p style={{ margin: 0, color: 'var(--pr-muted)', fontWeight: 500 }}>Your answers are in. Answers still coming in.</p>
    ) : canSubmit ? (
      <TextAnswerInput onSubmit={handleFeudSubmit} maxFields={3} placeholder="Answer" submitLabel="Submit" disabled={!socket} />
    ) : (
      <p style={{ margin: 0, color: 'var(--pr-muted)' }}>Wait for the host to show the question.</p>
    );

    return (
      <GameShell
        gameKey="survey_showdown"
        variant="player"
        title="Survey Showdown"
        subtitle={feud.prompt ? undefined : showWaiting ? 'Answers still coming in' : 'Submit your answers'}
        code={code ?? undefined}
        themeId={sessionThemeId}
      >
        <PlayerLayout stage={miniStage} input={inputSlot} />
      </GameShell>
    );
  }

  // Market Match: show game view when we have state (host may not use Waiting room tab)
  if (gameType === 'market-match' && joinState?.marketMatch) {
    const item = getMarketMatchItem(joinState.marketMatch.currentIndex ?? 0);
    const revealed = joinState.marketMatch.revealed === true;
    return (
      <GameShell
        gameKey="market_match"
        variant="player"
        title="Market Match"
        subtitle={item ? `What did it cost in ${item.year}?` : undefined}
        code={code ?? undefined}
        themeId={sessionThemeId}
      >
        <div style={{ padding: 24, maxWidth: 420, margin: '0 auto' }}>
          {item ? (
            <>
              <h2 style={{ margin: '0 0 12px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--pr-text)' }}>
                {item.title}
              </h2>
              <p style={{ margin: 0, color: 'var(--pr-muted)' }}>
                What did it cost in {item.year}? ({item.unit})
              </p>
              {revealed ? (
                <p style={{ marginTop: 16, padding: 12, background: 'var(--pr-surface2)', borderRadius: 8, fontWeight: 600, color: 'var(--pr-brand)' }}>
                  ${item.priceUsd.toFixed(2)} {item.unit}
                </p>
              ) : (
                <p style={{ marginTop: 16, color: 'var(--pr-muted)', fontSize: 14 }}>Watch the screen for the reveal.</p>
              )}
            </>
          ) : (
            <p style={{ color: 'var(--pr-muted)' }}>Host will pick an item.</p>
          )}
        </div>
      </GameShell>
    );
  }

  // Crowd Control Trivia: show game view when we have state (host may not use Waiting room tab); full vote + question UI
  if (gameType === 'crowd-control-trivia' && joinState?.crowdControl) {
    const cct = joinState.crowdControl;
    const phase = cct.phase ?? 'board';
    const board = getBoard(cct.boardId ?? 0);
    const question = getQuestion(cct.currentQuestionId ?? null);
    const revealed = cct.revealed === true;
    const vote = (categoryIndex: number) => {
      if (socket && code) socket.emit('cct:vote', { code: code.toUpperCase(), categoryIndex });
    };
    return (
      <GameShell
        gameKey="crowd_control_trivia"
        variant="player"
        title="Crowd Control Trivia"
        subtitle={phase === 'vote' ? 'Pick the next category' : phase === 'question' || phase === 'reveal' ? (question?.prompt ? 'Answer on screen' : undefined) : undefined}
        code={code ?? undefined}
        themeId={sessionThemeId}
      >
        <div style={{ padding: 24, maxWidth: 420, margin: '0 auto' }}>
          {phase === 'vote' && board && (
              <>
                <p style={{ margin: '0 0 16px', fontSize: 15, color: 'var(--pr-text)' }}>Vote for the next category:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(board.categories ?? []).map((cat, i) => {
                    const used = (cct.usedSlots ?? [0,0,0,0,0,0])[i] ?? 0;
                    const disabled = used >= 5;
                    return (
                      <button
                        key={i}
                        type="button"
                        className="join-page__btn"
                        onClick={() => vote(i)}
                        disabled={disabled}
                        style={{ width: '100%' }}
                      >
                        {cat} {disabled ? '(done)' : `(${cct.voteCounts?.[i] ?? 0} votes)`}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {(phase === 'question' || phase === 'reveal') && question && (
              <>
                <h2 style={{ margin: '0 0 16px', fontSize: '1.2rem', fontWeight: 600, color: 'var(--pr-text)' }}>
                  {question.prompt}
                </h2>
                {!revealed && question.options && question.options.length > 0 && (
                  <ul style={{ margin: '0 0 16px', paddingLeft: 20 }}>
                    {question.options.map((opt, i) => (
                      <li key={i} style={{ marginBottom: 6 }}>{opt}</li>
                    ))}
                  </ul>
                )}
                {!revealed && <p style={{ margin: 0, color: 'var(--pr-muted)', fontSize: 14 }}>Watch the screen for the reveal.</p>}
                {revealed && (
                  <div style={{ marginTop: 16, padding: 16, background: 'var(--pr-surface2)', borderRadius: 8 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--pr-brand)' }}>{question.correctAnswer}</p>
                    {question.explanation && (
                      <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--pr-muted)' }}>{question.explanation}</p>
                    )}
                  </div>
                )}
              </>
            )}
          {phase === 'board' && (
            <p style={{ margin: 0, color: 'var(--pr-muted)' }}>Wait for the host to open category vote.</p>
          )}
        </div>
      </GameShell>
    );
  }

  // Waiting room: show until host starts (skip for feud / market-match / crowd-control when already in game — handled above)
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

  // Trivia (Crowd Control Trivia; icebreakers, edutainment, team-building use same flow)
  if (joinState?.started && (gameType === 'trivia' || gameType === 'icebreakers' || gameType === 'edutainment' || gameType === 'team-building')) {
    const trivia = joinState.trivia;
    const questions = trivia?.questions ?? [];
    const currentIndex = trivia?.currentIndex ?? 0;
    const revealed = trivia?.revealed === true;
    const currentQ = questions[currentIndex];
    return (
      <GameShell
        gameKey="crowd_control_trivia"
        variant="player"
        title={joinState?.eventConfig?.gameTitle || gameTypeLabel}
        subtitle={`Question ${currentIndex + 1} of ${questions.length || 1}`}
        code={code ?? undefined}
        themeId={sessionThemeId}
      >
        <TriviaPlayerView
          eventConfig={joinState.eventConfig}
          gameTitle={joinState?.eventConfig?.gameTitle || gameTypeLabel}
          gameTypeLabel={gameTypeLabel}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          currentQuestion={currentQ?.question}
          correctAnswer={currentQ?.correctAnswer}
          options={currentQ?.options}
          revealed={revealed}
          socket={socket}
          code={code ?? ''}
          questionStartAt={trivia?.questionStartAt}
          timeLimitSec={trivia?.timeLimitSec}
          leaderboardsVisibleToPlayers={trivia?.settings?.leaderboardsVisibleToPlayers !== false}
          scores={trivia?.scores}
          finalWagerEnabled={trivia?.finalWagerEnabled === true}
        />
      </GameShell>
    );
  }

  // Estimation Show / Category Grid: placeholder
  if (gameType === 'estimation' || gameType === 'jeopardy') {
    const title = gameType === 'estimation' ? 'Estimation Show' : 'Category Grid';
    return (
      <GameShell
        gameKey="market_match"
        variant="player"
        title={title}
        code={code ?? undefined}
        themeId={sessionThemeId}
      >
        <div style={{ padding: 24, textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px', color: 'var(--pr-text)' }}>{title}</h2>
          <p style={{ margin: 0, color: 'var(--pr-muted)' }}>This game type is coming soon. You are in the room; full gameplay will be available in a future update.</p>
        </div>
      </GameShell>
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
