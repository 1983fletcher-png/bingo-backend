import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import WaitingRoomView from '../components/WaitingRoomView';
import PlayerBingoCard from '../components/PlayerBingoCard';
import GameViewHeader from '../components/GameViewHeader';
import SongFactPopUp from '../components/SongFactPopUp';
import { buildCardFromPool } from '../types/game';
import type { Song } from '../types/game';
import type { Socket } from 'socket.io-client';

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
  const [factSong, setFactSong] = useState<Song | null>(null);
  const [showFact, setShowFact] = useState(false);
  const [menuOverlay, setMenuOverlay] = useState<{ url: string; useIframe: boolean } | null>(null);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    s.on('join:ok', (payload: JoinState) => {
      setJoinState(payload);
      setJoined(true);
      setError('');
    });

    s.on('join:error', (payload: { message?: string }) => {
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
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!socket || !code?.trim() || !name.trim()) {
      setError('Enter a display name.');
      return;
    }
    socket.emit('player:join', { code: code.trim().toUpperCase(), name: name.trim() });
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
    return (
      <div style={{ padding: 24, maxWidth: 360, margin: '0 auto' }}>
        <h2>Join the game</h2>
        <p>Room: {code}</p>
        <form onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            style={{ width: '100%', padding: 10, marginBottom: 8 }}
          />
          {error && <p style={{ color: '#fc8181', fontSize: 14 }}>{error}</p>}
          <button type="submit" style={{ padding: '10px 20px' }}>
            Join
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

  // Music Bingo: show card and fact pop-up
  const gameType = joinState?.gameType || 'music-bingo';
  const songPool = joinState?.songPool || [];
  const revealed = joinState?.revealed || [];
  const card = useMemo(() => {
    if (!joinState?.started || (gameType !== 'music-bingo' && gameType !== 'classic-bingo') || songPool.length < 24 || !name) return null;
    return buildCardFromPool(songPool, joinState.code + name);
  }, [joinState?.started, joinState?.code, gameType, songPool, name]);

  useEffect(() => {
    if (socket && code && card) {
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

  const handleBingo = () => {
    if (socket && code) socket.emit('player:bingo', { code: code.toUpperCase() });
  };

  if ((gameType === 'music-bingo' || gameType === 'classic-bingo') && joinState?.started) {
    return (
      <>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
          <GameViewHeader
            config={joinState.eventConfig}
            onOpenMenu={(url, useIframe) => setMenuOverlay(useIframe ? { url, useIframe: true } : null)}
          />
          <PlayerBingoCard
            card={card || []}
            revealed={revealed}
            onBingo={handleBingo}
            winCondition={joinState.winCondition}
            eventTitle={joinState?.eventConfig?.gameTitle}
          />
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

  // Trivia or other: placeholder with header
  if (joinState?.started && gameType === 'trivia') {
    return (
      <>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
          <GameViewHeader config={joinState.eventConfig} />
          <div style={{ padding: 24, flex: 1 }}>
            <h2>{joinState?.eventConfig?.gameTitle || 'Trivia'}</h2>
            <p>The game has started. Answer on your phone.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>{joinState?.eventConfig?.gameTitle || 'Game'}</h2>
      <p>The game has started.</p>
    </div>
  );
}
