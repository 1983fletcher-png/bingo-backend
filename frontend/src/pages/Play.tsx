import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import WaitingRoomView from '../components/WaitingRoomView';
import type { Socket } from 'socket.io-client';

interface JoinState {
  code: string;
  started: boolean;
  eventConfig: { gameTitle?: string };
  waitingRoom: { game: 'roll-call' | null; theme: string; hostMessage: string };
  rollCallLeaderboard: { playerId: string; displayName: string; bestTimeMs: number }[];
}

export default function Play() {
  const { code } = useParams<{ code: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [joinState, setJoinState] = useState<JoinState | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    s.on('join:ok', (payload: JoinState) => {
      setJoinState(payload);
      setJoined(true);
      setError('');
    });

    s.on('game:started', () => {
      setJoinState((prev) => (prev ? { ...prev, started: true } : null));
    });

    s.on('game:waiting-room-updated', ({ waitingRoom }: { waitingRoom: JoinState['waitingRoom'] }) => {
      setJoinState((prev) => (prev ? { ...prev, waitingRoom } : null));
    });

    s.on('game:roll-call-leaderboard', ({ leaderboard }: { leaderboard: JoinState['rollCallLeaderboard'] }) => {
      setJoinState((prev) => (prev ? { ...prev, rollCallLeaderboard: leaderboard } : null));
    });

    return () => {
      s.off('join:ok');
      s.off('game:started');
      s.off('game:waiting-room-updated');
      s.off('game:roll-call-leaderboard');
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
        rollCallLeaderboard={joinState.rollCallLeaderboard || []}
        onRollCallWin={handleRollCallWin}
      />
    );
  }

  // Main event started (placeholder for bingo/trivia UI)
  return (
    <div style={{ padding: 24 }}>
      <h2>{joinState?.eventConfig?.gameTitle || 'Game'}</h2>
      <p>The game has started. (Bingo / Trivia UI would go here.)</p>
    </div>
  );
}
