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

const PLAYROOM_JOIN_KEY = (c: string) => `playroom_join_${c.trim().toUpperCase()}`;

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
  const hasRejoinEmitted = useRef(false);

  // Restore session so refresh keeps player in the same room
  useEffect(() => {
    if (!code?.trim()) return;
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

    s.on('join:ok', (payload: JoinState) => {
      setJoinState(payload);
      setJoined(true);
      setRejoining(false);
      setError('');
    });

    s.on('join:error', (payload: { message?: string }) => {
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

    s.on('game:revealed', ({ revealed: rev }: { revealed: Song[] }) => {
      setJoinState((prev) => (prev ? { ...prev, revealed: rev } : null));
    });

    return () => {
      s.off('join:ok');
      s.off('join:error');
      s.off('game:started');
      s.off('game:waiting-room-updated');
      s.off('game:event-config-updated');
      s.off('game:roll-call-leaderboard');
      s.off('game:songs-updated');
      s.off('game:revealed');
    };
  }, [code]);

  // Rejoin with stored session on refresh
  useEffect(() => {
    if (!code?.trim() || !rejoining || !socket?.connected || hasRejoinEmitted.current) return;
    try {
      const raw = sessionStorage.getItem(PLAYROOM_JOIN_KEY(code));
      if (!raw) return;
      const { name: n } = JSON.parse(raw);
      hasRejoinEmitted.current = true;
      socket.emit('player:join', { code: code.trim().toUpperCase(), name: n || 'Anonymous' });
    } catch {
      /* ignore */
    }
  }, [code, rejoining, socket?.connected, socket]);

  // Game-started state: compute once per render, hooks must run unconditionally (before any early return)
  const gameType = joinState?.gameType || 'music-bingo';
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
            <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Rejoining game…</p>
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
    const bingoLabel = gameType === 'classic-bingo' ? 'Classic Bingo' : 'Music Bingo';
    return (
      <>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
          <GameViewHeader
            config={joinState.eventConfig}
            gameTypeLabel={bingoLabel}
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

  // Trivia: show header with game type and answer prompt
  if (joinState?.started && gameType === 'trivia') {
    return (
      <>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
          <GameViewHeader config={joinState.eventConfig} gameTypeLabel="Trivia" />
          <div style={{ padding: 24, flex: 1 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>{joinState?.eventConfig?.gameTitle || 'Trivia'}</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>The game has started. Answer on your phone.</p>
          </div>
        </div>
      </>
    );
  }

  // Other / unknown game type
  const fallbackLabel = joinState?.gameType ? joinState.gameType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Game';
  return (
    <div style={{ padding: 24, minHeight: '100vh', background: 'var(--bg)' }}>
      <GameViewHeader config={joinState?.eventConfig} gameTypeLabel={fallbackLabel} />
      <div style={{ padding: '24px 0' }}>
        <h2 style={{ margin: '0 0 8px' }}>{joinState?.eventConfig?.gameTitle || fallbackLabel}</h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>The game has started.</p>
      </div>
    </div>
  );
}
