import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import HostSongGrid from '../components/HostSongGrid';
import SongFactPopUp from '../components/SongFactPopUp';
import { defaultTriviaPacks } from '../data/triviaPacks';
import type { TriviaPack, TriviaQuestion } from '../data/triviaPacks';
import { printBingoCards } from '../lib/printBingoCards';
import { buildTriviaQuizPrintDocument, buildFlashcardsPrintDocument } from '../lib/printMaterials';
import type { Song } from '../types/game';
import type { Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? '' : window.location.origin);

interface GameCreated {
  code: string;
  joinUrl: string;
  gameType: string;
  eventConfig: { gameTitle?: string };
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

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));

    s.on('game:created', (payload: GameCreated) => {
      setGame(payload);
      setHostMessage(payload.waitingRoom?.hostMessage || 'Starting soon…');
      setWaitingRoomTheme(payload.waitingRoom?.theme || 'default');
      setSongPool(Array.isArray(payload.songPool) ? payload.songPool : []);
      setRevealed(Array.isArray(payload.revealed) ? payload.revealed : []);
      if (payload.trivia?.questions?.length) {
        setTriviaQuestions(payload.trivia.questions);
      } else {
        setTriviaQuestions([]);
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
      s.off('game:waiting-room-updated');
      s.off('game:songs-updated');
      s.off('game:revealed');
      s.off('game:trivia-state');
    };
  }, []);

  const createGame = (gameType: 'music-bingo' | 'trivia') => {
    if (!socket) return;
    setGame(null);
    setTriviaPackForGame(null);
    const eventConfig = { gameTitle: gameType === 'trivia' ? 'Trivia' : 'The Playroom' };
    if (gameType === 'trivia') {
      const pack = defaultTriviaPacks.find(p => p.id === selectedTriviaPackId) ?? defaultTriviaPacks[0];
      setTriviaPackForGame(pack);
      socket.emit('host:create', {
        baseUrl: window.location.origin,
        gameType: 'trivia',
        eventConfig: { ...eventConfig, gameTitle: pack.title },
        questions: pack.questions,
      });
    } else {
      socket.emit('host:create', {
        baseUrl: window.location.origin,
        gameType: 'music-bingo',
        eventConfig,
      });
    }
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
      const res = await fetch(`${base}/api/generate-songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: genPrompt,
          count: 75,
          familyFriendly: false,
          apiKey: genApiKey || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      const songs = data.songs;
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
      <div style={{ padding: 24, maxWidth: 520 }}>
        <h2>Host a game</h2>
        <p>The waiting room will show Roll Call (marble game) until you start.</p>
        <div style={{ marginTop: 16 }}>
          <button onClick={() => createGame('music-bingo')} style={{ padding: '12px 24px', marginRight: 8 }}>
            Create Music Bingo
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
            <button onClick={() => createGame('trivia')} style={{ padding: '12px 24px' }}>
              Create Trivia
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
