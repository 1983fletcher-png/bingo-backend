import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import { TimerPill } from '../components/trivia-room';
import { FeudDisplay } from '../components/FeudDisplay';
import type { FeudState } from '../types/feud';
import { DEFAULT_FEUD_STATE } from '../types/feud';
import type { Song } from '../types/game';
import { getActivityTheme } from '../types/themes';
import { songKey } from '../types/game';
import { GameShell } from '../components/GameShell';
import { GameShell as SharedGameShell } from '../games/shared/GameShell';
import type { MarketMatchState } from '../types/marketMatch';
import { getMarketMatchItem } from '../data/marketMatchDataset';
import type { CrowdControlState } from '../types/crowdControlTrivia';
import { DisplayMarketMatch } from '../components/DisplayMarketMatch';
import { DisplayCrowdControl } from '../components/DisplayCrowdControl';
import { getBoard } from '../data/crowdControlTriviaDataset';

const COLUMNS = ['B', 'I', 'N', 'G', 'O'] as const;
const ROWS_PER_COL = 15;

/** Dedupe by title (first occurrence wins) so the board has no duplicate song titles. */
function dedupeByTitle(songs: Song[]): Song[] {
  const seen = new Set<string>();
  return songs.filter((s) => {
    const t = s.title.trim().toLowerCase();
    if (seen.has(t)) return false;
    seen.add(t);
    return true;
  });
}

/** Build 5x15 master board: fill columns B=0-14, I=15-29, N=30-44, G=45-59, O=60-74. */
function buildMasterBoard(pool: Song[]): (Song | null)[][] {
  const deduped = dedupeByTitle(pool);
  const list = deduped.slice(0, 75);
  const grid: (Song | null)[][] = [];
  for (let col = 0; col < 5; col++) {
    const row: (Song | null)[] = [];
    for (let r = 0; r < ROWS_PER_COL; r++) {
      const idx = col * ROWS_PER_COL + r;
      row.push(list[idx] ?? null);
    }
    grid.push(row);
  }
  return grid;
}

type DisplayEventConfig = {
  gameTitle?: string;
  venueName?: string;
  logoUrl?: string;
  welcomeTitle?: string;
  welcomeMessage?: string;
  promoText?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  /** Activity Room display theme: classic | calm | corporate */
  displayThemeId?: string;
  /** Playroom skin for GameShell: classic | prestige-retro | retro-studio | retro-arcade */
  playroomThemeId?: string;
};

export default function Display() {
  const { code } = useParams<{ code: string }>();
  const [joinUrl, setJoinUrl] = useState('');
  const [songPool, setSongPool] = useState<Song[]>([]);
  const [revealed, setRevealed] = useState<Song[]>([]);
  const [eventTitle, setEventTitle] = useState<string | undefined>();
  const [eventConfig, setEventConfig] = useState<DisplayEventConfig | null>(null);
  const [started, setStarted] = useState(false);
  const [gameType, setGameType] = useState<string>('music-bingo');
  type DisplayTriviaQuestion = { question: string; options?: string[]; correctIndex?: number; correctAnswer?: string; hostNotes?: { mcTip?: string; funFact?: string } };
  const [triviaState, setTriviaState] = useState<{
    currentIndex: number;
    questions: DisplayTriviaQuestion[];
    revealed?: boolean;
    settings?: { leaderboardsVisibleToPlayers?: boolean; leaderboardsVisibleOnDisplay?: boolean; mcTipsEnabled?: boolean };
    questionStartAt?: string | null;
    timeLimitSec?: number;
    scores?: Record<string, number>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [feudState, setFeudState] = useState<FeudState | null>(null);
  const [marketMatchState, setMarketMatchState] = useState<MarketMatchState | null>(null);
  const [crowdControlState, setCrowdControlState] = useState<CrowdControlState | null>(null);

  const masterBoard = useMemo(() => buildMasterBoard(songPool), [songPool]);
  const revealedSet = useMemo(() => new Set(revealed.map(songKey)), [revealed]);
  const currentCall = revealed.length > 0 ? revealed[revealed.length - 1] : null;
  const previousCalls = revealed.slice(-6, -1).reverse();

  useEffect(() => {
    if (!code?.trim()) {
      setError('Missing room code');
      return;
    }
    const s = getSocket();
    const codeUpper = code.trim().toUpperCase();
    const join = () => s.emit('display:join', { code: codeUpper });
    join();
    s.on('connect', join);
    s.on('display:ok', (payload: { joinUrl?: string; songPool?: Song[]; revealed?: Song[]; eventConfig?: DisplayEventConfig; started?: boolean; gameType?: string; feud?: FeudState; marketMatch?: MarketMatchState; crowdControl?: CrowdControlState; trivia?: { currentIndex: number; questions: { question: string; options?: string[]; correctIndex?: number }[]; revealed?: boolean } }) => {
      setJoinUrl(payload.joinUrl || `${window.location.origin}/join/${code}`);
      setSongPool(Array.isArray(payload.songPool) ? payload.songPool : []);
      setRevealed(Array.isArray(payload.revealed) ? payload.revealed : []);
      setEventTitle(payload.eventConfig?.gameTitle);
      setEventConfig(payload.eventConfig && typeof payload.eventConfig === 'object' ? payload.eventConfig : null);
      setStarted(payload.started === true);
      setGameType(payload.gameType || 'music-bingo');
      setFeudState(payload.feud && typeof payload.feud === 'object' ? payload.feud : null);
      setMarketMatchState(payload.marketMatch && typeof payload.marketMatch === 'object' ? payload.marketMatch : null);
      setCrowdControlState(payload.crowdControl && typeof payload.crowdControl === 'object' ? payload.crowdControl : null);
      const tr = payload.trivia && typeof payload.trivia === 'object' ? payload.trivia as { currentIndex?: number; questions?: DisplayTriviaQuestion[]; revealed?: boolean; settings?: { leaderboardsVisibleOnDisplay?: boolean; mcTipsEnabled?: boolean }; questionStartAt?: string | null; timeLimitSec?: number; scores?: Record<string, number> } : null;
      setTriviaState(tr ? { currentIndex: tr.currentIndex ?? 0, questions: (tr.questions ?? []) as DisplayTriviaQuestion[], revealed: tr.revealed, settings: tr.settings, questionStartAt: tr.questionStartAt, timeLimitSec: tr.timeLimitSec, scores: tr.scores } : null);
      setError(null);
    });
    s.on('display:error', (payload: { message?: string }) => {
      setError(payload.message || 'Game not found');
    });
    s.on('game:songs-updated', ({ songPool: pool }: { songPool: Song[] }) => {
      setSongPool(Array.isArray(pool) ? pool : []);
    });
    s.on('game:revealed', ({ revealed: rev }: { revealed: Song[] }) => {
      setRevealed(Array.isArray(rev) ? rev : []);
    });
    s.on('game:started', () => setStarted(true));
    s.on('game:trivia-state', (payload: { currentIndex?: number; questions?: DisplayTriviaQuestion[]; revealed?: boolean; settings?: { leaderboardsVisibleOnDisplay?: boolean; mcTipsEnabled?: boolean }; questionStartAt?: string | null; timeLimitSec?: number; scores?: Record<string, number> }) => {
      if (payload && typeof payload === 'object') {
        setTriviaState((prev) => ({
          currentIndex: payload.currentIndex ?? prev?.currentIndex ?? 0,
          questions: payload.questions ?? prev?.questions ?? [],
          revealed: payload.revealed ?? prev?.revealed,
          settings: payload.settings ?? prev?.settings,
          questionStartAt: payload.questionStartAt ?? prev?.questionStartAt,
          timeLimitSec: payload.timeLimitSec ?? prev?.timeLimitSec,
          scores: payload.scores ?? prev?.scores,
        }));
      }
    });
    s.on('game:trivia-reveal', (payload: { questionIndex?: number; correctAnswer?: string }) => {
      setTriviaState((prev) => {
        if (!prev) return null;
        const idx = payload.questionIndex ?? prev.currentIndex ?? 0;
        const questions = [...(prev.questions || [])];
        if (questions[idx] != null && payload.correctAnswer !== undefined) {
          questions[idx] = { ...questions[idx], correctAnswer: payload.correctAnswer };
        }
        return { ...prev, questions, revealed: true };
      });
    });
    s.on('feud:state', (payload: FeudState) => setFeudState(payload));
    s.on('market-match:state', (payload: MarketMatchState) => setMarketMatchState(payload));
    s.on('cct:state', (payload: CrowdControlState) => setCrowdControlState(payload));
    s.on('game:event-config-updated', (data: { eventConfig?: DisplayEventConfig }) => {
      if (data.eventConfig && typeof data.eventConfig === 'object') setEventConfig(data.eventConfig);
    });
    return () => {
      s.off('connect', join);
      s.off('display:ok');
      s.off('display:error');
      s.off('game:songs-updated');
      s.off('game:revealed');
      s.off('game:started');
      s.off('game:trivia-state');
      s.off('game:trivia-reveal');
      s.off('feud:state');
      s.off('market-match:state');
      s.off('cct:state');
      s.off('game:event-config-updated');
    };
  }, [code]);

  const activityTheme = getActivityTheme(eventConfig?.displayThemeId, darkMode);
  const { calmMode, ...theme } = activityTheme;
  const displayPlayroomThemeId = (eventConfig?.playroomThemeId && ['classic', 'prestige-retro', 'retro-studio', 'retro-arcade', 'game-show'].includes(eventConfig.playroomThemeId))
    ? eventConfig.playroomThemeId as 'classic' | 'prestige-retro' | 'retro-studio' | 'retro-arcade' | 'game-show'
    : undefined;
  const feudTheme = displayPlayroomThemeId === 'game-show' ? { ...getActivityTheme('game-show', true), calmMode } : { ...theme, calmMode };

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, color: theme.text }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ marginBottom: 8 }}>Game not found</h1>
          <p style={{ color: theme.muted }}>{error}</p>
          <p style={{ fontSize: 14, marginTop: 16 }}>Check the room code and try again.</p>
        </div>
      </div>
    );
  }

  // Always use current origin for QR so it points to the frontend (player view), not the backend
  const effectiveJoinUrl = typeof window !== 'undefined' && code?.trim()
    ? `${window.location.origin}/join/${code.trim().toUpperCase()}`
    : joinUrl;
  const qrUrl = effectiveJoinUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(effectiveJoinUrl)}`
    : '';

  // Market Match: price-guessing display (current item + reveal)
  if (gameType === 'market-match' && marketMatchState) {
    const item = getMarketMatchItem(marketMatchState.currentIndex ?? 0);
    return (
      <SharedGameShell
        gameKey="market_match"
        viewMode="display"
        themeId={displayPlayroomThemeId}
        title={eventConfig?.gameTitle || eventTitle || 'Market Match'}
        subtitle={item ? `What did this cost in ${item.year}?` : undefined}
        headerRightSlot={code ? <span style={{ fontFamily: 'var(--pr-font-display)', letterSpacing: '0.1em' }}>{code.toUpperCase()}</span> : undefined}
        mainSlot={<DisplayMarketMatch state={marketMatchState} />}
        statusBarProps={{ joinCode: code?.toUpperCase() ?? '' }}
      />
    );
  }

  // Crowd Control Trivia: board or question/reveal
  if (gameType === 'crowd-control-trivia' && crowdControlState) {
    const board = getBoard(crowdControlState.boardId ?? 0);
    const phase = crowdControlState.phase ?? 'board';
    return (
      <SharedGameShell
        gameKey="crowd_control_trivia"
        viewMode="display"
        themeId={displayPlayroomThemeId}
        title={eventConfig?.gameTitle || eventTitle || 'Crowd Control Trivia'}
        subtitle={phase === 'vote' ? 'Vote for a category!' : board?.name}
        headerRightSlot={code ? <span style={{ fontFamily: 'var(--pr-font-display)', letterSpacing: '0.1em' }}>{code.toUpperCase()}</span> : undefined}
        mainSlot={<DisplayCrowdControl state={crowdControlState} />}
        statusBarProps={{ joinCode: code?.toUpperCase() ?? '' }}
      />
    );
  }

  // Estimation Show / Category Grid: placeholder until full implementation
  if (gameType === 'estimation' || gameType === 'jeopardy') {
    const title = gameType === 'estimation' ? 'Estimation Show' : 'Category Grid';
    return (
      <SharedGameShell
        gameKey="market_match"
        viewMode="display"
        themeId={displayPlayroomThemeId}
        title={title}
        mainSlot={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center' }}>
            <div>
              <h1 style={{ marginBottom: 8, fontFamily: 'var(--pr-font-display)' }}>{title}</h1>
              <p style={{ color: 'var(--pr-muted)' }}>Coming soon. Share the join link with players; full display will be available in a future update.</p>
            </div>
          </div>
        }
        statusBarProps={{ joinCode: code?.toUpperCase() ?? '' }}
      />
    );
  }

  // Feud (Survey Showdown): checkpoint-driven TV view — always show when gameType is feud so live submissions display (use default state until first feud:state)
  if (gameType === 'feud') {
    const feud = feudState ?? DEFAULT_FEUD_STATE;
    return (
      <GameShell
        gameKey="survey_showdown"
        variant="display"
        title={eventConfig?.gameTitle || eventTitle || 'Survey Showdown'}
        subtitle={feud.roundIndex ? `Round ${feud.roundIndex}` : undefined}
        code={code ?? undefined}
        themeId={displayPlayroomThemeId}
        statusBarProps={{ joinCode: code?.toUpperCase() ?? '', stateBadge: `${feud.submissions?.length ?? 0} submissions` }}
      >
        <FeudDisplay
          feud={feud}
          joinUrl={effectiveJoinUrl}
          code={code?.toUpperCase() ?? ''}
          eventTitle={eventConfig?.gameTitle || eventTitle}
          theme={feudTheme}
          calmMode={feudTheme.calmMode}
        />
      </GameShell>
    );
  }

  // Waiting room: show on TV before game starts — left: big QR; right: logo, game name, description (no clickable links)
  if (!started) {
    const welcome = eventConfig?.welcomeTitle || eventConfig?.welcomeMessage || 'Starting soon…';
    const gameName = eventConfig?.gameTitle || eventTitle || 'The Playroom';
    const venueName = eventConfig?.venueName || '';
    const hasSocial = eventConfig?.facebookUrl || eventConfig?.instagramUrl;
    const qrSize = 320;
    const qrUrlWaiting = effectiveJoinUrl
      ? `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&margin=12&data=${encodeURIComponent(effectiveJoinUrl)}`
      : '';
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 48,
          padding: 40,
          background: theme.bg,
          color: theme.text,
        }}
      >
        {/* Left: large QR + game code */}
        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {qrUrlWaiting ? (
            <>
              <p style={{ margin: '0 0 12px', fontSize: 16, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Scan to join · Enter your name</p>
              <img src={qrUrlWaiting} alt="QR code to join" style={{ width: qrSize, height: qrSize, borderRadius: 16, border: `4px solid ${theme.border}` }} />
              <p style={{ margin: '16px 0 0', fontSize: 32, fontWeight: 800, letterSpacing: '0.2em' }}>{code?.toUpperCase() || '—'}</p>
            </>
          ) : (
            <div style={{ width: qrSize, height: qrSize, background: theme.card, borderRadius: 16, border: `4px dashed ${theme.border}` }} />
          )}
        </div>
        {/* Right: optional logo, game name, description, venue/social */}
        <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 20 }}>
          {eventConfig?.logoUrl && (
            <img src={eventConfig.logoUrl} alt="" style={{ maxHeight: 160, maxWidth: '100%', objectFit: 'contain' }} />
          )}
          <h1 style={{ margin: 0, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700 }}>{gameName}</h1>
          <p style={{ margin: 0, fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: theme.muted, maxWidth: 480, lineHeight: 1.4 }}>{welcome}</p>
          {(venueName || hasSocial) && (
            <div style={{ fontSize: 'clamp(0.875rem, 2vw, 1.1rem)', color: theme.muted }}>
              {venueName && <p style={{ margin: '0 0 4px' }}>{venueName}</p>}
              {hasSocial && (
                <p style={{ margin: 0 }}>
                  {eventConfig?.facebookUrl && 'Follow us on Facebook'}
                  {eventConfig?.facebookUrl && eventConfig?.instagramUrl && ' · '}
                  {eventConfig?.instagramUrl && 'Instagram'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Started + Trivia (Crowd Control Trivia): show trivia display inside GameShell
  if (started && gameType === 'trivia' && triviaState?.questions?.length) {
    const idx = Math.min(triviaState.currentIndex, triviaState.questions.length - 1);
    const q = triviaState.questions[idx];
    const gameName = eventConfig?.gameTitle || eventTitle || 'Trivia';
    const venueName = eventConfig?.venueName || '';
    const hasSocial = eventConfig?.facebookUrl || eventConfig?.instagramUrl;
    const trQr = effectiveJoinUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(effectiveJoinUrl)}` : '';
    return (
      <SharedGameShell
        gameKey="crowd_control_trivia"
        viewMode="display"
        themeId={displayPlayroomThemeId}
        title={gameName}
        subtitle={`Question ${idx + 1} of ${triviaState.questions.length}`}
        headerRightSlot={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {trQr && <img src={trQr} alt="Join" style={{ width: 64, height: 64, borderRadius: 8, border: '2px solid var(--pr-border)' }} />}
            <span style={{ fontFamily: 'var(--pr-font-display)', fontWeight: 700, letterSpacing: '0.1em' }}>{code?.toUpperCase()}</span>
          </div>
        }
        mainSlot={
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
            {triviaState.settings?.mcTipsEnabled && q?.hostNotes?.mcTip && (
              <p style={{ margin: '0 0 16px', padding: 16, maxWidth: 800, background: 'var(--pr-surface)', borderRadius: 12, borderLeft: '4px solid var(--pr-brand)', fontSize: 'clamp(14px, 2vw, 18px)', color: 'var(--pr-muted)', textAlign: 'left' }}>
                <strong>MC tip:</strong> {q.hostNotes.mcTip}
              </p>
            )}
            {!triviaState.revealed && triviaState.questionStartAt != null && (triviaState.timeLimitSec ?? 30) > 0 && (
              <div style={{ marginBottom: 16 }}>
                <TimerPill questionStartAt={triviaState.questionStartAt} timeLimitSec={triviaState.timeLimitSec ?? 30} active />
              </div>
            )}
            <h2 style={{ margin: '0 0 24px', fontSize: 'clamp(1.25rem, 3vw, 2rem)', fontWeight: 600, lineHeight: 1.4, color: 'var(--pr-text)' }}>{q?.question}</h2>
            {triviaState.revealed && q?.options?.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
                {q.options.map((opt, i) => (
                  <span key={i} style={{ padding: '12px 20px', background: 'var(--pr-surface2)', color: 'var(--pr-text)', borderRadius: 12, fontWeight: 600, border: '2px solid var(--pr-border)' }}>{opt}</span>
                ))}
              </div>
            ) : triviaState.revealed && (q as { correctAnswer?: string })?.correctAnswer ? (
              <p style={{ margin: 0, padding: '16px 24px', background: 'var(--pr-brand)', color: 'var(--pr-bg)', borderRadius: 12, fontWeight: 700, fontSize: 20 }}>{(q as { correctAnswer: string }).correctAnswer}</p>
            ) : (
              <p style={{ margin: 0, fontSize: 18, color: 'var(--pr-muted)' }}>Answer on your phone</p>
            )}
            {triviaState.settings?.leaderboardsVisibleOnDisplay !== false && triviaState.scores && Object.keys(triviaState.scores).length > 0 && (
              <div style={{ marginTop: 24, padding: '12px 24px', background: 'var(--pr-surface)', borderRadius: 12, display: 'inline-block', alignSelf: 'center' }}>
                <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--pr-muted)' }}>Scores</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {Object.entries(triviaState.scores)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([id, score]) => (
                      <span key={id} style={{ fontWeight: 600, color: 'var(--pr-text)' }}>{score} pts</span>
                    ))}
                </div>
              </div>
            )}
            {(hasSocial || venueName) && (
              <p style={{ marginTop: 16, fontSize: 13, color: 'var(--pr-muted)' }}>
                {venueName}{hasSocial && venueName ? ' · ' : ''}{hasSocial ? 'Follow us on Facebook · Instagram' : ''}
              </p>
            )}
          </div>
        }
        statusBarProps={{ joinCode: code?.toUpperCase() ?? '' }}
      />
    );
  }

  // Started + Bingo (music or classic): show call grid
  const bingoLabel = gameType === 'classic-bingo' ? 'Classic Bingo' : 'Music Bingo';
  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: theme.bg,
        color: theme.text,
      }}
    >
      {/* Top bar */}
      <header
        style={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          background: theme.panel,
          borderBottom: `2px solid ${theme.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '0.02em' }}>{bingoLabel}</h1>
          {eventTitle && (
            <p style={{ margin: '2px 0 0 0', fontSize: 14, color: theme.muted, fontWeight: 500 }}>{eventTitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSetupOpen(true)}
          style={{
            padding: '8px 16px',
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 8,
            color: theme.text,
            fontSize: 14,
          }}
        >
          Setup
        </button>
      </header>

      {/* Main: left panel + board */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Left panel */}
        <aside
          style={{
            width: 280,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: 16,
            background: theme.panel,
            borderRight: `2px solid ${theme.border}`,
            gap: 16,
            overflow: 'auto',
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 12, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total calls</p>
            <p style={{ margin: '2px 0 0 0', fontSize: 28, fontWeight: 700 }}>{revealed.length}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current call</p>
            <div
              style={{
                marginTop: 8,
                padding: '16px 12px',
                background: theme.accent,
                color: darkMode ? '#1a1a1a' : '#111',
                borderRadius: 12,
                textAlign: 'center',
                fontWeight: 700,
                fontSize: 15,
                minHeight: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {currentCall ? (
                <span style={{ wordBreak: 'break-word' }}>{currentCall.title}</span>
              ) : (
                <span style={{ color: darkMode ? '#555' : '#666' }}>Waiting…</span>
              )}
            </div>
          </div>
          {previousCalls.length > 0 && (
            <div>
              <p style={{ margin: 0, fontSize: 12, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Previous</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {previousCalls.map((s) => (
                  <div
                    key={songKey(s)}
                    style={{
                      padding: '6px 10px',
                      background: theme.card,
                      borderRadius: 8,
                      fontSize: 11,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {s.title}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 12, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Scan to join</p>
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="QR code to join game"
                style={{ width: 220, height: 220, borderRadius: 10, border: `2px solid ${theme.border}`, alignSelf: 'flex-start' }}
              />
            ) : (
              <div style={{ width: 220, height: 220, background: theme.card, borderRadius: 10, border: `2px dashed ${theme.border}` }} />
            )}
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '0.15em' }}>{code?.toUpperCase() || '—'}</p>
          </div>
        </aside>

        {/* Master board: 5 columns x 15 rows, fills remaining space */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gridTemplateRows: `auto repeat(${ROWS_PER_COL}, 1fr)`,
              gap: 4,
            }}
          >
            {COLUMNS.map((letter, col) => (
              <div key={letter} style={{ display: 'contents' }}>
                <div
                  style={{
                    gridColumn: col + 1,
                    padding: '8px 4px',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: 'clamp(14px, 2vw, 20px)',
                    color: theme.accent,
                    background: theme.card,
                    borderRadius: 6,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {letter}
                </div>
                {masterBoard[col]?.map((song, row) => {
                  const key = song ? songKey(song) : `empty-${col}-${row}`;
                  const isRevealed = song ? revealedSet.has(key) : false;
                  return (
                    <div
                      key={key}
                      style={{
                        padding: '4px 6px',
                        fontSize: 'clamp(9px, 1.2vw, 12px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        background: isRevealed ? theme.accent : theme.card,
                        color: isRevealed ? (darkMode ? '#1a1a1a' : '#111') : theme.text,
                        borderRadius: 4,
                        border: `1px solid ${theme.border}`,
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                        lineHeight: 1.2,
                      }}
                    >
                      {song ? song.title : '—'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <footer style={{ flex: '0 0 auto', padding: '8px 0', textAlign: 'center', fontSize: 12, color: theme.muted }}>
            Playroom Bingo · <a href="https://theplayroom.netlify.app" target="_blank" rel="noopener noreferrer" style={{ color: theme.accent }}>theplayroom.netlify.app</a>
          </footer>
        </main>
      </div>

      {/* Setup overlay: theme toggle only */}
      {setupOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSetupOpen(false)}
        >
          <div
            style={{
              background: theme.panel,
              padding: 24,
              borderRadius: 12,
              border: `1px solid ${theme.border}`,
              minWidth: 280,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0' }}>Display setup</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14 }}>Theme</span>
              <button
                type="button"
                onClick={() => setDarkMode(false)}
                style={{
                  padding: '8px 16px',
                  background: !darkMode ? theme.accent : theme.card,
                  color: !darkMode ? '#111' : theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                }}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setDarkMode(true)}
                style={{
                  padding: '8px 16px',
                  background: darkMode ? theme.accent : theme.card,
                  color: darkMode ? '#111' : theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                }}
              >
                Dark
              </button>
            </div>
            <button
              type="button"
              onClick={() => setSetupOpen(false)}
              style={{ marginTop: 16, padding: '8px 16px', width: '100%', background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
