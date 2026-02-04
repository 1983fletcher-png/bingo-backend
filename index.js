import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { customAlphabet } from 'nanoid';
import { generateSongs } from './lib/ai.js';
import { fetchTrustedSources } from './lib/trustedSources.js';
import { enrichTrack, getChartStyleList } from './lib/musicDataLayer.js';

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

// Song fact / trivia tidbit for "pop-up video" style when host reveals a song (Music Bingo)
// Optional: frontend calls GET /api/song-fact?artist=...&title=... and shows the fact below the grid.
// Extend with DB or external API later; for now returns placeholder or static entries.
const SONG_FACTS = new Map([
  ['Hey Jude|The Beatles', 'Recorded at Trident Studios in London; the "na na na" coda was partly improvised.'],
  ['Bohemian Rhapsody|Queen', 'Freddie Mercury wrote the song in the 1970s; the operatic section has no chorus.'],
]);
function getSongFact(artist, title) {
  if (!artist || !title) return null;
  const key = `${String(title).trim()}|${String(artist).trim()}`;
  return SONG_FACTS.get(key) || null;
}
app.get('/api/song-fact', (req, res) => {
  const artist = req.query.artist;
  const title = req.query.title;
  const fact = getSongFact(artist, title);
  res.json({ fact: fact || null });
});

// Song metadata (key, tempo, year, playCount, tags, etc.) from MusicBrainz + Spotify + Last.fm.
app.get('/api/song-metadata', async (req, res) => {
  const artist = req.query.artist;
  const title = req.query.title;
  if (!artist || !title) {
    return res.status(400).json({ error: 'Missing artist or title query' });
  }
  try {
    const track = await enrichTrack(artist, title);
    res.json(track);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch metadata' });
  }
});

// Chart-style top tracks by tag (Last.fm), e.g. ?tag=kids&limit=75 for "top 75 kids songs".
app.get('/api/top-tracks-by-tag', async (req, res) => {
  const tag = req.query.tag;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 50);
  if (!tag || typeof tag !== 'string' || !tag.trim()) {
    return res.status(400).json({ error: 'Missing or invalid tag query' });
  }
  try {
    const tracks = await getChartStyleList({ tag: tag.trim(), limit });
    res.json({ tag: tag.trim(), tracks });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch top tracks' });
  }
});

// =============================================================================
// AI Builder (Phase 1: private drafts + export; no public library yet)
// =============================================================================
// Non‑negotiable: anything presented as factual must be cross‑referenced.
// In Phase 1, we enforce this at "publish/share" time. Draft/local play may
// contain unverified facts, but they are marked UNVERIFIED and must not be shared.

const AI_BUILDER_ALLOWED_BUILDS = ['trivia_pack', 'myth_vs_truth', 'icebreakers', 'edutainment'];

function toStr(x) {
  return typeof x === 'string' ? x : '';
}

function normalizeIntent(body) {
  const intent = body?.intent && typeof body.intent === 'object' ? body.intent : {};
  return {
    build: toStr(intent.build),
    title: toStr(intent.title),
    venue_type: Array.isArray(intent.venue_type) ? intent.venue_type.filter((v) => typeof v === 'string') : [],
    audience: intent.audience && typeof intent.audience === 'object' ? intent.audience : {},
    duration_minutes: Number.isFinite(intent.duration_minutes) ? intent.duration_minutes : undefined,
    energy_waveform: Array.isArray(intent.energy_waveform) ? intent.energy_waveform.filter((v) => typeof v === 'string') : [],
    notes: toStr(intent.notes),
  };
}

function nextQuestionsForIntent(intent) {
  const questions = [];

  if (!AI_BUILDER_ALLOWED_BUILDS.includes(intent.build)) {
    questions.push({
      id: 'build',
      prompt: 'What are you building?',
      type: 'single_select',
      options: [
        { id: 'trivia_pack', label: 'Trivia pack (fact-checked + explanations)' },
        { id: 'myth_vs_truth', label: 'Myth vs Truth (gentle explanations + prompts)' },
        { id: 'icebreakers', label: 'Icebreakers (opinion/story prompts)' },
        { id: 'edutainment', label: 'Edutainment (teach-then-check)' },
      ],
    });
  }

  if (!intent.title) {
    questions.push({
      id: 'title',
      prompt: 'What is the title/theme?',
      type: 'text',
      placeholder: 'e.g., 80s Night, Curiosity & Shared Truths, Team Night',
    });
  }

  const minAge = Number.isFinite(intent.audience?.min_age) ? intent.audience.min_age : undefined;
  const maxAge = Number.isFinite(intent.audience?.max_age) ? intent.audience.max_age : undefined;
  if (!(minAge >= 0) || !(maxAge >= 0)) {
    questions.push({
      id: 'audience',
      prompt: 'Who is this for?',
      type: 'audience_range',
      fields: [
        { id: 'min_age', label: 'Min age', type: 'number', default: 4 },
        { id: 'max_age', label: 'Max age', type: 'number', default: 99 },
        { id: 'notes', label: 'Notes (optional)', type: 'text', placeholder: 'Mixed ages, family-friendly' },
      ],
    });
  }

  if (!intent.venue_type?.length) {
    questions.push({
      id: 'venue_type',
      prompt: 'Where is this being hosted?',
      type: 'multi_select',
      options: [
        { id: 'brewery', label: 'Brewery' },
        { id: 'sports_bar', label: 'Sports bar' },
        { id: 'school', label: 'School' },
        { id: 'library', label: 'Library' },
        { id: 'home', label: 'Home' },
      ],
      allow_multiple: true,
    });
  }

  if (!Number.isFinite(intent.duration_minutes)) {
    questions.push({
      id: 'duration_minutes',
      prompt: 'How long should it run?',
      type: 'number',
      min: 5,
      max: 120,
      default: 30,
    });
  }

  // Energy waveform (optional in Phase 1; we can auto-fill defaults).
  return { done: questions.length === 0, questions };
}

// Optional: GET so you can verify AI Builder backend in browser (e.g. .../api/ai-builder/health)
app.get('/api/ai-builder/health', (_, res) => res.json({ ok: true, service: 'ai-builder' }));

app.post('/api/ai-builder/next-questions', (req, res) => {
  const intent = normalizeIntent(req.body);
  const result = nextQuestionsForIntent(intent);
  res.json({ intent, ...result });
});

// Phase 1 generator: returns a skeleton "experience spec" plus draft nodes.
// UI can iterate without needing the full AI generation step yet.
app.post('/api/ai-builder/generate', (req, res) => {
  const intent = normalizeIntent(req.body);
  const { done } = nextQuestionsForIntent(intent);
  if (!done) {
    return res.status(400).json({ error: 'Intent incomplete. Call /api/ai-builder/next-questions first.', intent });
  }

  const experience = {
    experience_id: `draft-${Date.now()}`,
    title: intent.title || 'Untitled',
    venue_type: intent.venue_type?.length ? intent.venue_type : ['home'],
    audience: {
      min_age: Number.isFinite(intent.audience?.min_age) ? intent.audience.min_age : 4,
      max_age: Number.isFinite(intent.audience?.max_age) ? intent.audience.max_age : 99,
      notes: toStr(intent.audience?.notes) || 'Mixed ages, family-friendly',
    },
    core_theme: intent.build === 'myth_vs_truth' ? 'Curiosity & Shared Truths' : 'Play, Learn, Connect',
    energy_waveform: [
      'arrival_calm',
      'gentle_engagement',
      'curiosity_build',
      'competitive_spike',
      'community_release',
      'warm_close',
    ],
    modules: [
      {
        module_id: 'arrival_01',
        type: 'warm_up',
        energy_level: 'low',
        interaction_style: 'discussion',
        question_format: 'open_prompt',
        content: {
          prompt: 'What’s something you believed as a kid that you later updated?',
          visuals_optional: true,
        },
        host_guidance: {
          tone: 'calm',
          instructions: 'Let tables talk for 30–60 seconds. No answers collected.',
        },
      },
    ],
    scoring: {
      competitive_weight: 0.2,
      participation_weight: 0.8,
      notes: 'Competition is optional; participation and conversation are primary.',
    },
    printable_assets: true,
    localization_ready: true,
    accessibility_notes: 'Can be run without screens; host reads prompts aloud.',
  };

  // Draft nodes (intentionally minimal in Phase 1)
  const draft_nodes = [
    {
      id: `node-${Date.now()}`,
      claim_type: intent.build === 'icebreakers' ? 'opinion_prompt' : 'factual_claim',
      type: intent.build === 'myth_vs_truth' ? 'myth_vs_truth' : 'fact',
      title: 'Draft question',
      primaryClaim: 'Replace with a real claim/prompt',
      verifiedAnswer: intent.build === 'icebreakers' ? null : null,
      explanationSimple: '',
      explanationExpanded: '',
      confidenceLevel: 'low',
      sources: [],
      ageAdaptations: {
        kids: '',
        teens: '',
        adults: '',
      },
      conversationPrompts: ['What do you think?', 'Why might people believe this?'],
      energyLevel: 'medium',
      localizationNotes: '',
      sensitivityTags: [],
      verification: {
        status: 'unverified',
        required_sources: intent.build === 'icebreakers' ? 0 : 2,
      },
    },
  ];

  res.json({ experience, draft_nodes });
});

// Verification gate: Phase 1 is “source-count validation”, not web crawling.
// Anything factual requires >=2 sources to be considered VERIFIED.
app.post('/api/ai-builder/verify', async (req, res) => {
  let nodes = Array.isArray(req.body?.nodes) ? req.body.nodes : [];
  const factualTypes = ['factual_claim', 'myth_vs_truth'];

  const updatedNodes = await Promise.all(
    nodes.map(async (n) => {
      const claimType = toStr(n?.claim_type) || 'factual_claim';
      let sources = Array.isArray(n?.sources) ? n.sources : [];
      const factual = factualTypes.includes(claimType);

      if (factual && sources.length < 2) {
        const claimText = toStr(n?.primaryClaim) || toStr(n?.title) || toStr(n?.claim) || '';
        if (claimText) {
          try {
            const fetched = await fetchTrustedSources(claimText, 3);
            const newSources = fetched.map((s) => ({ url: s.url, title: s.title || s.domain }));
            sources = [...sources, ...newSources].slice(0, 5);
          } catch {
            // keep existing sources
          }
        }
      }

      return { ...n, sources };
    })
  );

  nodes = updatedNodes;

  const results = nodes.map((n) => {
    const claimType = toStr(n?.claim_type) || 'factual_claim';
    const sources = Array.isArray(n?.sources) ? n.sources : [];
    const factual = factualTypes.includes(claimType);
    const ok = factual ? sources.length >= 2 : true;
    return {
      id: n?.id ?? null,
      claim_type: claimType,
      verification_status: ok ? 'verified' : (factual ? 'unverified' : 'not_required'),
      required_sources: factual ? 2 : 0,
      source_count: sources.length,
      notes: ok ? null : 'Factual content must include at least 2 independent sources before it can be shared.',
    };
  });

  res.json({ results, updatedNodes });
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
    // Waiting room: mini-game and theme before host starts main event (default ON so players get a welcome screen)
    waitingRoom: {
      game: 'roll-call',    // default ON: players see welcome + marble game until host starts
      theme: 'default',
      hostMessage: 'Starting soon'
    },
    // Roll Call leaderboard (stubbed): playerId -> { bestTimeMs, displayName }
    rollCallScores: new Map(),
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

/** Roll Call leaderboard: sorted by bestTimeMs (asc), for waiting room UI */
function getRollCallLeaderboard(game) {
  if (!game?.rollCallScores) return [];
  const list = [];
  for (const [playerId, data] of game.rollCallScores) {
    const p = game.players.get(playerId);
    list.push({
      playerId,
      displayName: p?.name || 'Player',
      bestTimeMs: data.bestTimeMs
    });
  }
  return list.sort((a, b) => a.bestTimeMs - b.bestTimeMs);
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

  // Waiting room: host sets mini-game (e.g. roll-call), theme, and message
  socket.on('host:set-waiting-room', ({ code, game: wrGame, theme, hostMessage }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    if (wrGame !== undefined) game.waitingRoom.game = wrGame === 'roll-call' ? 'roll-call' : null;
    if (theme !== undefined && typeof theme === 'string') game.waitingRoom.theme = theme;
    if (hostMessage !== undefined && typeof hostMessage === 'string') game.waitingRoom.hostMessage = hostMessage;
    io.to(`game:${game.code}`).emit('game:waiting-room-updated', { waitingRoom: game.waitingRoom });
  });

  socket.on('host:set-songs', ({ code, songs }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    game.songPool = Array.isArray(songs) ? songs : [];
    io.to(`game:${game.code}`).emit('game:songs-updated', { songPool: game.songPool });
  });

  socket.on('host:set-trivia-questions', ({ code, questions }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id || !game.trivia) return;
    game.trivia.questions = Array.isArray(questions) ? questions : [];
    const payload = getTriviaPayload(game);
    io.to(`game:${game.code}`).emit('game:trivia-state', payload);
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
    game.rollCallScores.clear();
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
      gameType: game.gameType,
      waitingRoom: game.waitingRoom
    };
    if (game.trivia) joinPayload.trivia = getTriviaPayload(game);
    // Stubbed Roll Call leaderboard for waiting room
    joinPayload.rollCallLeaderboard = getRollCallLeaderboard(game);
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

  // Roll Call (waiting room): player submits finish time; leaderboard is stubbed here
  socket.on('player:roll-call-score', ({ code, timeMs }) => {
    const game = getGame(code);
    if (!game) return;
    const p = game.players.get(socket.id);
    if (!p || typeof timeMs !== 'number' || timeMs <= 0) return;
    let data = game.rollCallScores.get(socket.id);
    if (!data) {
      data = { bestTimeMs: timeMs };
      game.rollCallScores.set(socket.id, data);
    } else {
      data.bestTimeMs = Math.min(data.bestTimeMs, timeMs);
    }
    const leaderboard = getRollCallLeaderboard(game);
    io.to(`game:${game.code}`).emit('game:roll-call-leaderboard', { leaderboard });
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
      gameType: game.gameType,
      started: game.started,
      waitingRoom: game.waitingRoom,
      rollCallLeaderboard: getRollCallLeaderboard(game)
    };
    if (game.trivia) displayPayload.trivia = getTriviaPayload(game);
    socket.emit('display:ok', displayPayload);
  });

  // --- Trivia ---
  socket.on('host:trivia-start', ({ code }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id || !game.trivia) return;
    game.started = true;
    game.trivia.currentIndex = 0;
    game.trivia.revealed = false;
    io.to(`game:${game.code}`).emit('game:started', {});
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
