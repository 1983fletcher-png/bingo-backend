/**
 * Trivia Room — role-based runtime (host | player | display).
 * Same room code/QR for waiting → game → end; state from ROOM_SNAPSHOT.
 */
import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import type { Socket } from 'socket.io-client';
import type { RoomSnapshotPayload } from '../lib/models';
import { RoomHostPanel, RoomPlayerPanel, RoomDisplayPanel } from '../components/trivia-room';
import '../styles/join.css';
import '../styles/host-create.css';

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
  'Wobbly Noodle', 'Captain Crunch', 'Sassy Badger', 'Cheese Wizard', 'Happy Tofu',
  'Dancing Pickle', 'Sir Loin', 'Baron Von Biscuit', 'Professor Pancake', 'Lady Meringue',
  'Tiny Titan', 'Cosmic Koala', 'Fancy Ferret', 'Bold Avocado', 'Sneaky Peanut',
  'Majestic Moose', 'Zesty Zebra', 'Calm Croissant', 'Wild Walrus', 'Gentle Giraffe',
  'Proud Peacock', 'Swift Sloth', 'Cheerful Chipmunk', 'Bouncy Bean', 'Cozy Cactus',
  'Radiant Raccoon', 'Jolly Jellyfish', 'Breezy Butterfly', 'Merry Mango', 'Snazzy Snail',
  'Daring Donut', 'Wise Wombat', 'Peppy Pigeon', 'Bold Banana', 'Sunny Seahorse',
];
function randomFunnyName(): string {
  return FUNNY_NAMES[Math.floor(Math.random() * FUNNY_NAMES.length)];
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

    const onSnapshot = (payload: RoomSnapshotPayload) => {
      setSnapshot(payload);
      if (role === 'player' && identity?.roomId === roomId && identity?.playerId && payload?.players?.length) {
        const me = payload.players.find((p) => p.playerId === identity.playerId);
        if (me && me.displayName !== identity.displayName) {
          savePlayerIdentity(roomId, identity.playerId, me.displayName, identity.isAnonymous);
        }
      }
    };
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
      <RoomHostPanel
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
      <RoomDisplayPanel
        room={room}
        currentQuestion={currentQuestion}
        pack={pack}
        leaderboardTop={leaderboardTop}
      />
    );
  }
  return (
    <RoomPlayerPanel
      room={room}
      currentQuestion={currentQuestion}
      pack={pack}
      socket={socket}
      roomId={roomId}
      leaderboardTop={leaderboardTop}
      playerId={identity?.roomId === roomId ? identity.playerId : undefined}
    />
  );
}
