/** localStorage key for UI theme: 'light' | 'dark' */
export const THEME_KEY = 'playroom-theme';

/** Activity Room display theme: classic | calm | corporate. Affects TV/Display theme and calmMode. */
export type DisplayThemeId = 'classic' | 'calm' | 'corporate';

/** Event & venue config (display, welcome, scrape, social links). Synced to game via host:set-event-config. */
export interface EventConfig {
  gameTitle?: string;
  venueName?: string;
  logoUrl?: string;
  accentColor?: string;
  drinkSpecials?: string;
  foodSpecials?: string;
  themeLabel?: string;
  /** Activity Room TV theme (Playroom Classic / Calm / Corporate) */
  displayThemeId?: DisplayThemeId;
  /** Playroom skin on TV (classic, prestige-retro, retro-studio, retro-arcade) */
  playroomThemeId?: string;
  promoText?: string;
  bannerImageUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  welcomeTitle?: string;
  welcomeMessage?: string;
  welcomeImageUrl?: string;
  useVenueLogoInCenter?: boolean;
  foodMenuUrl?: string;
  drinkMenuUrl?: string;
  eventsUrl?: string;
  venueAllowedUseOfMenuDesign?: boolean;
}

export const VENUE_PROFILES_KEY = 'playroom-venue-profiles';

export interface VenueProfile {
  id: string;
  name: string;
  gameTitle?: string;
  venueName?: string;
  logoUrl?: string;
  accentColor?: string;
  drinkSpecials?: string;
  foodSpecials?: string;
  themeLabel?: string;
  promoText?: string;
  bannerImageUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  foodMenuUrl?: string;
  drinkMenuUrl?: string;
  eventsUrl?: string;
  venueAllowedUseOfMenuDesign?: boolean;
}

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
