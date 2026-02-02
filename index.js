import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { customAlphabet } from 'nanoid';
import { generateSongs } from './lib/ai.js';

const nanoidCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: true },
  transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());

// Root: so opening the backend URL in a browser shows something friendly
app.get('/', (_, res) => res.redirect(302, '/health'));

// Health check for Railway/Render
app.get('/health', (_, res) => res.json({ ok: true }));

app.get('/api/public-url', (_, res) => {
  res.json({ publicOrigin: process.env.PUBLIC_ORIGIN || null });
});

// Scrape venue site for logo/colors (optional)
app.get('/api/scrape-site', async (req, res) => {
  const url = req.query.url;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url query' });
  }
  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Playroom/1.0' },
      signal: AbortSignal.timeout(10000)
    });
    const html = await resp.text();
    const logoUrl = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];
    const themeColor = html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i)?.[1];
    const result = { logoUrl: logoUrl || null, colors: [], title: null };
    if (themeColor) result.colors.push(themeColor);
    const titleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) result.title = titleMatch[1].trim();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch URL' });
  }
});

// Music Bingo: AI-generated song list (75 songs, one per artist, theme-aware)
app.post('/api/generate-songs', async (req, res) => {
  const { prompt = '', familyFriendly = false, count = 75 } = req.body || {};
  const apiKey = req.body?.apiKey ?? req.headers?.['x-openai-api-key'] ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: 'OpenAI API key required. Send apiKey in body or x-openai-api-key header, or set OPENAI_API_KEY.' });
  }
  try {
    const { songs, raw } = await generateSongs({
      prompt: typeof prompt === 'string' ? prompt : '',
      familyFriendly: Boolean(familyFriendly),
      count: typeof count === 'number' ? count : 75,
      apiKey: String(apiKey)
    });
    res.json({ songs, raw });
  } catch (err) {
    const status = err.message?.includes('API key') ? 401 : err.message?.includes('OpenAI') ? 502 : 500;
    res.status(status).json({ error: err.message || 'Failed to generate songs' });
  }
});

// =============================================================================
// Game sessions — room code, host, players, songs, bingo
// =============================================================================

const games = new Map();

function getGame(code) {
  const id = (code || '').toUpperCase().trim();
  return id ? games.get(id) : null;
}

function createGame(opts = {}) {
  let code;
  do { code = nanoidCode(); } while (games.has(code));
  const gameType = opts.gameType === 'trivia' ? 'trivia' : 'music-bingo';
  const game = {
    code,
    hostId: null,
    eventConfig: opts.eventConfig || { gameTitle: gameType === 'trivia' ? 'Trivia' : 'Playroom', venueName: '', accentColor: '#e94560' },
    players: new Map(),
    songPool: [],
    revealed: [],
    winner: null,
    started: false,
    freeSpace: true,
    winCondition: 'line',
    gameType,
    // Trivia state (when gameType === 'trivia')
    trivia: gameType === 'trivia' ? {
      packId: opts.packId || '',
      questions: Array.isArray(opts.questions) ? opts.questions : [],
      currentIndex: 0,
      revealed: false,
      scores: {},
      answers: {} // playerId -> { questionIndex -> answer }
    } : null
  };
  games.set(code, game);
  return game;
}

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

io.on('connection', (socket) => {
  socket.on('host:create', ({ baseUrl, gameType, packId, questions, eventConfig } = {}) => {
    const isTrivia = gameType === 'trivia';
    const game = createGame({
      gameType: isTrivia ? 'trivia' : 'music-bingo',
      packId: isTrivia ? (packId || '') : undefined,
      questions: isTrivia ? (Array.isArray(questions) ? questions : []) : undefined,
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
      freeSpace: game.freeSpace,
      winCondition: game.winCondition,
      eventConfig: game.eventConfig,
      gameType: game.gameType
    };
    if (game.trivia) payload.trivia = getTriviaPayload(game);
    socket.emit('game:created', payload);
  });

  socket.on('event:preview', ({ code }) => {
    const game = getGame(code);
    if (!game) {
      socket.emit('event:preview-error', { message: 'Event not found' });
      return;
    }
    const payload = {
      eventConfig: game.eventConfig,
      gameType: game.gameType,
      gameTitle: game.eventConfig?.gameTitle || 'Playroom'
    };
    if (game.trivia) payload.trivia = getTriviaPayload(game);
    socket.emit('event:preview-ok', payload);
  });

  socket.on('host:set-win-condition', ({ code, winCondition }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    game.winCondition = winCondition || 'line';
    io.to(`game:${game.code}`).emit('game:win-condition-updated', { winCondition: game.winCondition });
  });

  socket.on('host:set-event-config', ({ code, eventConfig }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    game.eventConfig = eventConfig && typeof eventConfig === 'object' ? eventConfig : {};
    io.to(`game:${game.code}`).emit('game:event-config-updated', { eventConfig: game.eventConfig });
  });

  socket.on('host:set-songs', ({ code, songs }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    game.songPool = Array.isArray(songs) ? songs : [];
    io.to(`game:${game.code}`).emit('game:songs-updated', { songPool: game.songPool });
  });

  socket.on('host:reveal', ({ code, song }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    if (!song || game.revealed.includes(song)) return;
    game.revealed.push(song);
    io.to(`game:${game.code}`).emit('game:revealed', { song, revealed: game.revealed });
  });

  socket.on('host:start', ({ code }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    game.started = true;
    io.to(`game:${game.code}`).emit('game:started', {});
  });

  socket.on('host:reset', ({ code }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    game.revealed = [];
    game.winner = null;
    game.started = false;
    io.to(`game:${game.code}`).emit('game:reset', {});
  });

  socket.on('player:join', ({ code, name }) => {
    const game = getGame(code);
    if (!game) {
      socket.emit('join:error', { message: 'Game not found' });
      return;
    }
    const playerId = socket.id;
    game.players.set(playerId, { id: playerId, name: name || 'Player', card: null });
    socket.join(`game:${game.code}`);
    socket.gameCode = game.code;
    const joinPayload = {
      code: game.code,
      songPool: game.songPool,
      revealed: game.revealed,
      started: game.started,
      freeSpace: game.freeSpace,
      winCondition: game.winCondition,
      eventConfig: game.eventConfig,
      gameType: game.gameType
    };
    if (game.trivia) joinPayload.trivia = getTriviaPayload(game);
    socket.emit('join:ok', joinPayload);
    socket.to(`game:${game.code}`).emit('player:joined', {
      id: playerId,
      name: game.players.get(playerId).name,
      count: game.players.size
    });
  });

  socket.on('player:card', ({ code, card }) => {
    const game = getGame(code);
    if (!game) return;
    const p = game.players.get(socket.id);
    if (p) p.card = card;
  });

  socket.on('player:bingo', ({ code }) => {
    const game = getGame(code);
    if (!game || game.winner) return;
    const p = game.players.get(socket.id);
    if (!p) return;
    game.winner = { id: p.id, name: p.name };
    io.to(`game:${game.code}`).emit('game:winner', { winner: game.winner });
  });

  socket.on('display:join', ({ code }) => {
    const game = getGame(code);
    if (!game) {
      socket.emit('display:error', { message: 'Game not found' });
      return;
    }
    socket.join(`game:${game.code}`);
    socket.gameCode = game.code;
    const displayPayload = {
      code: game.code,
      songPool: game.songPool,
      revealed: game.revealed,
      eventConfig: game.eventConfig,
      winner: game.winner,
      gameType: game.gameType
    };
    if (game.trivia) displayPayload.trivia = getTriviaPayload(game);
    socket.emit('display:ok', displayPayload);
  });

  // --- Trivia ---
  socket.on('host:trivia-start', ({ code }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id || !game.trivia) return;
    game.trivia.currentIndex = 0;
    game.trivia.revealed = false;
    const payload = getTriviaPayload(game);
    io.to(`game:${game.code}`).emit('game:trivia-state', payload);
  });

  socket.on('host:trivia-next', ({ code }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id || !game.trivia) return;
    const t = game.trivia;
    if (t.currentIndex < t.questions.length - 1) {
      t.currentIndex += 1;
      t.revealed = false;
    }
    const payload = getTriviaPayload(game);
    io.to(`game:${game.code}`).emit('game:trivia-state', payload);
  });

  socket.on('host:trivia-reveal', ({ code }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id || !game.trivia) return;
    const t = game.trivia;
    const q = t.questions[t.currentIndex];
    if (!q) return;
    t.revealed = true;
    const correct = (q.correctAnswer || '').trim().toLowerCase();
    const scores = { ...t.scores };
    const pointsPerCorrect = (typeof q.points === 'number' && q.points >= 0) ? q.points : 1;
    for (const [playerId, answers] of Object.entries(t.answers)) {
      const ans = (answers[t.currentIndex] || '').trim().toLowerCase();
      if (ans === correct) {
        scores[playerId] = (scores[playerId] || 0) + pointsPerCorrect;
      }
    }
    t.scores = scores;
    io.to(`game:${game.code}`).emit('game:trivia-reveal', {
      questionIndex: t.currentIndex,
      correctAnswer: q.correctAnswer,
      scores: t.scores
    });
  });

  socket.on('player:trivia-answer', ({ code, questionIndex, answer }) => {
    const game = getGame(code);
    if (!game || !game.trivia) return;
    const t = game.trivia;
    if (t.revealed || questionIndex !== t.currentIndex) return;
    if (!t.answers[socket.id]) t.answers[socket.id] = {};
    t.answers[socket.id][questionIndex] = answer;
  });

  socket.on('disconnect', () => {
    const code = socket.gameCode;
    if (!code) return;
    const game = getGame(code);
    if (!game) return;
    if (game.hostId === socket.id) {
      io.to(`game:${code}`).emit('game:ended', { message: 'Host left' });
      games.delete(code);
      return;
    }
    if (game.players.has(socket.id)) {
      game.players.delete(socket.id);
    }
    socket.to(`game:${code}`).emit('player:left', { id: socket.id, count: game.players.size });
  });
});

function getBaseUrl(socket) {
  const req = socket.request;
  const host = req?.headers?.host || 'localhost:5173';
  const proto = req?.headers?.['x-forwarded-proto'] || 'http';
  return `${proto}://${host}`;
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Music Bingo backend on port ${PORT}`);
});
