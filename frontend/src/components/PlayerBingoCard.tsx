import { useState, useCallback } from 'react';
import type { BingoCard as BingoCardType, Song } from '../types/game';
import { songKey } from '../types/game';

const TILE_MIN_HEIGHT = 72;
const TILE_GAP = 8;

interface PlayerBingoCardProps {
  card: BingoCardType;
  revealed: Song[];
  onBingo?: () => void;
  winCondition?: string;
  eventTitle?: string;
}

function useFlipped() {
  const [flipped, setFlipped] = useState<Set<number>>(() => new Set());
  const toggle = useCallback((index: number) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);
  return { flipped, toggle };
}

/** Neutral = uncalled; solid blue = called. Front = song title only; tap to flip for artist. */
const TILE_NEUTRAL_BG = '#2d3748';
const TILE_CALLED_BG = '#2b6cb0'; // solid blue when song/number has been called

/** Front = song title only. Tap to flip and see the artist/band on the back. */
function TileSolid({
  item,
  isRevealed,
  isFlipped,
  onFlip,
}: {
  item: Song | 'FREE';
  isRevealed: boolean;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  const isFree = item === 'FREE';
  const song = isFree ? null : (item as Song);
  const tileBg = isRevealed ? TILE_CALLED_BG : TILE_NEUTRAL_BG;
  const faceBg = isRevealed ? TILE_CALLED_BG : TILE_NEUTRAL_BG;
  const backBg = isRevealed ? '#1e4d7b' : '#1a202c'; // slightly darker blue when called, else dark gray

  return (
    <button
      type="button"
      onClick={onFlip}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: TILE_MIN_HEIGHT,
        margin: 0,
        padding: 8,
        border: `2px solid ${isRevealed ? '#1e4d7b' : '#4a5568'}`,
        borderRadius: 8,
        background: tileBg,
        color: '#e2e8f0',
        fontSize: 12,
        fontWeight: 600,
        textAlign: 'center',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 600,
      }}
      aria-label={isFree ? 'Free space' : isFlipped ? song!.artist : song!.title}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: TILE_MIN_HEIGHT - 16,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front: song title only */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            background: faceBg,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 6,
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.35s ease',
            border: 'none',
          }}
        >
          <span
            style={{
              width: '100%',
              lineHeight: 1.25,
              wordBreak: 'break-word',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
            title={isFree ? undefined : song!.title}
          >
            {isFree ? 'FREE' : song!.title}
          </span>
        </div>
        {/* Back: artist/band — tap tile to flip and see */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            background: backBg,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 6,
            transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
            transition: 'transform 0.35s ease',
          }}
        >
          {!isFree && (
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
                WebkitOverflowScrolling: 'touch',
              }}
              title={song!.artist}
            >
              {song!.artist}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function PlayerBingoCard({
  card,
  revealed,
  onBingo,
  eventTitle,
}: PlayerBingoCardProps) {
  const { flipped, toggle } = useFlipped();
  const revealedSet = new Set(revealed.map(songKey));

  if (!card || card.length !== 25) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>No card yet. Waiting for host to add songs.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 12, maxWidth: 480, margin: '0 auto' }}>
      {eventTitle && (
        <h2 style={{ margin: '0 0 8px 0', fontSize: 18 }}>{eventTitle}</h2>
      )}
      <p style={{ fontSize: 12, color: '#a0aec0', marginBottom: 12 }}>
        Your card shows the song title. Tap a tile to flip it and see the artist or band. Get 5 in a row to win.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: TILE_GAP,
          width: '100%',
        }}
      >
        {card.map((item, index) => (
          <TileSolid
            key={index}
            item={item}
            isRevealed={item !== 'FREE' && revealedSet.has(songKey(item))}
            isFlipped={flipped.has(index)}
            onFlip={() => toggle(index)}
          />
        ))}
      </div>
      {onBingo && (
        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            onClick={onBingo}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              fontWeight: 600,
              background: '#48bb78',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              width: '100%',
            }}
          >
            BINGO!
          </button>
        </div>
      )}
    </div>
  );
}
