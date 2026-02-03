import { useState, useMemo, useCallback } from 'react';
import type { Song } from '../types/game';
import { songKey } from '../types/game';

interface HostSongGridProps {
  songPool: Song[];
  revealed: Song[];
  onReveal: (song: Song) => void;
  eventTitle?: string;
}

const TILE_MIN_HEIGHT = 52;

/** Single song tile: front = title, back = artist; solid flip. */
function SongTile({
  song,
  isRevealed,
  isFlipped,
  onFlip,
  onReveal,
}: {
  song: Song;
  isRevealed: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  onReveal: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 8,
        minHeight: TILE_MIN_HEIGHT,
        border: `1px solid ${isRevealed ? '#2d3748' : '#4a5568'}`,
        borderRadius: 8,
        background: isRevealed ? '#1a202c' : '#2d3748',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onFlip}
        style={{
          flex: 1,
          minWidth: 0,
          margin: 0,
          padding: '8px 10px',
          background: 'transparent',
          border: 'none',
          color: '#e2e8f0',
          fontSize: 13,
          fontWeight: 500,
          textAlign: 'left',
          cursor: 'pointer',
          position: 'relative',
          perspective: 400,
        }}
        aria-label={isFlipped ? song.artist : song.title}
      >
        <div style={{ position: 'relative', width: '100%', minHeight: 36 }}>
          {/* Front: title */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.3s ease',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {song.title}
          </div>
          {/* Back: artist */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              background: '#1a202c',
              transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
              transition: 'transform 0.3s ease',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {song.artist}
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={onReveal}
        disabled={isRevealed}
        style={{
          padding: '8px 14px',
          background: isRevealed ? '#2d3748' : '#48bb78',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          cursor: isRevealed ? 'default' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {isRevealed ? '✓ Called' : 'Reveal'}
      </button>
    </div>
  );
}

export default function HostSongGrid({
  songPool,
  revealed,
  onReveal,
  eventTitle,
}: HostSongGridProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'order'>('title');
  const [flipped, setFlipped] = useState<Set<string>>(new Set());

  const toggleFlip = useCallback((key: string) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? songPool.filter(
          (s) =>
            s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
        )
      : [...songPool];
    if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'artist') {
      list.sort((a, b) => a.artist.localeCompare(b.artist));
    }
    return list;
  }, [songPool, search, sortBy]);

  const revealedSet = useMemo(() => new Set(revealed.map(songKey)), [revealed]);

  if (songPool.length === 0) {
    return (
      <div style={{ padding: 24, color: '#a0aec0' }}>
        <p>No songs in the pool yet. Generate or add songs to start calling.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 12, maxWidth: 560, margin: '0 auto' }}>
      {eventTitle && (
        <h2 style={{ margin: '0 0 8px 0', fontSize: 18 }}>{eventTitle} — Call sheet</h2>
      )}
      <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <input
          type="search"
          placeholder="Search by title or artist…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '1 1 200px',
            minWidth: 0,
            padding: '8px 12px',
            fontSize: 14,
            border: '1px solid #4a5568',
            borderRadius: 8,
            background: '#1a202c',
            color: '#e2e8f0',
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'title' | 'artist' | 'order')}
          style={{
            padding: '8px 12px',
            fontSize: 14,
            border: '1px solid #4a5568',
            borderRadius: 8,
            background: '#1a202c',
            color: '#e2e8f0',
          }}
        >
          <option value="title">Sort by title (A–Z)</option>
          <option value="artist">Sort by artist (A–Z)</option>
          <option value="order">Order added</option>
        </select>
      </div>
      <p style={{ fontSize: 12, color: '#a0aec0', marginBottom: 12 }}>
        Tap a row to flip title ↔ artist. Click Reveal to call the song.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '60vh', overflowY: 'auto' }}>
        {filteredAndSorted.map((song) => {
          const key = songKey(song);
          return (
            <SongTile
              key={key}
              song={song}
              isRevealed={revealedSet.has(key)}
              isFlipped={flipped.has(key)}
              onFlip={() => toggleFlip(key)}
              onReveal={() => onReveal(song)}
            />
          );
        })}
      </div>
      {filteredAndSorted.length === 0 && search.trim() && (
        <p style={{ color: '#a0aec0', fontSize: 14 }}>No matches for “{search}”.</p>
      )}
    </div>
  );
}
