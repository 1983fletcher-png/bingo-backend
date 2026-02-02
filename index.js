import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';
import { customAlphabet } from 'nanoid';

const nanoidCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: true },
  transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());

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

// =============================================================================
// Game sessions — room code, host, players, songs, bingo
// =============================================================================

const games = new Map();

function getGame(code) {
  const id = (code || '').toUpperCase().trim();
  return id ? games.get(id) : null;
}

function createGame() {
  let code;
  do { code = nanoidCode(); } while (games.has(code));
  const game = {
    code,
    hostId: null,
    eventConfig: { gameTitle: 'Playroom', venueName: '', accentColor: '#e94560' },
    players: new Map(),
    songPool: [],
    revealed: [],
    winner: null,
    started: false,
    freeSpace: true,
    winCondition: 'line',
    gameType: 'music-bingo'
  };
  games.set(code, game);
  return game;
}

io.on('connection', (socket) => {
  socket.on('host:create', ({ baseUrl } = {}) => {
    const game = createGame();
    game.hostId = socket.id;
    socket.join(`game:${game.code}`);
    socket.gameCode = game.code;
    const origin = baseUrl || getBaseUrl(socket);
    socket.emit('game:created', {
      code: game.code,
      joinUrl: `${origin}/join/${game.code}`,
      songPool: game.songPool,
      freeSpace: game.freeSpace,
      winCondition: game.winCondition,
      eventConfig: game.eventConfig,
      gameType: game.gameType
    });
  });

  socket.on('event:preview', ({ code }) => {
    const game = getGame(code);
    if (!game) {
      socket.emit('event:preview-error', { message: 'Event not found' });
      return;
    }
    socket.emit('event:preview-ok', {
      eventConfig: game.eventConfig,
      gameType: game.gameType,
      gameTitle: game.eventConfig?.gameTitle || 'Playroom'
    });
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
    socket.emit('join:ok', {
      code: game.code,
      songPool: game.songPool,
      revealed: game.revealed,
      started: game.started,
      freeSpace: game.freeSpace,
      winCondition: game.winCondition,
      eventConfig: game.eventConfig,
      gameType: game.gameType
    });
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
    socket.emit('display:ok', {
      code: game.code,
      songPool: game.songPool,
      revealed: game.revealed,
      eventConfig: game.eventConfig,
      winner: game.winner,
      gameType: game.gameType
    });
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
