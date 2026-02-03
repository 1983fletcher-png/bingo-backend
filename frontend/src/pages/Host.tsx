import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socket';
import type { Socket } from 'socket.io-client';

interface GameCreated {
  code: string;
  joinUrl: string;
  gameType: string;
  eventConfig: { gameTitle?: string };
  waitingRoom: { game: 'roll-call' | null; theme: string; hostMessage: string };
}

export default function Host() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [game, setGame] = useState<GameCreated | null>(null);
  const [hostMessage, setHostMessage] = useState('Starting soon…');

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));

    s.on('game:created', (payload: GameCreated) => {
      setGame(payload);
      setHostMessage(payload.waitingRoom?.hostMessage || 'Starting soon…');
    });

    s.on('game:waiting-room-updated', () => {});

    return () => {
      s.off('connect');
      s.off('disconnect');
      s.off('game:created');
      s.off('game:waiting-room-updated');
    };
  }, []);

  const createGame = () => {
    if (!socket) return;
    setGame(null);
    socket.emit('host:create', {
      baseUrl: window.location.origin,
      gameType: 'music-bingo',
      eventConfig: { gameTitle: 'The Playroom' },
    });
  };

  useEffect(() => {
    if (!socket || !game) return;
    socket.emit('host:set-waiting-room', {
      code: game.code,
      game: 'roll-call',
      theme: 'default',
      hostMessage,
    });
  }, [socket, game?.code, hostMessage]);

  const startEvent = () => {
    if (!socket || !game) return;
    socket.emit('host:start', { code: game.code });
  };

  if (!connected) {
    return (
      <div style={{ padding: 24 }}>
        <p>Connecting…</p>
        <p style={{ fontSize: 14, color: '#a0aec0' }}>
          Set <code>VITE_SOCKET_URL</code> to your backend URL in production.
        </p>
      </div>
    );
  }

  if (!game) {
    return (
      <div style={{ padding: 24, maxWidth: 480 }}>
        <h2>Host a game</h2>
        <p>The waiting room will show Roll Call (marble game) until you start.</p>
        <button onClick={createGame} style={{ padding: '12px 24px', marginTop: 8 }}>
          Create game
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <h2>Waiting room</h2>
      <p style={{ color: '#a0aec0' }}>Share this link. Players will see the marble game until you start.</p>
      <p style={{ fontSize: 18, wordBreak: 'break-all' }}>
        <a href={game.joinUrl} target="_blank" rel="noopener noreferrer">
          {game.joinUrl}
        </a>
      </p>
      <p style={{ fontSize: 14 }}>Room code: <strong>{game.code}</strong></p>

      <div style={{ marginTop: 24 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Welcome message</label>
        <input
          type="text"
          value={hostMessage}
          onChange={(e) => setHostMessage(e.target.value)}
          style={{ width: '100%', maxWidth: 400, padding: 8 }}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <button onClick={startEvent} style={{ padding: '12px 24px' }}>
          Start the game — everyone enters
        </button>
      </div>
    </div>
  );
}
