import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/host-create.css';
import { getSocket } from '../lib/socket';
import HostSongGrid from '../components/HostSongGrid';
import SongFactPopUp from '../components/SongFactPopUp';
import { defaultTriviaPacks } from '../data/triviaPacks';
import type { TriviaPack, TriviaQuestion } from '../data/triviaPacks';
import { icebreakerPacks, defaultIcebreakerPack } from '../data/icebreakerPacks';
import { edutainmentPacks, defaultEdutainmentPack } from '../data/edutainmentPacks';
import { teamBuildingPacks, defaultTeamBuildingPack } from '../data/teamBuildingActivities';
import { musicBingoGames } from '../data/musicBingoGames';
import { printBingoCards } from '../lib/printBingoCards';
import { PLAYROOM_HOST_CREATED_KEY } from './TriviaBuilder';
import { buildTriviaQuizPrintDocument, buildFlashcardsPrintDocument } from '../lib/printMaterials';
import { TimerPill } from '../components/trivia-room';
import { fetchJson, normalizeBackendUrl } from '../lib/safeFetch';
import type { Song, EventConfig, VenueProfile } from '../types/game';
import { VENUE_PROFILES_KEY } from '../types/game';
import type { Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : window.location.origin);
const BACKEND_CONFIGURED = !!(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL);

const HOST_TOKEN_KEY = (code: string) => `playroom:hostToken:${code}`;

interface GameCreated {
  code: string;
  hostToken?: string;
  joinUrl: string;
  gameType: string;
  eventConfig?: EventConfig;
  waitingRoom: { game: 'roll-call' | 'fidget' | null; theme: string; hostMessage: string };
  songPool?: Song[];
  revealed?: Song[];
  trivia?: { questions: TriviaQuestion[] };
}

type HostTab = 'waiting' | 'call' | 'questions' | 'controls';

export type CreateMode = 'music-bingo' | 'classic-bingo' | 'trivia' | 'icebreakers' | 'edutainment' | 'team-building';

function createModeFromUrl(type: string | null): CreateMode {
  if (type === 'bingo' || type === 'music-bingo') return 'music-bingo';
  if (type === 'classic-bingo') return 'classic-bingo';
  if (type === 'trivia' || type === 'icebreakers' || type === 'edutainment' || type === 'team-building') return type;
  return 'music-bingo';
}

export default function Host() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  const [createMode, setCreateMode] = useState<CreateMode>(() => createModeFromUrl(typeFromUrl));
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [game, setGame] = useState<GameCreated | null>(null);
  const [hostMessage, setHostMessage] = useState('Starting soon…');
  const [copyFeedback, setCopyFeedback] = useState(false);
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
  const [selectedTriviaPackId] = useState<string>(() => defaultTriviaPacks[0]?.id ?? 'music-general');
  const [selectedIcebreakerPackId, setSelectedIcebreakerPackId] = useState<string>(() => defaultIcebreakerPack?.id ?? 'corporate');
  const [selectedEdutainmentPackId, setSelectedEdutainmentPackId] = useState<string>(() => defaultEdutainmentPack?.id ?? 'k5-general');
  const [selectedTeamBuildingPackId, setSelectedTeamBuildingPackId] = useState<string>(() => defaultTeamBuildingPack?.id ?? 'team-building-activities');
  const [selectedPrebuiltGameId, setSelectedPrebuiltGameId] = useState<string | null>(null);
  const [triviaPackForGame, setTriviaPackForGame] = useState<TriviaPack | null>(null);
  const [printBingoCount, setPrintBingoCount] = useState<string>('50');
  const [waitingRoomTheme, setWaitingRoomTheme] = useState<string>('default');
  const [createPending, setCreatePending] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [triviaCurrentIndex, setTriviaCurrentIndex] = useState(0);
  const [triviaRevealed, setTriviaRevealed] = useState(false);
  const [triviaSettings, setTriviaSettings] = useState({ leaderboardsVisibleToPlayers: true, leaderboardsVisibleOnDisplay: true, autoAdvanceEnabled: false, mcTipsEnabled: true });
  const [triviaQuestionStartAt, setTriviaQuestionStartAt] = useState<string | null>(null);
  const [triviaTimeLimitSec, setTriviaTimeLimitSec] = useState<number | null>(null);
  const createTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prebuiltSongsRef = useRef<Song[] | null>(null);
  const gameRef = useRef<GameCreated | null>(null);
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
    const mode = createModeFromUrl(typeFromUrl);
    if (mode !== createMode) setCreateMode(mode);
  }, [typeFromUrl]);

  // Restore game when returning from Trivia Builder (Create & host)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PLAYROOM_HOST_CREATED_KEY);
      if (!raw) return;
      const payload = JSON.parse(raw) as GameCreated;
      sessionStorage.removeItem(PLAYROOM_HOST_CREATED_KEY);
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
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    s.on('connect', () => {
      setConnected(true);
      const current = gameRef.current;
      if (!current?.code) return;
      const token = localStorage.getItem(HOST_TOKEN_KEY(current.code));
      if (!token) return;
      s.emit('host:resume', { code: current.code, hostToken: token });
    });
    s.on('disconnect', () => setConnected(false));

    s.on('host:resume:ok', (payload: GameCreated) => {
      setGame(payload);
      setSongPool(payload.songPool ?? []);
      setRevealed(payload.revealed ?? []);
      setHostMessage(payload.waitingRoom?.hostMessage || 'Starting soon…');
      setWaitingRoomTheme(payload.waitingRoom?.theme || 'default');
      if (payload.eventConfig && typeof payload.eventConfig === 'object') {
        setEventConfigState((prev) => ({ ...prev, ...payload.eventConfig }));
      }
      if (payload.trivia?.questions?.length) setTriviaQuestions(payload.trivia.questions);
      else setTriviaQuestions([]);
    });

    s.on('game:created', (payload: GameCreated) => {
      if (createTimeoutRef.current) clearTimeout(createTimeoutRef.current);
      createTimeoutRef.current = null;
      setCreatePending(false);
      setCreateError(null);
      setGameStarted(false);
      setGame(payload);
      if (payload.hostToken && payload.code) {
        try {
          localStorage.setItem(HOST_TOKEN_KEY(payload.code), payload.hostToken);
        } catch {
          // ignore
        }
      }
      setHostMessage(payload.waitingRoom?.hostMessage || 'Starting soon…');
      setWaitingRoomTheme(payload.waitingRoom?.theme || 'default');
      const songsFromServer = Array.isArray(payload.songPool) ? payload.songPool : [];
      setSongPool(songsFromServer);
      setRevealed(Array.isArray(payload.revealed) ? payload.revealed : []);
      if (payload.eventConfig && typeof payload.eventConfig === 'object') {
        setEventConfigState((prev) => ({ ...prev, ...payload.eventConfig }));
      }
      if (payload.trivia?.questions?.length) {
        setTriviaQuestions(payload.trivia.questions);
      } else {
        setTriviaQuestions([]);
      }
      if (payload.gameType === 'music-bingo' && prebuiltSongsRef.current && prebuiltSongsRef.current.length >= 24) {
        const token = payload.hostToken ?? (payload.code ? localStorage.getItem(HOST_TOKEN_KEY(payload.code)) : null);
        s.emit('host:set-songs', { code: payload.code, hostToken: token ?? undefined, songs: prebuiltSongsRef.current });
        setSongPool(prebuiltSongsRef.current);
        prebuiltSongsRef.current = null;
      }
    });

    s.on('game:event-config-updated', (data: { eventConfig?: EventConfig }) => {
      if (data.eventConfig && typeof data.eventConfig === 'object') {
        setEventConfigState((prev) => ({ ...prev, ...data.eventConfig }));
      }
    });

    s.on('game:waiting-room-updated', (data: { waitingRoom?: GameCreated['waitingRoom'] }) => {
      if (data.waitingRoom) {
        setGame((prev) => (prev ? { ...prev, waitingRoom: data.waitingRoom! } : null));
      }
    });

    s.on('game:started', () => {
      setGameStarted(true);
      setActiveTab((prev) => (prev === 'waiting' ? 'controls' : prev));
    });

    s.on('game:trivia-state', (payload: { questions?: TriviaQuestion[]; currentIndex?: number; revealed?: boolean; settings?: { leaderboardsVisibleToPlayers?: boolean; leaderboardsVisibleOnDisplay?: boolean; autoAdvanceEnabled?: boolean; mcTipsEnabled?: boolean }; questionStartAt?: string | null; timeLimitSec?: number }) => {
      if (typeof payload.currentIndex === 'number') setTriviaCurrentIndex(payload.currentIndex);
      if (typeof payload.revealed === 'boolean') setTriviaRevealed(payload.revealed);
      if (payload.questionStartAt !== undefined) setTriviaQuestionStartAt(payload.questionStartAt ?? null);
      if (payload.timeLimitSec !== undefined) setTriviaTimeLimitSec(payload.timeLimitSec ?? null);
      if (payload.settings && typeof payload.settings === 'object') {
        setTriviaSettings((prev) => ({
          ...prev,
          leaderboardsVisibleToPlayers: payload.settings!.leaderboardsVisibleToPlayers ?? prev.leaderboardsVisibleToPlayers,
          leaderboardsVisibleOnDisplay: payload.settings!.leaderboardsVisibleOnDisplay ?? prev.leaderboardsVisibleOnDisplay,
          autoAdvanceEnabled: payload.settings!.autoAdvanceEnabled ?? prev.autoAdvanceEnabled,
          mcTipsEnabled: payload.settings!.mcTipsEnabled ?? prev.mcTipsEnabled,
        }));
      }
    });

    s.on('game:trivia-reveal', () => setTriviaRevealed(true));

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
      s.off('host:resume:ok');
      s.off('game:created');
      s.off('game:started');
      s.off('game:event-config-updated');
      s.off('game:waiting-room-updated');
      s.off('game:songs-updated');
      s.off('game:revealed');
      s.off('game:trivia-state');
      s.off('game:trivia-reveal');
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

  useEffect(() => {
    if (!socket || !game) return;
    socket.emit('host:set-waiting-room', {
      code: game.code,
      game: game.waitingRoom?.game ?? null,
      theme: waitingRoomTheme,
      hostMessage,
    });
  }, [socket, game?.code, hostMessage, waitingRoomTheme, game?.waitingRoom?.game]);

  const startEvent = () => {
    if (!socket || !game) return;
    const hostToken = game.code ? localStorage.getItem(HOST_TOKEN_KEY(game.code)) : null;
    const isTriviaLikeType = game.gameType === 'trivia' || game.gameType === 'icebreakers' || game.gameType === 'edutainment' || game.gameType === 'team-building';
    if (isTriviaLikeType) {
      socket.emit('host:trivia-start', { code: game.code, hostToken: hostToken ?? undefined });
    } else {
      socket.emit('host:start', { code: game.code, hostToken: hostToken ?? undefined });
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
        updates.venueName = data.title;
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
      if (updates.venueName) parts.push('venue name');
      if (updates.promoText) parts.push('description');
      if (updates.foodMenuUrl) parts.push('food menu');
      if (updates.drinkMenuUrl) parts.push('drink menu');
      if (updates.eventsUrl) parts.push('events');
      if (updates.facebookUrl) parts.push('Facebook');
      if (updates.instagramUrl) parts.push('Instagram');
      const eventsUrlToScrape = updates.eventsUrl || scrapeUrl;
      if (apiBase && eventsUrlToScrape) {
        fetchJson<{ events?: { month: number; day: number; title: string }[] }>(`${apiBase}/api/scrape-events?url=${encodeURIComponent(eventsUrlToScrape)}`)
          .then((res) => {
            if (res.ok && res.data?.events?.length) {
              const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              const lines = res.data.events.slice(0, 12).map((e) => `${MONTHS[e.month - 1]} ${e.day}: ${e.title}`);
              const eventsBlock = lines.join('\n');
              const newPromo = updates.promoText ? `${updates.promoText}\n\n${eventsBlock}` : eventsBlock;
              setEventConfigState((c) => ({ ...c, promoText: newPromo }));
              setGame((g) => (g ? { ...g, eventConfig: { ...g.eventConfig, promoText: newPromo } } : null));
              parts.push('events list');
            }
          })
          .catch(() => {});
      }
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
    const isBingo = createMode === 'music-bingo' || createMode === 'classic-bingo';
    const isPackMode = !isBingo;
    const selectedTriviaPack = defaultTriviaPacks.find((p) => p.id === selectedTriviaPackId) ?? defaultTriviaPacks[0];
    const selectedIcebreakerPack = icebreakerPacks.find((p) => p.id === selectedIcebreakerPackId) ?? defaultIcebreakerPack;
    const selectedEdutainmentPack = edutainmentPacks.find((p) => p.id === selectedEdutainmentPackId) ?? defaultEdutainmentPack;
    const selectedTeamBuildingPack = teamBuildingPacks.find((p) => p.id === selectedTeamBuildingPackId) ?? defaultTeamBuildingPack;
    const packForMode =
      createMode === 'trivia' ? selectedTriviaPack
      : createMode === 'icebreakers' ? (selectedIcebreakerPack ? { id: selectedIcebreakerPack.id, title: selectedIcebreakerPack.title, questions: selectedIcebreakerPack.prompts.map((pr) => ({ question: pr.text, correctAnswer: '', points: 1 })) } : null)
      : createMode === 'edutainment' ? selectedEdutainmentPack
      : createMode === 'team-building' ? selectedTeamBuildingPack
      : null;
    const packHasContent = packForMode && 'questions' in packForMode && packForMode.questions.length > 0;
    const canCreatePack = isPackMode && !!packHasContent;
    const canCreate = socket?.connected && (isBingo || canCreatePack);
    const step = isBingo ? (canCreate ? 3 : 1) : canCreate ? 3 : packForMode ? 2 : 1;

    const handleCreate = () => {
      if (createMode === 'music-bingo') {
        if (selectedPrebuiltGameId) {
          const prebuilt = musicBingoGames.find((g) => g.id === selectedPrebuiltGameId);
          if (prebuilt?.songs?.length === 75) prebuiltSongsRef.current = prebuilt.songs;
        } else {
          prebuiltSongsRef.current = null;
        }
        createGame('music-bingo');
      } else if (createMode === 'classic-bingo') createGame('classic-bingo');
      else createGame(createMode, packForMode as TriviaPack);
    };

    const createButtonLabel =
      createMode === 'music-bingo'
        ? 'Create Music Bingo'
        : createMode === 'classic-bingo'
          ? 'Create Classic Bingo'
          : createMode === 'trivia'
            ? 'Create Trivia'
            : createMode === 'icebreakers'
              ? 'Create Icebreakers'
              : createMode === 'edutainment'
                ? 'Create Edutainment'
                : 'Create Team Building';

    return (
      <div className="host-create">
        <p style={{ fontSize: 12, color: '#68d391', marginBottom: 8 }}>● Connected to server</p>
        {!BACKEND_CONFIGURED && (
          <p style={{ fontSize: 11, color: '#f6ad55', marginBottom: 8 }}>
            ⚠ Set VITE_SOCKET_URL in Netlify and redeploy for production.
          </p>
        )}
        <div className="host-create__progress" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3} aria-label="Creation progress">
          <span className={`host-create__progress-step ${step >= 1 ? 'host-create__progress-step--done' : ''}`}>1</span>
          <span className="host-create__progress-line" />
          <span className={`host-create__progress-step ${step >= 2 ? 'host-create__progress-step--done' : ''}`}>2</span>
          <span className="host-create__progress-line" />
          <span className={`host-create__progress-step ${step >= 3 ? 'host-create__progress-step--done' : ''}`}>3</span>
        </div>
        <p className="host-create__progress-labels">
          <span>Choose type</span>
          <span>Pick content</span>
          <span>Create</span>
        </p>
        <h1 className="host-create__title">Host a game</h1>
        <p className="host-create__sub">Choose your game type, then pick content. Share the QR or link so players can join.</p>
        <p className="host-create__sub host-create__sub--small">What do you want to run?</p>
        <div className="host-create__game-type">
          <button
            type="button"
            className={`host-create__game-type-btn ${createMode === 'music-bingo' ? 'host-create__game-type-btn--on' : ''}`}
            onClick={() => setCreateMode('music-bingo')}
          >
            Music Bingo
          </button>
          <button
            type="button"
            className={`host-create__game-type-btn ${createMode === 'classic-bingo' ? 'host-create__game-type-btn--on' : ''}`}
            onClick={() => setCreateMode('classic-bingo')}
          >
            Classic Bingo
          </button>
          <button
            type="button"
            className={`host-create__game-type-btn ${createMode === 'trivia' ? 'host-create__game-type-btn--on' : ''}`}
            onClick={() => setCreateMode('trivia')}
          >
            Trivia
          </button>
          <button
            type="button"
            className={`host-create__game-type-btn ${createMode === 'icebreakers' ? 'host-create__game-type-btn--on' : ''}`}
            onClick={() => setCreateMode('icebreakers')}
          >
            Icebreakers
          </button>
          <button
            type="button"
            className={`host-create__game-type-btn ${createMode === 'edutainment' ? 'host-create__game-type-btn--on' : ''}`}
            onClick={() => setCreateMode('edutainment')}
          >
            Edutainment
          </button>
          <button
            type="button"
            className={`host-create__game-type-btn ${createMode === 'team-building' ? 'host-create__game-type-btn--on' : ''}`}
            onClick={() => setCreateMode('team-building')}
          >
            Team Building
          </button>
        </div>

        {createMode === 'music-bingo' && (
          <>
            <div className="host-create__content host-create__packs-wrap">
              <label className="host-create__label">Pre-built game (optional)</label>
              <select
                className="host-create__select"
                value={selectedPrebuiltGameId ?? ''}
                onChange={(e) => setSelectedPrebuiltGameId(e.target.value || null)}
              >
                <option value="">I'll build with Call sheet / AI</option>
                {musicBingoGames.map((g) => (
                  <option key={g.id} value={g.id}>{g.title} — 75 songs</option>
                ))}
              </select>
              <p className="host-create__hint">
                Choose a pre-built game (75 songs, no duplicate artists) or leave blank to add songs from the Call sheet tab after creating.
              </p>
            </div>
            <p className="host-create__copy">
              {selectedPrebuiltGameId ? 'Create a room with the selected game. One link for everyone.' : 'Create a room and add 75 songs from the Call sheet tab (AI or theme). One link for everyone.'}
            </p>
          </>
        )}
        {createMode === 'classic-bingo' && (
          <p className="host-create__copy">
            Classic number bingo. Call sheet and grid on the display. One link for everyone.
          </p>
        )}
        {createMode === 'trivia' && (
          <>
            <p className="host-create__copy">
              Run a verified Trivia pack with one room code. Players join at the same link for the whole game. Preview questions, set host options, then start hosting.
            </p>
            <div className="host-create__content" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              <button
                type="button"
                className="host-create__btn-primary"
                onClick={() => navigate('/host/create?trivia')}
              >
                Choose pack & host
              </button>
              <Link to="/host/build/trivia" className="host-create__back" style={{ display: 'inline-block' }}>
                Build custom questions →
              </Link>
            </div>
          </>
        )}
        {createMode === 'icebreakers' && (
          <p className="host-create__copy">
            Pick an icebreaker pack below. Two Truths, Would You Rather, quick energizers. Low-stakes, high connection. One link for everyone.
          </p>
        )}
        {createMode === 'edutainment' && (
          <p className="host-create__copy">
            Pick a learning pack by grade band. K–college, curriculum-aligned. One link for the whole room.
          </p>
        )}
        {createMode === 'team-building' && (
          <p className="host-create__copy">
            Pick a pack by age, occupation, or situation. Remote teams, retreats, community. One link for everyone.
          </p>
        )}

        {isPackMode && createMode !== 'trivia' && (
          <div className="host-create__content host-create__packs-wrap">
            <label className="host-create__label">
              {createMode === 'icebreakers' && 'Icebreaker pack'}
              {createMode === 'edutainment' && 'Edutainment pack'}
              {createMode === 'team-building' && 'Team building pack'}
            </label>
            {createMode === 'icebreakers' && (
              <select className="host-create__select" value={selectedIcebreakerPackId} onChange={(e) => setSelectedIcebreakerPackId(e.target.value)}>
                {icebreakerPacks.map((pack) => (
                  <option key={pack.id} value={pack.id}>{pack.title} ({pack.prompts.length} prompts)</option>
                ))}
              </select>
            )}
            {createMode === 'edutainment' && (
              <select className="host-create__select" value={selectedEdutainmentPackId} onChange={(e) => setSelectedEdutainmentPackId(e.target.value)}>
                {edutainmentPacks.map((pack) => (
                  <option key={pack.id} value={pack.id}>{pack.title} ({pack.questions.length} questions)</option>
                ))}
              </select>
            )}
            {createMode === 'team-building' && (
              <select className="host-create__select" value={selectedTeamBuildingPackId} onChange={(e) => setSelectedTeamBuildingPackId(e.target.value)}>
                {teamBuildingPacks.map((pack) => (
                  <option key={pack.id} value={pack.id}>{pack.title} ({pack.questions.length} activities)</option>
                ))}
              </select>
            )}
            <p className="host-create__hint">
              {createMode === 'icebreakers' && 'Two Truths, Would You Rather, quick energizers.'}
              {createMode === 'edutainment' && 'Learning games by grade band. K–college.'}
              {createMode === 'team-building' && 'Activities by age, occupation, or situation.'}
            </p>
          </div>
        )}

        {createMode !== 'trivia' && (
          <>
            <button
              type="button"
              className="host-create__btn-primary"
              onClick={handleCreate}
              disabled={!canCreate || createPending}
            >
              {createPending ? 'Creating…' : createButtonLabel}
            </button>
            {createError && <p className="host-create__hint" style={{ color: 'var(--error, #fc8181)' }}>{createError}</p>}
            {!socket?.connected && <p className="host-create__hint">Waiting for connection…</p>}
          </>
        )}
        <Link to="/" className="host-create__back">← Back to home</Link>
      </div>
    );
  }

  const isTriviaLike = game.gameType === 'trivia' || game.gameType === 'icebreakers' || game.gameType === 'edutainment' || game.gameType === 'team-building';
  const tabs: { id: HostTab; label: string }[] = isTriviaLike
    ? [
        { id: 'waiting', label: 'Waiting room' },
        { id: 'controls', label: 'Host controls' },
        { id: 'questions', label: 'Questions' },
      ]
    : [
        { id: 'waiting', label: 'Waiting room' },
        { id: 'call', label: 'Call sheet' },
      ];

  const displayUrl = `${window.location.origin}/display/${game.code}`;
  // Always use current origin so QR and link point to the frontend (player view), not the backend
  const joinUrlForQR = typeof window !== 'undefined' ? `${window.location.origin}/join/${game.code}` : `/join/${game.code}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(joinUrlForQR)}`;

  const setWaitingRoomGame = (gameVal: 'roll-call' | 'fidget' | null) => {
    setGame((prev) => (prev ? { ...prev, waitingRoom: { ...prev.waitingRoom, game: gameVal } } : null));
    if (socket?.connected && game?.code) {
      socket.emit('host:set-waiting-room', { code: game.code, game: gameVal });
    }
  };

  return (
    <>
      <div className="host-room">
        <p className="host-room__breadcrumb">
          <Link to="/" className="host-room__breadcrumb-link">← The Playroom</Link>
          <span className="host-room__connected">● Connected</span>
        </p>

        <div className="host-room__wrap">
          <aside className="host-room__left">
            <p className="host-room__section-label">Share with players</p>
            <div className="host-room__qr-block">
              <img src={qrImageUrl} alt="" width={240} height={240} aria-label="QR code to join game" />
              <p className="host-room__qr-hint">Scan or open this link</p>
              <p className="host-room__qr-sub">One link for everyone</p>
            </div>
            <span className="host-room__badge">Game code</span>
            <span className="host-room__code">{game.code}</span>
            <div className="host-room__join-row">
              <a href={joinUrlForQR} target="_blank" rel="noopener noreferrer" className="host-room__join-url">
                {joinUrlForQR}
              </a>
              <button
                type="button"
                className="host-room__copy-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(joinUrlForQR).then(() => {
                    setCopyFeedback(true);
                    setTimeout(() => setCopyFeedback(false), 2000);
                  });
                }}
              >
                {copyFeedback ? 'Copied' : 'Copy'}
              </button>
            </div>
            <hr className="host-room__left-divider" />
            <span className="host-room__link-label">Quick actions</span>
            <div className="host-room__link-group">
              <a href={`/join/${game.code}`} target="_blank" rel="noopener noreferrer" className="host-room__link-btn" title="Same experience as scanning the QR code — for testing or sharing to your phone">
                Player view
              </a>
              <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="host-room__link-btn" title="Open this on the TV or projector — shows QR and game content">
                Display (TV)
              </a>
            </div>
            <p className="host-room__display-hint">Players scan the QR or use the link above. Open <strong>Display (TV)</strong> on your projector so everyone sees the code and questions.</p>
            <div className="host-room__actions">
              <button type="button" onClick={() => { setGame(null); setGameStarted(false); }} className="host-room__btn-secondary">
                End game
              </button>
              <Link to="/" className="host-room__back-link">← Back</Link>
            </div>
          </aside>

          <div className="host-room__right">
            <div className="host-room__right-head">
              <h1 className="host-room__right-title">Run the game</h1>
              <p className="host-room__right-sub">Set what players see while they wait, then start when you’re ready. You can change these anytime.</p>
            </div>
        <div className="host-room__tabs">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`host-room__tab ${activeTab === id ? 'host-room__tab--on' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'waiting' && (
          <>
            <section className="host-room__when" aria-label="When players join">
              <h2 className="host-room__when-title">While players join</h2>
              <p className="host-room__when-hint">Choose a mini-game and message. Players see this until you start.</p>
              <div className="host-room__field">
                <label className="host-room__label" htmlFor="host-waiting-minigame">Mini-game</label>
                <select
                  id="host-waiting-minigame"
                  className="host-room__select"
                  value={game.waitingRoom?.game ?? ''}
                  onChange={(e) => {
                    const val = e.target.value as '' | 'roll-call' | 'fidget';
                    setWaitingRoomGame(val === 'roll-call' || val === 'fidget' ? val : null);
                  }}
                >
                  <option value="">None</option>
                  <option value="roll-call">Roll Call (marble)</option>
                  <option value="fidget">Stretch game</option>
                </select>
              </div>
              <div className="host-room__field">
                <label className="host-room__label" htmlFor="host-waiting-message">Welcome message</label>
                <input
                  id="host-waiting-message"
                  type="text"
                  className="host-room__input"
                  value={hostMessage}
                  onChange={(e) => setHostMessage(e.target.value)}
                  placeholder="e.g. Starting soon · Welcome!"
                />
              </div>
              <div className="host-room__when-cta">
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
              </div>
            </section>

            <details className="host-room__details">
              <summary className="host-room__details-summary">Event &amp; venue details</summary>
              <div className="host-room__details-body">
                <p className="host-room__details-intro">
                  Event details are not shown on the display or player screens until you click &quot;Apply to game&quot; below.
                </p>
                <div style={{ marginBottom: 16 }}>
                  <button type="button" className="host-room__apply-btn" onClick={pushEventConfigToGame} disabled={!socket?.connected || !game?.code}>
                    Apply to game
                  </button>
                  {eventConfigAppliedFeedback && <span className="host-room__apply-feedback" role="status">Applied — visible on display and players.</span>}
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
                  <label style={{ display: 'block', marginBottom: 4 }}>Welcome title / message</label>
                  <input type="text" value={eventConfig.welcomeTitle ?? eventConfig.welcomeMessage ?? ''} onChange={(e) => { const v = e.target.value; setEventConfigState((c) => ({ ...c, welcomeTitle: v, welcomeMessage: v })); }} onBlur={applyEventConfig} placeholder="e.g. Welcome · Thanks for coming!" style={{ width: '100%', maxWidth: 400, padding: 8, borderRadius: 6 }} />
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
                  style={{ borderBottom: '1px solid #2d3748' }}
                >
                  <details style={{ padding: '8px 0' }}>
                    <summary style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', listStyle: 'none' }}>
                      <span style={{ flex: 1, fontSize: 14 }}>{q.question}</span>
                      {(q.hostNotes || q.funFact || q.category) && (
                        <span style={{ fontSize: 11, color: '#718096' }}>Notes</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); moveTriviaQuestion(idx, 'up'); }}
                        disabled={idx === 0}
                        style={{ padding: '4px 8px', fontSize: 12 }}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); moveTriviaQuestion(idx, 'down'); }}
                        disabled={idx === triviaQuestions.length - 1}
                        style={{ padding: '4px 8px', fontSize: 12 }}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); toggleTriviaQuestion(idx); }}
                        style={{ padding: '4px 8px', fontSize: 12, color: '#fc8181' }}
                      >
                        Remove
                      </button>
                    </summary>
                    <div style={{ padding: '8px 0 8px 12px', fontSize: 13, color: '#a0aec0', borderLeft: '2px solid #2d3748', marginLeft: 4 }}>
                      {q.category && <p style={{ margin: '0 0 4px' }}><strong>Category:</strong> {q.category}</p>}
                      {q.hostNotes && <p style={{ margin: '0 0 4px' }}><strong>Host:</strong> {q.hostNotes}</p>}
                      {q.funFact && <p style={{ margin: 0 }}><strong>Fun fact:</strong> {q.funFact}</p>}
                      {!q.category && !q.hostNotes && !q.funFact && <p style={{ margin: 0 }}>No notes for this question.</p>}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
            {triviaQuestions.length === 0 && (
              <p style={{ color: '#a0aec0' }}>No questions. Reset to full pack to add some.</p>
            )}
          </div>
        )}

        {activeTab === 'controls' && isTriviaLike && (
          <section className="host-controls" aria-label="Host controls">
            {!gameStarted ? (
              <div className="host-controls__prompt">
                <h2 className="host-controls__title">Host controls</h2>
                <p className="host-controls__hint">
                  Click <strong>Start the game</strong> in the <strong>Waiting room</strong> tab to begin. Then return here to ask each question, reveal the answer, share a fun fact, and move to the next.
                </p>
                <button
                  type="button"
                  className="host-room__start-btn"
                  onClick={() => setActiveTab('waiting')}
                >
                  Go to Waiting room
                </button>
              </div>
            ) : isTriviaLike ? (
              <>
                <h2 className="host-controls__title">Run the game</h2>
                <p className="host-controls__hint">
                  Show the question on the <strong>Display (TV)</strong>. When ready, reveal the answer, share a fun tip if you have one, and advance to the next question.
                </p>
                <div className="host-controls__card">
                  <div className="host-controls__meta">
                    <span className="host-controls__counter">
                      Question {triviaCurrentIndex + 1} of {triviaQuestions.length || 1}
                    </span>
                    {triviaQuestions[triviaCurrentIndex]?.category && (
                      <span className="host-controls__category">{triviaQuestions[triviaCurrentIndex].category}</span>
                    )}
                  </div>
                  {triviaSettings.mcTipsEnabled && triviaQuestions[triviaCurrentIndex]?.hostNotes && (
                    <div className="host-controls__host-notes">
                      <strong>MC tip:</strong> {triviaQuestions[triviaCurrentIndex].hostNotes}
                    </div>
                  )}
                  <p className="host-controls__question">
                    {triviaQuestions[triviaCurrentIndex]?.question ?? '—'}
                  </p>
                  {game.gameType === 'trivia' && (() => {
                    const token = game.code ? localStorage.getItem(HOST_TOKEN_KEY(game.code)) : null;
                    return (
                      <>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                          <input
                            type="checkbox"
                            checked={triviaSettings.leaderboardsVisibleToPlayers}
                            onChange={(e) => {
                              const v = e.target.checked;
                              setTriviaSettings((s) => ({ ...s, leaderboardsVisibleToPlayers: v }));
                              if (socket?.connected && game?.code) {
                                socket.emit('host:trivia-settings', { code: game.code, hostToken: token ?? undefined, settings: { ...triviaSettings, leaderboardsVisibleToPlayers: v } });
                              }
                            }}
                          />
                          Leaderboard to players
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                          <input
                            type="checkbox"
                            checked={triviaSettings.leaderboardsVisibleOnDisplay}
                            onChange={(e) => {
                              const v = e.target.checked;
                              setTriviaSettings((s) => ({ ...s, leaderboardsVisibleOnDisplay: v }));
                              if (socket?.connected && game?.code) {
                                socket.emit('host:trivia-settings', { code: game.code, hostToken: token ?? undefined, settings: { ...triviaSettings, leaderboardsVisibleOnDisplay: v } });
                              }
                            }}
                          />
                          Leaderboard on display
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                          <input
                            type="checkbox"
                            checked={triviaSettings.autoAdvanceEnabled}
                            onChange={(e) => {
                              const v = e.target.checked;
                              setTriviaSettings((s) => ({ ...s, autoAdvanceEnabled: v }));
                              if (socket?.connected && game?.code) {
                                socket.emit('host:trivia-settings', { code: game.code, hostToken: token ?? undefined, settings: { ...triviaSettings, autoAdvanceEnabled: v } });
                              }
                            }}
                          />
                          Auto-advance on timer
                        </label>
                      </div>
                      {!triviaRevealed && triviaQuestionStartAt && (triviaTimeLimitSec ?? 0) > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <TimerPill
                            questionStartAt={triviaQuestionStartAt}
                            timeLimitSec={triviaTimeLimitSec ?? 30}
                            active
                            onExpire={() => {
                              if (triviaSettings.autoAdvanceEnabled && socket?.connected && game?.code) {
                                socket.emit('host:trivia-reveal', { code: game.code, hostToken: token ?? undefined });
                              }
                            }}
                          />
                        </div>
                      )}
                      </>
                    );
                  })()}
                  {triviaRevealed && (
                    <div className="host-controls__revealed">
                      <p className="host-controls__answer">
                        Answer: {triviaQuestions[triviaCurrentIndex]?.correctAnswer ?? '—'}
                      </p>
                      {triviaQuestions[triviaCurrentIndex]?.funFact && (
                        <p className="host-controls__fun-fact">
                          Fun fact: {triviaQuestions[triviaCurrentIndex].funFact}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="host-controls__actions">
                  {!triviaRevealed ? (
                    <button
                      type="button"
                      className="host-controls__btn host-controls__btn--primary"
                      onClick={() => socket?.emit('host:trivia-reveal', { code: game.code })}
                      disabled={!socket?.connected || !game?.code}
                    >
                      Reveal answer
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="host-controls__btn host-controls__btn--secondary"
                        onClick={() => {
                          socket?.emit('host:trivia-next', { code: game.code });
                          setTriviaRevealed(false);
                        }}
                        disabled={!socket?.connected || !game?.code}
                        title={triviaQuestions.length > 0 && triviaCurrentIndex >= triviaQuestions.length - 1 ? 'This is the last question' : undefined}
                      >
                        Next question
                      </button>
                      {triviaCurrentIndex < triviaQuestions.length - 1 && (
                        <span className="host-controls__next-hint">
                          {triviaQuestions.length - triviaCurrentIndex - 1} left
                        </span>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="host-controls__prompt">
                <h2 className="host-controls__title">Host controls</h2>
                <p className="host-controls__hint">
                  Run controls for this game type are coming soon. Use the Waiting room to start and manage the game.
                </p>
              </div>
            )}
          </section>
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
        <details className="host-room__details">
          <summary className="host-room__details-summary">TV display &amp; links</summary>
          <div className="host-room__details-body">
            <p style={{ margin: '0 0 8px 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Use the display URL on your TV or projector. The display screen shows a QR code so players can scan to join.</p>
            <p style={{ fontSize: '0.9375rem', wordBreak: 'break-all' }}>
              <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="host-room__join-url">{displayUrl}</a>
            </p>
          </div>
        </details>

        {/* Print materials — dropdown */}
        <details className="host-room__details">
          <summary className="host-room__details-summary">Print materials</summary>
          <div className="host-room__details-body">
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
      </div>
      </div>
      <SongFactPopUp
        song={factSong}
        show={showFact}
        onDismiss={() => setShowFact(false)}
      />
    </>
  );
}
