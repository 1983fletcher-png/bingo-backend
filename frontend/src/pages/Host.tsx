import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import HostSongGrid from '../components/HostSongGrid';
import SongFactPopUp from '../components/SongFactPopUp';
import { defaultTriviaPacks } from '../data/triviaPacks';
import type { TriviaPack, TriviaQuestion } from '../data/triviaPacks';
import { printBingoCards } from '../lib/printBingoCards';
import { buildTriviaQuizPrintDocument, buildFlashcardsPrintDocument } from '../lib/printMaterials';
import { fetchJson, normalizeBackendUrl } from '../lib/safeFetch';
import type { Song, EventConfig, VenueProfile } from '../types/game';
import { VENUE_PROFILES_KEY } from '../types/game';
import type { Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : window.location.origin);
const BACKEND_CONFIGURED = !!(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL);

interface GameCreated {
  code: string;
  joinUrl: string;
  gameType: string;
  eventConfig?: EventConfig;
  waitingRoom: { game: 'roll-call' | null; theme: string; hostMessage: string };
  songPool?: Song[];
  revealed?: Song[];
  trivia?: { questions: TriviaQuestion[] };
}

type HostTab = 'waiting' | 'call' | 'questions';

export default function Host() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [game, setGame] = useState<GameCreated | null>(null);
  const [hostMessage, setHostMessage] = useState('Starting soon…');
  const [songPool, setSongPool] = useState<Song[]>([]);
  const [revealed, setRevealed] = useState<Song[]>([]);
  const [activeTab, setActiveTab] = useState<HostTab>('waiting');
  const [factSong, setFactSong] = useState<Song | null>(null);
  const [showFact, setShowFact] = useState(false);
  // Generate songs form
  const [genPrompt, setGenPrompt] = useState('');
  const [genApiKey, setGenApiKey] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  // Trivia: host's selected/ordered questions; which pack was used to create (for "Reset to full pack")
  const [triviaQuestions, setTriviaQuestions] = useState<TriviaQuestion[]>([]);
  const [selectedTriviaPackId, setSelectedTriviaPackId] = useState<string>(() => defaultTriviaPacks[0]?.id ?? 'music-general');
  const [triviaPackForGame, setTriviaPackForGame] = useState<TriviaPack | null>(null);
  const [printBingoCount, setPrintBingoCount] = useState<string>('50');
  const [waitingRoomTheme, setWaitingRoomTheme] = useState<string>('default');
  const [createPending, setCreatePending] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const createTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Event & venue: full config, scrape, venue profiles
  const [eventConfig, setEventConfigState] = useState<EventConfig>(() => ({
    gameTitle: 'Music Bingo',
    accentColor: '#e94560',
  }));
  const [venueProfiles, setVenueProfiles] = useState<VenueProfile[]>(() => {
    try {
      const raw = localStorage.getItem(VENUE_PROFILES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [loadedProfileId, setLoadedProfileId] = useState<string | null>(null);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeSuccess, setScrapeSuccess] = useState<string | null>(null);
  const [eventConfigAppliedFeedback, setEventConfigAppliedFeedback] = useState(false);
  const [backendReachable, setBackendReachable] = useState<boolean | null>(null);
  const apiBase = normalizeBackendUrl(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '');

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));

    s.on('game:created', (payload: GameCreated) => {
      if (createTimeoutRef.current) clearTimeout(createTimeoutRef.current);
      createTimeoutRef.current = null;
      setCreatePending(false);
      setCreateError(null);
      setGame(payload);
      setHostMessage(payload.waitingRoom?.hostMessage || 'Starting soon…');
      setWaitingRoomTheme(payload.waitingRoom?.theme || 'default');
      setSongPool(Array.isArray(payload.songPool) ? payload.songPool : []);
      setRevealed(Array.isArray(payload.revealed) ? payload.revealed : []);
      if (payload.eventConfig && typeof payload.eventConfig === 'object') {
        setEventConfigState((prev) => ({ ...prev, ...payload.eventConfig }));
      }
      if (payload.trivia?.questions?.length) {
        setTriviaQuestions(payload.trivia.questions);
      } else {
        setTriviaQuestions([]);
      }
    });

    s.on('game:event-config-updated', (data: { eventConfig?: EventConfig }) => {
      if (data.eventConfig && typeof data.eventConfig === 'object') {
        setEventConfigState((prev) => ({ ...prev, ...data.eventConfig }));
      }
    });

    s.on('game:trivia-state', (payload: { questions?: TriviaQuestion[] }) => {
      if (Array.isArray(payload.questions)) setTriviaQuestions(payload.questions);
    });

    s.on('game:waiting-room-updated', () => {});

    s.on('game:songs-updated', ({ songPool: pool }: { songPool: Song[] }) => {
      setSongPool(Array.isArray(pool) ? pool : []);
    });

    s.on('game:revealed', ({ revealed: rev }: { revealed: Song[] }) => {
      setRevealed(Array.isArray(rev) ? rev : []);
      if (rev.length > 0) {
        setFactSong(rev[rev.length - 1]);
        setShowFact(true);
      }
    });

    return () => {
      s.off('connect');
      s.off('disconnect');
      s.off('game:created');
      s.off('game:event-config-updated');
      s.off('game:waiting-room-updated');
      s.off('game:songs-updated');
      s.off('game:revealed');
      s.off('game:trivia-state');
    };
  }, []);

  useEffect(() => {
    if (!apiBase) {
      setBackendReachable(null);
      return;
    }
    fetchJson<{ ok?: boolean }>(`${apiBase}/health`)
      .then((r) => setBackendReachable(r.ok === true && r.data?.ok === true))
      .catch(() => setBackendReachable(false));
  }, [apiBase]);

  const createGame = (gameType: 'music-bingo' | 'trivia') => {
    if (!socket) return;
    setGame(null);
    setTriviaPackForGame(null);
    setCreateError(null);
    setCreatePending(true);
    const initialEventConfig: EventConfig =
      gameType === 'trivia'
        ? { ...eventConfig, gameTitle: 'Trivia' }
        : { ...eventConfig, gameTitle: eventConfig.gameTitle || 'The Playroom' };
    if (gameType === 'trivia') {
      const pack = defaultTriviaPacks.find(p => p.id === selectedTriviaPackId) ?? defaultTriviaPacks[0];
      setTriviaPackForGame(pack);
      socket.emit('host:create', {
        baseUrl: window.location.origin,
        gameType: 'trivia',
        eventConfig: { ...initialEventConfig, gameTitle: pack.title },
        questions: pack.questions,
      });
    } else {
      socket.emit('host:create', {
        baseUrl: window.location.origin,
        gameType: 'music-bingo',
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

  useEffect(() => {
    if (!socket || !game) return;
    socket.emit('host:set-waiting-room', {
      code: game.code,
      game: 'roll-call',
      theme: waitingRoomTheme,
      hostMessage,
    });
  }, [socket, game?.code, hostMessage, waitingRoomTheme]);

  const startEvent = () => {
    if (!socket || !game) return;
    if (game.gameType === 'trivia') {
      socket.emit('host:trivia-start', { code: game.code });
    } else {
      socket.emit('host:start', { code: game.code });
    }
  };

  const syncTriviaQuestions = useCallback(
    (questions: TriviaQuestion[]) => {
      if (!socket || !game || game.gameType !== 'trivia') return;
      socket.emit('host:set-trivia-questions', { code: game.code, questions });
    },
    [socket, game]
  );

  const toggleTriviaQuestion = (index: number) => {
    const next = triviaQuestions.filter((_, i) => i !== index);
    setTriviaQuestions(next);
    syncTriviaQuestions(next);
  };

  const moveTriviaQuestion = (index: number, dir: 'up' | 'down') => {
    const newIndex = dir === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= triviaQuestions.length) return;
    const next = [...triviaQuestions];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    setTriviaQuestions(next);
    syncTriviaQuestions(next);
  };

  const applyEventConfig = useCallback(() => {
    if (!socket || !game?.code) return;
    socket.emit('host:set-event-config', { code: game.code, eventConfig });
  }, [socket, game?.code, eventConfig]);

  const pushEventConfigToGame = useCallback(() => {
    if (!socket || !game?.code) return;
    socket.emit('host:set-event-config', { code: game.code, eventConfig });
    setEventConfigAppliedFeedback(true);
    setTimeout(() => setEventConfigAppliedFeedback(false), 3000);
  }, [socket, game?.code, eventConfig]);

  const scrapeVenue = useCallback(() => {
    const url = scrapeUrl.trim();
    if (!url) return;
    setScraping(true);
    setScrapeError(null);
    setScrapeSuccess(null);
    const apiUrl = apiBase ? `${apiBase}/api/scrape-site?url=${encodeURIComponent(url)}` : '';
    if (!apiUrl) {
      setScrapeError(
        'Backend URL not set. Add VITE_SOCKET_URL or VITE_API_URL and redeploy. You can add logo and details manually below.'
      );
      setScraping(false);
      return;
    }
    type ScrapeData = {
      logoUrl?: string | null;
      colors?: string[];
      title?: string | null;
      description?: string | null;
      error?: string;
      foodMenuUrl?: string | null;
      drinkMenuUrl?: string | null;
      eventsUrl?: string | null;
      facebookUrl?: string | null;
      instagramUrl?: string | null;
    };
    fetchJson<ScrapeData>(apiUrl).then((result) => {
      setScraping(false);
      if (!result.ok || result.error) {
        const msg =
          result.error ??
          (typeof result.data?.error === 'string' ? result.data.error : 'Request failed.');
        setScrapeError(msg + ' You can add logo, title, and colors manually below.');
        return;
      }
      const data = result.data;
      if (!data) {
        setScrapeError('Server did not return valid JSON. You can add details manually below.');
        return;
      }
      if (data.error) {
        setScrapeError(data.error + ' You can add details manually below.');
        return;
      }
      const updates: Partial<EventConfig> = {};
      if (data.logoUrl) updates.logoUrl = data.logoUrl;
      if (data.colors?.[0]) updates.accentColor = data.colors[0];
      if (data.title) {
        updates.gameTitle = data.title;
        if (!eventConfig.venueName) updates.venueName = data.title;
      }
      if (data.description) updates.promoText = data.description;
      if (data.foodMenuUrl) updates.foodMenuUrl = data.foodMenuUrl ?? undefined;
      if (data.drinkMenuUrl) updates.drinkMenuUrl = data.drinkMenuUrl ?? undefined;
      if (data.eventsUrl) updates.eventsUrl = data.eventsUrl ?? undefined;
      if (data.facebookUrl) updates.facebookUrl = data.facebookUrl ?? undefined;
      if (data.instagramUrl) updates.instagramUrl = data.instagramUrl ?? undefined;
      setEventConfigState((c) => ({ ...c, ...updates }));
      setGame((g) => (g ? { ...g, eventConfig: { ...g.eventConfig, ...updates } } : null));
      const parts: string[] = [];
      if (updates.logoUrl) parts.push('logo');
      if (updates.accentColor) parts.push('color');
      if (updates.gameTitle) parts.push('title');
      if (updates.promoText) parts.push('description');
      if (updates.foodMenuUrl) parts.push('food menu');
      if (updates.drinkMenuUrl) parts.push('drink menu');
      if (updates.eventsUrl) parts.push('events');
      if (updates.facebookUrl) parts.push('Facebook');
      if (updates.instagramUrl) parts.push('Instagram');
      setScrapeSuccess(
        parts.length
          ? `Fetched ${parts.join(', ')}. Review below and click "Apply event details to game" to show on display and players.`
          : 'No logo or theme found on that page. You can add them manually below.'
      );
      setTimeout(() => setScrapeSuccess(null), 6000);
    });
  }, [scrapeUrl, apiBase, eventConfig.venueName]);

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const logoUrl = reader.result as string;
      setEventConfigState((c) => ({ ...c, logoUrl }));
      setGame((g) => (g ? { ...g, eventConfig: { ...g.eventConfig, logoUrl } } : null));
    };
    reader.readAsDataURL(file);
  };

  const saveVenueProfile = () => {
    const name = eventConfig.venueName || eventConfig.gameTitle || 'Untitled Venue';
    const profile: VenueProfile = {
      id: `v-${Date.now()}`,
      name,
      gameTitle: eventConfig.gameTitle,
      venueName: eventConfig.venueName,
      logoUrl: eventConfig.logoUrl,
      accentColor: eventConfig.accentColor,
      drinkSpecials: eventConfig.drinkSpecials,
      foodSpecials: eventConfig.foodSpecials,
      themeLabel: eventConfig.themeLabel,
      promoText: eventConfig.promoText,
      bannerImageUrl: eventConfig.bannerImageUrl,
      facebookUrl: eventConfig.facebookUrl,
      instagramUrl: eventConfig.instagramUrl,
      foodMenuUrl: eventConfig.foodMenuUrl,
      drinkMenuUrl: eventConfig.drinkMenuUrl,
      eventsUrl: eventConfig.eventsUrl,
      venueAllowedUseOfMenuDesign: eventConfig.venueAllowedUseOfMenuDesign,
    };
    const next = [...venueProfiles, profile];
    setVenueProfiles(next);
    try {
      localStorage.setItem(VENUE_PROFILES_KEY, JSON.stringify(next));
    } catch {}
  };

  const loadVenueProfile = (p: VenueProfile) => {
    setEventConfigState({
      gameTitle: p.gameTitle ?? '',
      venueName: p.venueName ?? '',
      logoUrl: p.logoUrl,
      accentColor: p.accentColor ?? '#e94560',
      drinkSpecials: p.drinkSpecials,
      foodSpecials: p.foodSpecials,
      themeLabel: p.themeLabel,
      promoText: p.promoText,
      bannerImageUrl: p.bannerImageUrl,
      facebookUrl: p.facebookUrl,
      instagramUrl: p.instagramUrl,
      foodMenuUrl: p.foodMenuUrl,
      drinkMenuUrl: p.drinkMenuUrl,
      eventsUrl: p.eventsUrl,
      venueAllowedUseOfMenuDesign: p.venueAllowedUseOfMenuDesign,
    });
    setLoadedProfileId(p.id);
  };

  const handleReveal = (song: Song) => {
    if (!socket || !game) return;
    socket.emit('host:reveal', { code: game.code, song });
  };

  const handleGenerateSongs = async () => {
    if (!game || !socket) return;
    setGenError('');
    setGenLoading(true);
    const base = API_BASE.replace(/\/$/, '');
    try {
      const result = await fetchJson<{ songs?: Song[]; error?: string }>(`${base}/api/generate-songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: genPrompt,
          count: 75,
          familyFriendly: false,
          apiKey: genApiKey || undefined,
        }),
      });
      if (!result.ok) throw new Error(result.error ?? result.data?.error ?? 'Failed to generate');
      const data = result.data;
      const songs = data?.songs;
      if (Array.isArray(songs) && songs.length >= 24) {
        socket.emit('host:set-songs', { code: game.code, songs });
        setSongPool(songs);
        setActiveTab('call');
      } else {
        setGenError('Need at least 24 songs.');
      }
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Failed to generate songs');
    } finally {
      setGenLoading(false);
    }
  };

  if (!connected) {
    return (
      <div style={{ padding: 24, maxWidth: 520 }}>
        <p style={{ fontSize: 12, color: BACKEND_CONFIGURED ? '#68d391' : '#f6ad55', marginBottom: 8 }}>
          {BACKEND_CONFIGURED ? '● Backend URL set in build' : '⚠ Backend URL not set in this build'}
        </p>
        <p><strong>Connecting to server…</strong></p>
        <p style={{ fontSize: 14, color: '#a0aec0', marginTop: 8 }}>
          {BACKEND_CONFIGURED
            ? 'If this never goes away, check that Railway is up and the URL in Netlify is correct (no trailing slash).'
            : 'This build did not have VITE_SOCKET_URL. In Netlify → Site configuration → Environment variables, set VITE_SOCKET_URL to your Railway URL (no trailing slash), then Deploys → Trigger deploy → Clear cache and deploy site.'}
        </p>
      </div>
    );
  }

  if (!game) {
    return (
      <div style={{ padding: 24, maxWidth: 520 }}>
        <p style={{ fontSize: 12, color: '#68d391', marginBottom: 4 }}>● Connected to server</p>
        {!BACKEND_CONFIGURED && (
          <p style={{ fontSize: 11, color: '#f6ad55', marginBottom: 8 }}>⚠ This build had no VITE_SOCKET_URL — set it in Netlify and redeploy for production.</p>
        )}
        <h2>Host a game</h2>
        <p>The waiting room will show Roll Call (marble game) until you start.</p>
        <p style={{ fontSize: 13, color: '#a0aec0', marginTop: 8 }}>
          Click <strong>Create Music Bingo</strong> to open the full host view: Waiting room, Call sheet, and share link.
        </p>
        {createError && (
          <p style={{ fontSize: 13, color: '#fc8181', marginTop: 8 }}>{createError}</p>
        )}
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => createGame('music-bingo')}
            disabled={createPending}
            style={{ padding: '12px 24px', marginRight: 8 }}
          >
            {createPending ? 'Creating…' : 'Create Music Bingo'}
          </button>
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Trivia pack</label>
            <select
              value={selectedTriviaPackId}
              onChange={(e) => setSelectedTriviaPackId(e.target.value)}
              style={{ padding: '8px 12px', minWidth: 220, marginRight: 8 }}
            >
              {defaultTriviaPacks.map((pack) => (
                <option key={pack.id} value={pack.id}>
                  {pack.title} ({pack.questions.length})
                </option>
              ))}
            </select>
            <button
              onClick={() => createGame('trivia')}
              disabled={createPending}
              style={{ padding: '12px 24px' }}
            >
              {createPending ? 'Creating…' : 'Create Trivia'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isTrivia = game.gameType === 'trivia';
  const tabs: { id: HostTab; label: string }[] = isTrivia
    ? [
        { id: 'waiting', label: 'Waiting room' },
        { id: 'questions', label: 'Questions' },
      ]
    : [
        { id: 'waiting', label: 'Waiting room' },
        { id: 'call', label: 'Call sheet' },
      ];

  const displayUrl = `${window.location.origin}/display/${game.code}`;

  return (
    <>
      <div style={{ padding: 24, maxWidth: 560 }}>
        <p style={{ marginTop: 0, marginBottom: 16 }}>
          <Link to="/" style={{ color: '#a0aec0', fontSize: 14, textDecoration: 'none' }}>← The Playroom</Link>
          <span style={{ fontSize: 12, color: '#68d391', marginLeft: 12 }}>● Connected</span>
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid #4a5568' }}>
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              style={{
                padding: '10px 16px',
                background: activeTab === id ? '#2d3748' : 'transparent',
                color: '#e2e8f0',
                border: 'none',
                borderBottom: activeTab === id ? '2px solid #48bb78' : '2px solid transparent',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: activeTab === id ? 600 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'waiting' && (
          <>
            <h2 style={{ marginTop: 0 }}>Waiting room</h2>
            <p style={{ color: '#a0aec0', fontSize: 14 }}>Share the link. Players see the waiting game until you start.</p>
            <p style={{ fontSize: 16, wordBreak: 'break-all', marginBottom: 4 }}>
              <a href={game.joinUrl} target="_blank" rel="noopener noreferrer">{game.joinUrl}</a>
            </p>
            <p style={{ fontSize: 13, color: '#718096', marginBottom: 20 }}>Room code: <strong>{game.code}</strong></p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Welcome message</label>
              <input
                type="text"
                value={hostMessage}
                onChange={(e) => setHostMessage(e.target.value)}
                style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }}
                placeholder="e.g. Starting soon…"
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Waiting room game</label>
              <select
                value={waitingRoomTheme}
                onChange={(e) => setWaitingRoomTheme(e.target.value)}
                style={{ padding: '8px 12px', minWidth: 220, width: '100%', maxWidth: 280, borderRadius: 6 }}
              >
                <option value="default">Roll Call — Marble maze</option>
                <option value="fidget">Stretch game</option>
                <option value="classic">Tilt maze — Classic</option>
                <option value="eighties">Tilt maze — Eighties</option>
                <option value="trivia">Tilt maze — Trivia</option>
                <option value="neon">Marble — Neon</option>
                <option value="vinyl">Marble — Vinyl</option>
                <option value="rock">Marble — Rock</option>
              </select>
            </div>

            <button onClick={startEvent} style={{ padding: '12px 24px', borderRadius: 8 }}>
              {game.gameType === 'trivia' ? 'Start trivia' : 'Start the game'}
            </button>

            <details style={{ marginTop: 24, border: '1px solid #4a5568', borderRadius: 8, overflow: 'hidden' }}>
              <summary style={{ padding: '12px 16px', cursor: 'pointer', background: '#2d3748', fontWeight: 600, fontSize: 14 }}>
                Event &amp; venue details
              </summary>
              <div style={{ padding: 16, borderTop: '1px solid #4a5568', fontSize: 14 }}>
                <p style={{ color: '#a0aec0', margin: '0 0 12px', fontSize: 13 }}>
                  Event details (including scraped data) are not shown on the display or player screens until you click &quot;Apply event details to game&quot; below.
                </p>
                <div style={{ marginBottom: 16 }}>
                  <button type="button" onClick={pushEventConfigToGame} disabled={!socket?.connected || !game?.code} style={{ padding: '10px 20px', marginRight: 8 }}>
                    Apply event details to game
                  </button>
                  {eventConfigAppliedFeedback && <span style={{ color: '#68d391', fontSize: 13 }} role="status">Applied — visible on display and players.</span>}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Game title</label>
                  <input type="text" value={eventConfig.gameTitle ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, gameTitle: e.target.value }))} onBlur={applyEventConfig} placeholder="Music Bingo" style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Venue name</label>
                  <input type="text" value={eventConfig.venueName ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, venueName: e.target.value }))} onBlur={applyEventConfig} placeholder="Venue name" style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Scrape venue site (URL for logo &amp; colors)</label>
                  {apiBase ? (
                    <p style={{ fontSize: 12, color: '#a0aec0', margin: '4px 0 8px' }} role="status">
                      Backend: {backendReachable === true ? 'connected' : backendReachable === false ? 'not reachable' : 'checking…'} ({apiBase})
                    </p>
                  ) : (
                    <p style={{ fontSize: 12, color: '#f6ad55', margin: '4px 0 8px' }} role="alert">Backend not set. Set VITE_SOCKET_URL and redeploy. You can add logo and details manually below.</p>
                  )}
                  <p style={{ fontSize: 12, color: '#a0aec0', margin: '0 0 8px' }}>We only fetch public meta tags. Use only with sites you have permission to reference.</p>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input type="url" value={scrapeUrl} onChange={(e) => { setScrapeUrl(e.target.value); setScrapeError(null); }} placeholder="https://example.com" style={{ flex: 1, padding: 8, borderRadius: 6 }} />
                    <button type="button" onClick={scrapeVenue} disabled={scraping || !scrapeUrl.trim()} style={{ padding: '8px 16px' }}>{scraping ? '…' : 'Fetch'}</button>
                  </div>
                  {scrapeError && <p style={{ color: '#fc8181', fontSize: 13, marginBottom: 8 }} role="alert">{scrapeError}</p>}
                  {scrapeSuccess && <p style={{ color: '#68d391', fontSize: 13, marginBottom: 8 }} role="status">{scrapeSuccess}</p>}
                  <p style={{ fontSize: 12, color: '#a0aec0', marginBottom: 12 }}>Or add logo, title, accent color, and description manually below.</p>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Logo / banner image</label>
                  <input type="file" accept="image/*" onChange={handleLogoFile} style={{ fontSize: 13 }} />
                  {eventConfig.logoUrl && <img src={eventConfig.logoUrl} alt="Venue" style={{ maxHeight: 60, marginTop: 8, display: 'block' }} />}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Accent color</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={eventConfig.accentColor ?? '#e94560'} onChange={(e) => setEventConfigState((c) => ({ ...c, accentColor: e.target.value }))} onBlur={applyEventConfig} style={{ width: 36, height: 28, padding: 0, border: '1px solid #4a5568', borderRadius: 6 }} />
                    <input type="text" value={eventConfig.accentColor ?? '#e94560'} onChange={(e) => setEventConfigState((c) => ({ ...c, accentColor: e.target.value }))} onBlur={applyEventConfig} style={{ width: 120, padding: 8, borderRadius: 6 }} />
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={eventConfig.useVenueLogoInCenter ?? false} onChange={(e) => setEventConfigState((c) => ({ ...c, useVenueLogoInCenter: e.target.checked }))} onBlur={applyEventConfig} />
                    <span>Use venue logo in center square (instead of &quot;FREE&quot;)</span>
                  </label>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Drink specials</label>
                  <textarea value={eventConfig.drinkSpecials ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, drinkSpecials: e.target.value }))} onBlur={applyEventConfig} placeholder="e.g. $5 drafts" rows={2} style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Food specials</label>
                  <textarea value={eventConfig.foodSpecials ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, foodSpecials: e.target.value }))} onBlur={applyEventConfig} placeholder="e.g. Half-price appetizers" rows={2} style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Theme label (for display)</label>
                  <input type="text" value={eventConfig.themeLabel ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, themeLabel: e.target.value }))} onBlur={applyEventConfig} placeholder="e.g. 80s, Classic Rock" style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Welcome title</label>
                  <input type="text" value={eventConfig.welcomeTitle ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, welcomeTitle: e.target.value }))} onBlur={applyEventConfig} placeholder="e.g. Welcome" style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Welcome message</label>
                  <textarea value={eventConfig.welcomeMessage ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, welcomeMessage: e.target.value }))} onBlur={applyEventConfig} placeholder="e.g. Thanks for coming!" rows={2} style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Welcome background image (optional URL)</label>
                  <input type="url" value={eventConfig.welcomeImageUrl ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, welcomeImageUrl: e.target.value }))} onBlur={applyEventConfig} placeholder="https://…" style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Promo / upcoming events</label>
                  <textarea value={eventConfig.promoText ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, promoText: e.target.value }))} onBlur={applyEventConfig} placeholder="e.g. Karaoke Friday · Trivia Tuesday" rows={2} style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Banner image URL (promo / social)</label>
                  <input type="url" value={eventConfig.bannerImageUrl ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, bannerImageUrl: e.target.value.trim() || undefined }))} onBlur={applyEventConfig} placeholder="https://…" style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Facebook / Instagram</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input type="url" value={eventConfig.facebookUrl ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, facebookUrl: e.target.value }))} onBlur={applyEventConfig} placeholder="Facebook URL" style={{ flex: 1, minWidth: 140, padding: 8, borderRadius: 6 }} />
                    <input type="url" value={eventConfig.instagramUrl ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, instagramUrl: e.target.value }))} onBlur={applyEventConfig} placeholder="Instagram URL" style={{ flex: 1, minWidth: 140, padding: 8, borderRadius: 6 }} />
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Food menu URL (optional)</label>
                  <input type="url" value={eventConfig.foodMenuUrl ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, foodMenuUrl: e.target.value.trim() || undefined }))} onBlur={applyEventConfig} placeholder="https://…" style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Drink menu URL (optional)</label>
                  <input type="url" value={eventConfig.drinkMenuUrl ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, drinkMenuUrl: e.target.value.trim() || undefined }))} onBlur={applyEventConfig} placeholder="https://…" style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Events page URL (optional)</label>
                  <input type="url" value={eventConfig.eventsUrl ?? ''} onChange={(e) => setEventConfigState((c) => ({ ...c, eventsUrl: e.target.value.trim() || undefined }))} onBlur={applyEventConfig} placeholder="https://…" style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={eventConfig.venueAllowedUseOfMenuDesign ?? false} onChange={(e) => setEventConfigState((c) => ({ ...c, venueAllowedUseOfMenuDesign: e.target.checked || undefined }))} onBlur={applyEventConfig} />
                    Venue allowed use of menu design
                  </label>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 16 }}>
                  <p style={{ fontSize: 12, color: '#a0aec0', margin: 0 }}>Saved profiles are stored on this device only.</p>
                  <button type="button" onClick={saveVenueProfile} style={{ padding: '8px 16px' }}>Save venue profile</button>
                  {venueProfiles.length > 0 && (
                    <select value={loadedProfileId ?? ''} onChange={(e) => { const id = e.target.value; if (!id) return; const p = venueProfiles.find((v) => v.id === id); if (p) loadVenueProfile(p); }} style={{ padding: '8px 12px', minWidth: 160, borderRadius: 6 }}>
                      <option value="">Load venue…</option>
                      {venueProfiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
            </details>
          </>
        )}

        {activeTab === 'questions' && (
          <div style={{ padding: '16px 0' }}>
            <h3 style={{ marginTop: 0 }}>Trivia questions</h3>
            <p style={{ color: '#a0aec0', fontSize: 14 }}>
              Remove questions you don’t want. Use Up/Down to reorder. {triviaQuestions.length} in game.
            </p>
            <button
              type="button"
              onClick={() => {
                const full = triviaPackForGame?.questions ?? triviaQuestions;
                setTriviaQuestions(full);
                syncTriviaQuestions(full);
              }}
              style={{ marginBottom: 12, padding: '8px 16px', fontSize: 14 }}
            >
              Reset to full pack ({triviaPackForGame?.questions.length ?? triviaQuestions.length} questions)
            </button>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '50vh', overflowY: 'auto' }}>
              {triviaQuestions.map((q, idx) => (
                <li
                  key={`${idx}-${q.question.slice(0, 30)}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 0',
                    borderBottom: '1px solid #2d3748',
                  }}
                >
                  <span style={{ flex: 1, fontSize: 14 }}>{q.question}</span>
                  <button
                    type="button"
                    onClick={() => moveTriviaQuestion(idx, 'up')}
                    disabled={idx === 0}
                    style={{ padding: '4px 8px', fontSize: 12 }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTriviaQuestion(idx, 'down')}
                    disabled={idx === triviaQuestions.length - 1}
                    style={{ padding: '4px 8px', fontSize: 12 }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleTriviaQuestion(idx)}
                    style={{ padding: '4px 8px', fontSize: 12, color: '#fc8181' }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            {triviaQuestions.length === 0 && (
              <p style={{ color: '#a0aec0' }}>No questions. Reset to full pack to add some.</p>
            )}
          </div>
        )}

        {activeTab === 'call' && (
          <>
            {songPool.length === 0 ? (
              <div style={{ padding: '16px 0' }}>
                <h3 style={{ marginTop: 0 }}>Generate song list</h3>
                <p style={{ color: '#a0aec0', fontSize: 14 }}>Create 75 songs for this game. You need an OpenAI API key.</p>
                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Theme / prompt (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 80s hits, country, beach vibes"
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    style={{ width: '100%', padding: 8, marginBottom: 8 }}
                  />
                  <label style={{ display: 'block', marginBottom: 4 }}>OpenAI API key</label>
                  <input
                    type="password"
                    placeholder="sk-…"
                    value={genApiKey}
                    onChange={(e) => setGenApiKey(e.target.value)}
                    style={{ width: '100%', padding: 8, marginBottom: 8 }}
                  />
                  {genError && <p style={{ color: '#fc8181', fontSize: 14 }}>{genError}</p>}
                  <button
                    type="button"
                    onClick={handleGenerateSongs}
                    disabled={genLoading}
                    style={{ padding: '12px 24px' }}
                  >
                    {genLoading ? 'Generating…' : 'Generate 75 songs'}
                  </button>
                </div>
              </div>
            ) : (
              <HostSongGrid
                songPool={songPool}
                revealed={revealed}
                onReveal={handleReveal}
                eventTitle={game.eventConfig?.gameTitle}
              />
            )}
          </>
        )}

        {/* TV display link — optional */}
        <details style={{ marginTop: 24, border: '1px solid #4a5568', borderRadius: 8, overflow: 'hidden' }}>
          <summary style={{ padding: '12px 16px', cursor: 'pointer', background: '#2d3748', fontWeight: 600, fontSize: 14 }}>
            TV display &amp; links
          </summary>
          <div style={{ padding: 16, borderTop: '1px solid #4a5568' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#a0aec0' }}>Use the display URL on your TV or projector so players see the main view.</p>
            <p style={{ fontSize: 14, wordBreak: 'break-all' }}>
              <a href={displayUrl} target="_blank" rel="noopener noreferrer">{displayUrl}</a>
            </p>
          </div>
        </details>

        {/* Print materials — dropdown */}
        <details style={{ marginTop: 12, border: '1px solid #4a5568', borderRadius: 8, overflow: 'hidden' }}>
          <summary style={{ padding: '12px 16px', cursor: 'pointer', background: '#2d3748', fontWeight: 600 }}>
            Print materials
          </summary>
          <div style={{ padding: 16, borderTop: '1px solid #4a5568' }}>
            <p style={{ color: '#a0aec0', fontSize: 14, marginTop: 0 }}>
              For players without phones or devices. Generate and print from your browser.
            </p>

            {game.gameType === 'music-bingo' && (
              <div style={{ marginBottom: 24, padding: 16, border: '1px solid #4a5568', borderRadius: 8 }}>
                <h4 style={{ margin: '0 0 8px 0' }}>Bingo cards</h4>
                <p style={{ fontSize: 13, color: '#a0aec0', margin: '0 0 12px 0' }}>
                  Cards are randomized from your 75-song playlist. Each card has 24 unique songs + FREE space. No repeats on a card.
                </p>
                {songPool.length < 24 ? (
                  <p style={{ color: '#ecc94b', fontSize: 14 }}>Add or generate a song list first (Call sheet tab). You need at least 24 songs.</p>
                ) : (
                  <>
                    <label style={{ display: 'block', marginBottom: 4 }}>Number of cards to print</label>
                    <input
                      type="number"
                      min={1}
                      max={2000}
                      value={printBingoCount}
                      onChange={(e) => setPrintBingoCount(e.target.value)}
                      style={{ width: 120, padding: 8, marginRight: 8 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const n = Math.min(2000, Math.max(1, parseInt(printBingoCount, 10) || 50));
                        setPrintBingoCount(String(n));
                        printBingoCards(songPool, n, game.eventConfig?.gameTitle);
                      }}
                      style={{ padding: '10px 20px' }}
                    >
                      Print {printBingoCount || '50'} bingo cards
                    </button>
                    <p style={{ fontSize: 12, color: '#718096', marginTop: 8 }}>
                      A new window will open with the cards. Use your browser&apos;s Print (e.g. Ctrl+P / Cmd+P). 2 cards per page.
                    </p>
                  </>
                )}
              </div>
            )}

            {game.gameType === 'trivia' && (
              <>
                <div style={{ marginBottom: 24, padding: 16, border: '1px solid #4a5568', borderRadius: 8 }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Quiz sheet</h4>
                  <p style={{ fontSize: 13, color: '#a0aec0', margin: '0 0 12px 0' }}>
                    Print the current trivia questions as a paper quiz (questions + space for answers).
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const doc = buildTriviaQuizPrintDocument(triviaQuestions, game.eventConfig?.gameTitle);
                      const w = window.open('', '_blank');
                      if (!w) { alert('Please allow pop-ups to print.'); return; }
                      w.document.write(doc);
                      w.document.close();
                      w.focus();
                      w.onload = () => w.print();
                    }}
                    disabled={triviaQuestions.length === 0}
                    style={{ padding: '10px 20px' }}
                  >
                    Print quiz ({triviaQuestions.length} questions)
                  </button>
                </div>
                <div style={{ padding: 16, border: '1px solid #4a5568', borderRadius: 8 }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Flashcards</h4>
                  <p style={{ fontSize: 13, color: '#a0aec0', margin: '0 0 12px 0' }}>
                    Print questions on one side and answers on the other (cut and fold).
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const doc = buildFlashcardsPrintDocument(triviaQuestions, game.eventConfig?.gameTitle);
                      const w = window.open('', '_blank');
                      if (!w) { alert('Please allow pop-ups to print.'); return; }
                      w.document.write(doc);
                      w.document.close();
                      w.focus();
                      w.onload = () => w.print();
                    }}
                    disabled={triviaQuestions.length === 0}
                    style={{ padding: '10px 20px' }}
                  >
                    Print flashcards ({triviaQuestions.length})
                  </button>
                </div>
              </>
            )}
          </div>
        </details>
      </div>
      <SongFactPopUp
        song={factSong}
        show={showFact}
        onDismiss={() => setShowFact(false)}
      />
    </>
  );
}
