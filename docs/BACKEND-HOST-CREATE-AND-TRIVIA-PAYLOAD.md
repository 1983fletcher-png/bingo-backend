# Backend: createGame, host:create, getTriviaPayload

From `index.js` — old code-based game flow (Music Bingo, Trivia, Icebreakers, Edutainment, Team Building). Not used by the new Trivia Room flow (`room:host-create` / `room:join`).

---

## createGame(opts)

```js
// index.js
const TRIVIA_LIKE_TYPES = ['trivia', 'icebreakers', 'edutainment', 'team-building'];

function createGame(opts = {}) {
  let code;
  do { code = nanoidCode(); } while (games.has(code));
  const requested = opts.gameType;
  const gameType = requested === 'classic-bingo' ? 'classic-bingo'
    : TRIVIA_LIKE_TYPES.includes(requested) ? requested
    : 'music-bingo';
  const defaultTitles = {
    'trivia': 'Trivia',
    'icebreakers': 'Icebreakers',
    'edutainment': 'Edutainment',
    'team-building': 'Team Building',
    'classic-bingo': 'Classic Bingo',
    'music-bingo': 'Playroom'
  };
  const defaultTitle = defaultTitles[gameType] || 'Playroom';
  const game = {
    code,
    hostId: null,
    eventConfig: opts.eventConfig || { gameTitle: defaultTitle, venueName: '', accentColor: '#e94560' },
    players: new Map(),
    songPool: [],
    revealed: [],
    winner: null,
    started: false,
    welcomeDismissed: false,
    freeSpace: true,
    winCondition: 'line',
    gameType,
    waitingRoom: {
      game: 'roll-call',
      theme: 'default',
      hostMessage: 'Starting soon',
      logoAnimation: 'bounce',
      stretchyImageSource: 'playroom',
      mazeCenterSource: 'playroom'
    },
    rollCallScores: new Map(),
    trivia: TRIVIA_LIKE_TYPES.includes(gameType) ? {
      packId: opts.packId || '',
      questions: Array.isArray(opts.questions) ? opts.questions : [],
      currentIndex: 0,
      revealed: false,
      scores: {},
      answers: {}
    } : null
  };
  games.set(code, game);
  return game;
}
```

**Opts:** `gameType`, `packId` (trivia-like only), `questions` (trivia-like only), `eventConfig`.  
**Returns:** game object with 6-letter `code`; stored in `games` Map. Trivia-like games have `game.trivia` with `packId`, `questions`, `currentIndex`, `revealed`, `scores`, `answers`.

---

## getTriviaPayload(game)

```js
// index.js
function getTriviaPayload(game) {
  if (!game?.trivia) return null;
  const t = game.trivia;
  const q = t.questions[t.currentIndex] || null;
  return {
    packId: t.packId,
    questions: t.questions,
    currentIndex: t.currentIndex,
    revealed: t.revealed,
    scores: t.scores,
    currentQuestion: q
  };
}
```

**Used by:** `game:created` payload (when `game.trivia` exists), `game:trivia-state`, `join:ok`, `display:ok`, and inside `host:trivia-start` / `host:trivia-next` / `host:trivia-reveal`.  
`game.trivia` (from `createGame`) has: `packId`, `questions`, `currentIndex`, `revealed`, `scores`, `answers`.

---

## host:create

```js
// index.js
socket.on('host:create', ({ baseUrl, gameType, packId, questions, eventConfig } = {}) => {
  const isTriviaLike = ['trivia', 'icebreakers', 'edutainment', 'team-building'].includes(gameType);
  const resolvedType = gameType === 'classic-bingo' ? 'classic-bingo'
    : isTriviaLike ? gameType
    : 'music-bingo';
  const game = createGame({
    gameType: resolvedType,
    packId: isTriviaLike ? (packId || '') : undefined,
    questions: isTriviaLike ? (Array.isArray(questions) ? questions : []) : undefined,
    eventConfig: eventConfig && typeof eventConfig === 'object' ? eventConfig : undefined
  });
  game.hostId = socket.id;
  socket.join(`game:${game.code}`);
  socket.gameCode = game.code;
  const origin = baseUrl || getBaseUrl(socket);
  const payload = {
    code: game.code,
    joinUrl: `${origin}/join/${game.code}`,
    songPool: game.songPool,
    revealed: game.revealed,
    freeSpace: game.freeSpace,
    winCondition: game.winCondition,
    eventConfig: game.eventConfig,
    gameType: game.gameType,
    waitingRoom: game.waitingRoom
  };
  if (game.trivia) payload.trivia = getTriviaPayload(game);
  socket.emit('game:created', payload);
});
```

**Creates** a code-based game (6-letter `game.code`), joins socket to `game:${game.code}`, and sends `game:created` with `joinUrl` (e.g. `/join/ABC123`). Trivia-like types get `payload.trivia` from `getTriviaPayload(game)`.
