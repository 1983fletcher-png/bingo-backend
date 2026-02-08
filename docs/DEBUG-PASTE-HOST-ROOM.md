# Debug paste — Host room & Trivia flow

Paste these sections for a scrape-through / diff-style fix. Paths are under `frontend/src/`.

---

## 1. App.tsx — routes + route components

```tsx
// frontend/src/App.tsx (relevant only)

import Host from './pages/Host';
import HostCreateTrivia from './pages/HostCreateTrivia';
import Room from './pages/Room';
import TriviaBuilder from './pages/TriviaBuilder';
// ... other imports

<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/host" element={<Host />} />
  <Route path="/host/create" element={<HostCreateTrivia />} />
  <Route path="/host/build/trivia" element={<TriviaBuilder />} />
  <Route path="/room/:roomId" element={<Room />} />
  <Route path="/display/:code" element={<Display />} />
  <Route path="/join" element={<JoinEntry />} />
  <Route path="/join/:code" element={<Play />} />
  // ... rest
</Routes>
```

---

## 2. Host.tsx — createMode selection + create handlers

### 2a. createMode from URL + state

```tsx
// frontend/src/pages/Host.tsx

export type CreateMode = 'music-bingo' | 'classic-bingo' | 'trivia' | 'icebreakers' | 'edutainment' | 'team-building';

function createModeFromUrl(type: string | null): CreateMode {
  if (type === 'bingo' || type === 'music-bingo') return 'music-bingo';
  if (type === 'classic-bingo') return 'classic-bingo';
  if (type === 'trivia' || type === 'icebreakers' || type === 'edutainment' || type === 'team-building') return type;
  return 'music-bingo';
}

// Inside Host():
const [searchParams] = useSearchParams();
const typeFromUrl = searchParams.get('type');
const [createMode, setCreateMode] = useState<CreateMode>(() => createModeFromUrl(typeFromUrl));

useEffect(() => {
  const mode = createModeFromUrl(typeFromUrl);
  if (mode !== createMode) setCreateMode(mode);
}, [typeFromUrl]);
```

### 2b. createGame (old flow — code-based game)

```tsx
const createGame = (mode: CreateMode, pack?: TriviaPack | null) => {
  if (!socket) return;
  setGame(null);
  setTriviaPackForGame(null);
  setCreateError(null);
  setCreatePending(true);
  const isTriviaLike = mode === 'trivia' || mode === 'icebreakers' || mode === 'edutainment' || mode === 'team-building';
  const defaultTitles: Record<string, string> = {
    'trivia': 'Trivia',
    'icebreakers': 'Icebreakers',
    'edutainment': 'Edutainment',
    'team-building': 'Team Building',
    'classic-bingo': 'Classic Bingo',
    'music-bingo': 'The Playroom',
  };
  const initialEventConfig: EventConfig = isTriviaLike
    ? { ...eventConfig, gameTitle: pack?.title ?? defaultTitles[mode] }
    : { ...eventConfig, gameTitle: eventConfig.gameTitle || (mode === 'classic-bingo' ? 'Classic Bingo' : 'The Playroom') };
  if (isTriviaLike && pack) {
    setTriviaPackForGame(pack);
    socket.emit('host:create', {
      baseUrl: window.location.origin,
      gameType: mode,
      eventConfig: { ...initialEventConfig, gameTitle: pack.title },
      questions: pack.questions,
    });
  } else if (mode === 'trivia') {
    const fallback = defaultTriviaPacks.find(p => p.id === selectedTriviaPackId) ?? defaultTriviaPacks[0];
    setTriviaPackForGame(fallback);
    socket.emit('host:create', {
      baseUrl: window.location.origin,
      gameType: 'trivia',
      eventConfig: { ...initialEventConfig, gameTitle: fallback.title },
      questions: fallback.questions,
    });
  } else if (isTriviaLike) {
    socket.emit('host:create', {
      baseUrl: window.location.origin,
      gameType: mode,
      eventConfig: { ...initialEventConfig, gameTitle: pack?.title ?? defaultTitles[mode] },
      questions: pack?.questions ?? [],
    });
  } else {
    socket.emit('host:create', {
      baseUrl: window.location.origin,
      gameType: mode as 'music-bingo' | 'classic-bingo',
      eventConfig: initialEventConfig,
    });
  }
  if (createTimeoutRef.current) clearTimeout(createTimeoutRef.current);
  createTimeoutRef.current = setTimeout(() => {
    createTimeoutRef.current = null;
    setCreatePending((p) => {
      if (p) setCreateError('Room did not open. Try again or check Railway logs.');
      return false;
    });
  }, 8000);
};
```

### 2c. startEvent (Start the game / Start trivia — OLD flow, when game exists)

```tsx
const startEvent = () => {
  if (!socket || !game) return;
  const isTriviaLikeType = game.gameType === 'trivia' || game.gameType === 'icebreakers' || game.gameType === 'edutainment' || game.gameType === 'team-building';
  if (isTriviaLikeType) {
    socket.emit('host:trivia-start', { code: game.code });
  } else {
    socket.emit('host:start', { code: game.code });
  }
};
```

### 2d. When !game and createMode === trivia (no “Create Trivia” button)

```tsx
{createMode === 'trivia' && (
  <>
    <p className="host-create__copy">
      Run a verified Trivia pack with one room code. ...
    </p>
    <div className="host-create__content" style={{ ... }}>
      <button
        type="button"
        className="host-create__btn-primary"
        onClick={() => navigate('/host/create?trivia')}
      >
        Choose pack & host
      </button>
      <Link to="/host/build/trivia" className="host-create__back" ...>
        Build custom questions →
      </Link>
    </div>
  </>
)}
// ...
{createMode !== 'trivia' && (
  <>
    <button ... onClick={handleCreate} disabled={!canCreate || createPending}>
      {createPending ? 'Creating…' : createButtonLabel}
    </button>
    ...
  </>
)}
```

### 2e. Button where “Start trivia” is (OLD flow — only when game exists)

```tsx
// Host.tsx — Waiting room section when game exists (code-based)
<button
  type="button"
  className="host-room__start-btn"
  onClick={startEvent}
  disabled={game.gameType === 'music-bingo' && (songPool?.length ?? 0) < 24}
>
  {game.gameType === 'trivia' ? 'Start trivia' : 'Start the game'}
</button>
{game.gameType === 'music-bingo' && (songPool?.length ?? 0) < 24 && (
  <p className="host-room__when-note">Add at least 24 songs in the Call sheet tab to start.</p>
)}
```

So for trivia (old flow), the button is only disabled when `game.gameType === 'music-bingo' && (songPool?.length ?? 0) < 24` — i.e. trivia is never disabled by that. If it appears “dead,” likely causes: `!socket`, `!game`, or backend not handling `host:trivia-start`.

---

## 3. HostCreateTrivia.tsx — step logic + query parsing + navigation

```tsx
// frontend/src/pages/HostCreateTrivia.tsx (relevant parts)

type Step = 'type' | 'pack' | 'preview' | 'options';

export default function HostCreateTrivia() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromHost = searchParams.get('trivia') != null || searchParams.get('from') === 'host';
  const [step, setStep] = useState<Step>(() => (fromHost ? 'pack' : 'type'));
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedPack, setSelectedPack] = useState<TriviaPackModel | null>(null);
  const [settings, setSettings] = useState<Partial<RoomSettings>>({ ... });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Step: type — only when no ?trivia
  if (step === 'type') {
    return (
      // ...
      <button onClick={() => setStep('pack')}>Trivia</button>
      <Link to="/host?type=trivia">← Back to host</Link>
    );
  }

  // Step: pack
  if (step === 'pack') {
    return (
      // pack cards, then:
      {fromHost ? (
        <Link to="/host?type=trivia" ...>← Back to host</Link>
      ) : (
        <button onClick={() => setStep('type')}>Back</button>
      )}
      <button disabled={!selectedPack} onClick={() => setStep('preview')}>Preview pack</button>
    );
  }

  // Step: preview
  if (step === 'preview') {
    return (
      <button onClick={() => setStep('pack')}>Back</button>
      <button onClick={() => setStep('options')}>Load pack → Host options</button>
    );
  }

  // Step: options (final)
  return (
    <button onClick={() => setStep('preview')}>Back</button>
    <button disabled={!selectedPack || creating} onClick={handleStartHosting}>
      {creating ? 'Creating…' : 'Start hosting'}
    </button>
  );
}
```

---

## 4. Room.tsx — socket/join logic (no separate useRoomSocket; single useEffect)

```tsx
// frontend/src/pages/Room.tsx

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

  if (!roomId) return ( ... <a href="/">Go home</a> );
  if (error) return ( ... <a href="/">Go home</a> );

  const playerNeedsJoin = role === 'player' && (!identity || identity.roomId !== roomId);
  if (playerNeedsJoin && !snapshot && !playerJoined) {
    return <PlayerJoinForm roomId={roomId} socket={socket} onJoined={() => setPlayerJoined(true)} />;
  }

  if (!snapshot) return ( <p>Connecting to room…</p> );

  const { room, players, currentQuestion, responsesCount, leaderboardTop, pack } = snapshot;
  if (role === 'host') return <HostPanel ... />;
  if (role === 'display') return <DisplayPanel ... />;
  return <PlayerPanel ... />;
}
```

---

## 5. Room HostPanel — “Start” button disabled logic (Trivia Room flow) — FIXED

Two separate enable checks so “Start ready check” is clickable in WAITING_ROOM and “Begin round” in READY_CHECK:

```tsx
// frontend/src/pages/Room.tsx — HostPanel

import { isStartButtonEnabled, isStartReadyCheckEnabled } from '../lib/models';

const packLoaded = Boolean(pack?.questions?.length);
const hostConnected = Boolean(socket?.connected);
const startReadyCheckEnabled = isStartReadyCheckEnabled(room.state, packLoaded, hostConnected);
const beginRoundEnabled = isStartButtonEnabled(room.state, packLoaded, hostConnected);

// Buttons:
{room.state === 'WAITING_ROOM' && (
  <button disabled={!startReadyCheckEnabled} onClick={() => setState('READY_CHECK')}>
    Start ready check
  </button>
)}
{room.state === 'READY_CHECK' && (
  <button disabled={!beginRoundEnabled} onClick={() => setState('ACTIVE_ROUND')}>
    Begin round
  </button>
)}
```

```ts
// frontend/src/lib/models.ts

/** "Begin round" enabled when in READY_CHECK with pack and connection */
export function isStartButtonEnabled(state: RoomState, packLoaded: boolean, hostConnected: boolean): boolean {
  return state === 'READY_CHECK' && packLoaded && hostConnected;
}

/** "Start ready check" enabled when in WAITING_ROOM with pack and connection */
export function isStartReadyCheckEnabled(state: RoomState, packLoaded: boolean, hostConnected: boolean): boolean {
  return state === 'WAITING_ROOM' && packLoaded && hostConnected;
}
```

---

## 6. Summary for diff-style fix

- **App.tsx:** Routes are correct; no change needed unless adding/renaming routes.
- **Host.tsx:** createMode + createGame + startEvent + Trivia branch (navigate to /host/create?trivia) and “Start trivia” button (old flow) — as above.
- **HostCreateTrivia.tsx:** Query `?trivia`/`?from=host` → fromHost, step init, room:host-create, navigate to /room/:roomId?role=host — as above.
- **Room.tsx:** Single useEffect: room:join by role, room:snapshot/room:error; player join form when no identity — as above.
- **“Start” dead button:**
  - **Old flow (Host.tsx):** “Start trivia” — disabled only for music-bingo when songs < 24; if dead, check socket/game and backend `host:trivia-start`.
  - **New flow (Room.tsx HostPanel):** Fixed. “Start ready check” uses `isStartReadyCheckEnabled` (WAITING_ROOM + pack + connected); “Begin round” uses `isStartButtonEnabled` (READY_CHECK + pack + connected).

---

## 7. Backend socket handlers (index.js + server/roomStore.js)

### room:join

```js
// index.js
socket.on('room:join', ({ roomId, role, playerId, displayName, isAnonymous, hostToken } = {}) => {
  const rid = (roomId || '').trim();
  const r = roomStore.getRoom(rid);
  if (!r) {
    socket.emit('room:error', { message: 'Room not found', code: 'ROOM_NOT_FOUND' });
    return;
  }
  socket.join(`room:${rid}`);
  socket.roomId = rid;
  socket.roomRole = role || 'player';
  if (role === 'host') {
    if (r.hostToken && hostToken === r.hostToken) r.hostId = socket.id;
    else if (r.hostId === '') r.hostId = socket.id;
  }
  if (role === 'player' && playerId && displayName !== undefined) {
    roomStore.upsertPlayer(rid, {
      playerId,
      displayName: String(displayName),
      isAnonymous: Boolean(isAnonymous),
    });
  }
  const snapshot = roomStore.buildRoomSnapshot(rid);
  if (snapshot) socket.emit('room:snapshot', snapshot);
});
```

### room:host-create

```js
// index.js
socket.on('room:host-create', ({ pack, settings } = {}) => {
  if (!pack || !pack.id) {
    socket.emit('room:error', { message: 'Pack required', code: 'PACK_REQUIRED' });
    return;
  }
  const room = roomStore.createRoom({
    pack,
    hostId: socket.id,
    settings: settings && typeof settings === 'object' ? settings : undefined,
  });
  socket.join(`room:${room.roomId}`);
  socket.roomId = room.roomId;
  socket.roomRole = 'host';
  const snapshot = roomStore.buildRoomSnapshot(room.roomId);
  if (snapshot) socket.emit('room:snapshot', snapshot);
  socket.emit('room:created', { roomId: room.roomId, hostToken: room.hostToken });
});
```

### room:snapshot emission logic

Snapshot is built by `roomStore.buildRoomSnapshot(roomId)` and emitted in these places:

| Handler | Who gets snapshot |
|--------|---------------------|
| **room:join** | Joining socket only: `socket.emit('room:snapshot', snapshot)` |
| **room:host-create** | Creating socket only: `socket.emit('room:snapshot', snapshot)` then `socket.emit('room:created', …)` |
| **room:host-set-state** | Entire room: `io.to(\`room:${rid}\`).emit('room:snapshot', snapshot)` |
| **room:host-next** | Entire room: `io.to(\`room:${rid}\`).emit('room:snapshot', snapshot)` (after advance or move to LEADERBOARD) |
| **room:host-toggle-setting** | Entire room: `io.to(\`room:${rid}\`).emit('room:snapshot', snapshot)` |
| **room:submit-response** | Entire room: `io.to(\`room:${rid}\`).emit('room:snapshot', snapshot)` |

**buildRoomSnapshot** (server/roomStore.js):

```js
export function buildRoomSnapshot(roomId) {
  const room = triviaRooms.get(roomId);
  if (!room) return null;
  const questions = room.pack?.questions || [];
  const currentQuestion = questions[room.runtime.currentQuestionIndex] || null;
  const playersList = Array.from(room.players.values());
  const responsesCount = room.responses.filter(
    (r) => r.questionId === currentQuestion?.id
  ).length;
  const leaderboardTop = computeLeaderboard(roomId, 10);

  return {
    room: {
      roomId: room.roomId,
      createdAt: room.createdAt,
      state: room.state,
      mode: room.mode,
      packId: room.packId,
      hostId: room.hostId,
      settings: room.settings,
      runtime: { ...room.runtime },
    },
    players: playersList,
    currentQuestion: currentQuestion,
    responsesCount,
    leaderboardTop,
    pack: room.pack || undefined,
  };
}
```

### host:start (old code-based games, e.g. Music Bingo)

```js
// index.js
socket.on('host:start', ({ code }) => {
  const game = getGame(code);
  if (!game || game.hostId !== socket.id) return;
  game.started = true;
  game.welcomeDismissed = false;
  io.to(`game:${game.code}`).emit('game:started', { welcomeDismissed: false });
});
```

### host:trivia-start (old code-based Trivia / Icebreakers / Edutainment / Team Building)

```js
// index.js
socket.on('host:trivia-start', ({ code }) => {
  const game = getGame(code);
  if (!game || game.hostId !== socket.id || !game.trivia) return;
  game.started = true;
  game.welcomeDismissed = false;
  game.trivia.currentIndex = 0;
  game.trivia.revealed = false;
  io.to(`game:${game.code}`).emit('game:started', { welcomeDismissed: false });
  const payload = getTriviaPayload(game);
  io.to(`game:${game.code}`).emit('game:trivia-state', payload);
});
```

**Note:** Trivia **Room** (new flow) does not use `host:start` or `host:trivia-start`; it uses `room:host-set-state` (e.g. READY_CHECK → ACTIVE_ROUND) and `room:host-next`. The old flow uses `game.code` and `game:${code}`; the new flow uses `roomId` and `room:${rid}`.
