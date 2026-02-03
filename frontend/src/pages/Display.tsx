import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import type { Song } from '../types/game';
import { songKey } from '../types/game';

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

export default function Display() {
  const { code } = useParams<{ code: string }>();
  const [joinUrl, setJoinUrl] = useState('');
  const [songPool, setSongPool] = useState<Song[]>([]);
  const [revealed, setRevealed] = useState<Song[]>([]);
  const [eventTitle, setEventTitle] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

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
    s.emit('display:join', { code: code.trim().toUpperCase() });
    s.once('display:ok', (payload: { joinUrl?: string; songPool?: Song[]; revealed?: Song[]; eventConfig?: { gameTitle?: string } }) => {
      setJoinUrl(payload.joinUrl || `${window.location.origin}/join/${code}`);
      setSongPool(Array.isArray(payload.songPool) ? payload.songPool : []);
      setRevealed(Array.isArray(payload.revealed) ? payload.revealed : []);
      setEventTitle(payload.eventConfig?.gameTitle);
      setError(null);
    });
    s.once('display:error', (payload: { message?: string }) => {
      setError(payload.message || 'Game not found');
    });
    s.on('game:songs-updated', ({ songPool: pool }: { songPool: Song[] }) => {
      setSongPool(Array.isArray(pool) ? pool : []);
    });
    s.on('game:revealed', ({ revealed: rev }: { revealed: Song[] }) => {
      setRevealed(Array.isArray(rev) ? rev : []);
    });
    return () => {
      s.off('game:songs-updated');
      s.off('game:revealed');
    };
  }, [code]);

  const theme = darkMode
    ? { bg: '#0f1115', panel: '#1b1f27', card: '#252a33', text: '#f0f0f0', muted: '#9aa3ad', accent: '#e8b923', border: '#3d4552' }
    : { bg: '#f5f5f5', panel: '#fff', card: '#fafafa', text: '#1a1a1a', muted: '#666', accent: '#c99700', border: '#ddd' };

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

  const qrUrl = joinUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(joinUrl)}`
    : '';

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
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '0.02em' }}>Playroom Bingo</h1>
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
