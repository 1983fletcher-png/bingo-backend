/**
 * Music Data Layer — trusted APIs for metadata, key, tempo, and rankings.
 * Used by Music Bingo, music trivia, and future edutainment (piano, guitar, theory).
 * Copyright-safe: metadata and statistics only; no lyrics, no audio hosting.
 *
 * Normalized track shape: { artist, title, year?, popularity?, source?, key?, tempo?, timeSignature?, energy?, danceability?, playCount?, listeners?, tags? }
 */

const MUSICBRAINZ_USER_AGENT = 'PlayroomMusic/1.0 (https://theplayroom.net; educational music games)';
const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0';

const KEY_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function formatKey(spotifyKey, spotifyMode) {
  if (spotifyKey == null || spotifyKey < 0 || spotifyKey > 11) return null;
  const keyName = KEY_NAMES[spotifyKey];
  const modeName = spotifyMode === 1 ? 'major' : 'minor';
  return `${keyName} ${modeName}`;
}

/**
 * Get Spotify access token (Client Credentials). Returns null if env not set.
 */
async function getSpotifyToken() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Search Spotify for tracks; fetch audio features (key, tempo, etc.) for up to limit tracks.
 * Returns normalized array. Empty if no token or error.
 */
async function searchSpotifyTracks(query, limit = 20) {
  const token = await getSpotifyToken();
  if (!token) return [];
  try {
    const q = encodeURIComponent(String(query).slice(0, 200));
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${q}&type=track&limit=${Math.min(limit, 50)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!searchRes.ok) return [];
    const searchJson = await searchRes.json();
    const items = searchJson.tracks?.items || [];
    if (items.length === 0) return [];

    const ids = items.map((t) => t.id).filter(Boolean).slice(0, 20);
    const featuresRes = await fetch(
      `https://api.spotify.com/v1/audio-features?ids=${ids.join(',')}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000),
      }
    );
    const featuresJson = featuresRes.ok ? await featuresRes.json() : { audio_features: [] };
    const featuresList = featuresJson.audio_features || [];

    return items.slice(0, ids.length).map((t, i) => {
      const f = featuresList[i] || {};
      return {
        artist: t.artists?.[0]?.name || '',
        title: t.name || '',
        year: t.album?.release_date ? parseInt(t.album.release_date.slice(0, 4), 10) : null,
        popularity: typeof t.popularity === 'number' ? t.popularity : null,
        source: 'spotify',
        key: formatKey(f.key, f.mode),
        tempo: typeof f.tempo === 'number' ? Math.round(f.tempo) : null,
        timeSignature: typeof f.time_signature === 'number' ? f.time_signature : null,
        energy: typeof f.energy === 'number' ? f.energy : null,
        danceability: typeof f.danceability === 'number' ? f.danceability : null,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Last.fm: track.getInfo for playcount, listeners, tags. Returns null if no key or error.
 */
async function fetchLastFmTrackInfo(artist, title) {
  const key = process.env.LASTFM_API_KEY;
  if (!key) return null;
  try {
    const params = new URLSearchParams({
      method: 'track.getInfo',
      api_key: key,
      artist: String(artist || '').trim().slice(0, 200),
      track: String(title || '').trim().slice(0, 200),
      format: 'json',
    });
    const res = await fetch(`${LASTFM_BASE}/?${params}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const json = await res.json();
    const t = json.track;
    if (!t) return null;
    const tags = Array.isArray(t.toptags?.tag) ? t.toptags.tag.map((x) => x?.name).filter(Boolean) : [];
    return {
      artist: t.artist?.name || artist,
      title: t.name || title,
      playCount: typeof t.playcount === 'string' ? parseInt(t.playcount, 10) : t.playcount,
      listeners: typeof t.listeners === 'string' ? parseInt(t.listeners, 10) : t.listeners,
      tags: tags.slice(0, 15),
      source: 'lastfm',
    };
  } catch {
    return null;
  }
}

/**
 * Last.fm: tag.getTopTracks for chart-style lists by tag (e.g. "80s", "kids", "dance").
 */
async function fetchLastFmTopTracksByTag(tag, limit = 50) {
  const key = process.env.LASTFM_API_KEY;
  if (!key) return [];
  try {
    const params = new URLSearchParams({
      method: 'tag.gettoptracks',
      api_key: key,
      tag: String(tag || '').trim().slice(0, 100),
      limit: Math.min(limit, 50),
      format: 'json',
    });
    const res = await fetch(`${LASTFM_BASE}/?${params}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const json = await res.json();
    const tracks = json.toptracks?.track || [];
    return tracks.map((t) => ({
      artist: t.artist?.name || '',
      title: t.name || '',
      playCount: typeof t.playcount === 'string' ? parseInt(t.playcount, 10) : t.playcount,
      listeners: typeof t.listeners === 'string' ? parseInt(t.listeners, 10) : t.listeners,
      source: 'lastfm',
      year: null,
      popularity: null,
      key: null,
      tempo: null,
      timeSignature: null,
      energy: null,
      danceability: null,
    }));
  } catch {
    return [];
  }
}

/**
 * MusicBrainz: search recording by artist + title; return first match with release date.
 * Rate limit: 1 req/sec (we do one request per enrichTrack call).
 */
async function fetchMusicBrainzRecording(artist, title) {
  const q = encodeURIComponent(`artist:${String(artist).slice(0, 100)} recording:${String(title).slice(0, 100)}`);
  try {
    const res = await fetch(
      `https://musicbrainz.org/ws/2/recording/?query=${q}&fmt=json&limit=1`,
      {
        headers: { 'User-Agent': MUSICBRAINZ_USER_AGENT },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const rec = json.recordings?.[0];
    if (!rec) return null;
    const date = rec.first_release_date || rec.date;
    const year = date ? parseInt(String(date).slice(0, 4), 10) : null;
    return {
      artist: rec['artist-credit']?.[0]?.artist?.name || artist,
      title: rec.title || title,
      year: Number.isFinite(year) ? year : null,
      source: 'musicbrainz',
      mbid: rec.id || null,
    };
  } catch {
    return null;
  }
}

/**
 * Enrich a single track: MusicBrainz (year), Spotify (key, tempo, features), Last.fm (playCount, listeners, tags).
 * Returns one normalized object with as much data as possible for teaching and learning.
 */
export async function enrichTrack(artist, title) {
  const normalized = {
    artist: String(artist || '').trim(),
    title: String(title || '').trim(),
    year: null,
    popularity: null,
    source: null,
    key: null,
    tempo: null,
    timeSignature: null,
    energy: null,
    danceability: null,
    playCount: null,
    listeners: null,
    tags: null,
  };

  const [mb, spotify, lastfm] = await Promise.all([
    fetchMusicBrainzRecording(normalized.artist, normalized.title),
    searchSpotifyTracks(`${normalized.title} ${normalized.artist}`, 1),
    fetchLastFmTrackInfo(normalized.artist, normalized.title),
  ]);

  if (mb) {
    normalized.year = normalized.year ?? mb.year;
    if (mb.artist) normalized.artist = mb.artist;
    if (mb.title) normalized.title = mb.title;
    if (!normalized.source) normalized.source = 'musicbrainz';
  }

  const spotifyTrack = spotify[0];
  if (spotifyTrack) {
    normalized.year = normalized.year ?? spotifyTrack.year;
    normalized.popularity = spotifyTrack.popularity ?? normalized.popularity;
    normalized.key = spotifyTrack.key ?? normalized.key;
    normalized.tempo = spotifyTrack.tempo ?? normalized.tempo;
    normalized.timeSignature = spotifyTrack.timeSignature ?? normalized.timeSignature;
    normalized.energy = spotifyTrack.energy ?? normalized.energy;
    normalized.danceability = spotifyTrack.danceability ?? normalized.danceability;
    if (spotifyTrack.artist) normalized.artist = spotifyTrack.artist;
    if (spotifyTrack.title) normalized.title = spotifyTrack.title;
    normalized.source = normalized.source ? `${normalized.source}+spotify` : 'spotify';
  }

  if (lastfm) {
    normalized.playCount = lastfm.playCount ?? normalized.playCount;
    normalized.listeners = lastfm.listeners ?? normalized.listeners;
    normalized.tags = lastfm.tags?.length ? lastfm.tags : normalized.tags;
    normalized.source = normalized.source ? `${normalized.source}+lastfm` : 'lastfm';
  }

  return normalized;
}

/**
 * Search for tracks (Spotify when available). Returns normalized list with key, tempo, etc.
 */
export async function searchTopTracks(opts = {}) {
  const { query = '', limit = 20 } = opts;
  if (!query || limit < 1) return [];
  return searchSpotifyTracks(query, Math.min(limit, 50));
}

/**
 * Chart-style list by tag (e.g. "80s", "kids", "dance") from Last.fm.
 * Returns normalized tracks with playCount, listeners; no key/tempo (Last.fm doesn't provide them).
 * Use with enrichTracks() later to add year/key/tempo from MusicBrainz/Spotify if needed.
 */
export async function getChartStyleList(opts = {}) {
  const { tag = '', limit = 50 } = opts;
  if (!tag || limit < 1) return [];
  return fetchLastFmTopTracksByTag(tag, Math.min(limit, 50));
}

/**
 * Enrich an array of { artist, title } with year, key, tempo, etc. from MusicBrainz + Spotify.
 * Processes in batches to avoid rate limits; returns same order with added fields.
 */
export async function enrichTracks(tracks) {
  if (!Array.isArray(tracks) || tracks.length === 0) return [];
  const out = [];
  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const artist = t?.artist ?? t?.artistName ?? '';
    const title = t?.title ?? t?.name ?? '';
    const enriched = await enrichTrack(artist, title);
    out.push({ ...t, ...enriched });
    if (i < tracks.length - 1) await new Promise((r) => setTimeout(r, 1100));
  }
  return out;
}
