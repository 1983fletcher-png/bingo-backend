/** One song in the pool or on a card */
export interface Song {
  artist: string;
  title: string;
}

/** Unique key for a song (for revealed/called checks) */
export function songKey(song: Song): string {
  return `${song.artist}|${song.title}`;
}

/** 5×5 bingo card: row-major, index 12 is center (free space). 24 songs + 1 free. */
export type BingoCard = (Song | 'FREE')[];

export const CARD_SIZE = 25;
export const FREE_INDEX = 12;

/** Build a random card from pool (24 songs + FREE at center). */
export function buildCardFromPool(pool: Song[], seed?: string): BingoCard {
  if (pool.length < 24) return [];
  const shuffled = [...pool];
  let s = 0;
  if (seed) {
    for (let i = 0; i < seed.length; i++) s = (s << 5) - s + seed.charCodeAt(i);
  } else {
    s = Date.now();
  }
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const card: BingoCard = [];
  for (let i = 0; i < CARD_SIZE; i++) {
    if (i === FREE_INDEX) {
      card.push('FREE');
    } else {
      const idx = i < FREE_INDEX ? i : i - 1;
      card.push(shuffled[idx]);
    }
  }
  return card;
}
