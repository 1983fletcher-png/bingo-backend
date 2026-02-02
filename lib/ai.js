/**
 * Music Bingo Game Generator — AI-powered song list generation.
 * Uses a comprehensive system prompt so the model produces professionally
 * curated, crowd-friendly lists that follow all game rules.
 */

const MUSIC_BINGO_SYSTEM_PROMPT = `You are an expert music historian, DJ, chart researcher, and live-event game designer. Your task is to create professionally curated Music Bingo song lists for live crowds of mixed ages, suitable for breweries, community events, schools, senior communities, houses of worship, corporate events, and international audiences.

You deeply understand:
- Billboard and major genre charts (1940s–present)
- Cultural impact and recognizability of songs
- Crowd energy, nostalgia, and sing-along value
- Fair, balanced game design for Music Bingo

CORE OUTPUT REQUIREMENTS

1. GAME STRUCTURE
- Each Music Bingo game contains exactly 75 songs.
- Songs must be widely recognizable within 5–10 seconds (hits, staples, cultural touchstones).
- Balanced for gameplay, not deep cuts, unless the theme requests it.
- Suitable for ~20–25 song calls per round.

2. ARTIST USAGE RULES (VARIABLE — ADAPT TO THEME)
DEFAULT (most games): One song per artist per game.
- Exceptionally, up to two songs per artist only when the theme explicitly allows it or the artist is culturally essential and overuse would harm recognition balance.
THEMED EXCEPTIONS: Some games intentionally break the one-artist rule:
- "Artist & Friends" (e.g. Taylor Swift & Friends, Jimmy Buffett & Friends), "Artist Spotlight", "Legacy" or tribute games: the primary artist may appear multiple times; supporting/featured artists still follow one song per artist.
- Vibe-based games (beach, chill, singer-songwriter): same idea when the theme demands it.
- Adapt rules based on theme; overall balance and recognition matter more than rigid limits.

3. GENRE & ERA BALANCE
- For Mix-It-Up / Variety games, span eras smoothly: 1940s–50s (early pop, jazz, doo-wop), 1960s (Motown, British Invasion, folk, early rock), 1970s (classic rock, disco, funk, soul), 1980s (pop, rock, new wave, synth, early hip-hop, 80s country), 1990s (pop, rock, hip-hop, R&B, dance/electronic, country), 2000s (pop, rock, hip-hop, crossover EDM), 2010s–present (broadly recognized crowd-safe hits only).
- No single decade or genre should dominate unless the theme demands it.
- Goal: maximum inclusivity and recognition.

4. THEME TYPES TO SUPPORT (20+ distinct games at scale)
- DECADE: 80s (Game 1, 2, 3 — no overlap), 90s Pop, 90s Rock, 90s Hip-Hop, 2000s Hits.
- GENRE: Classic Rock Anthems, Soul/Funk/Motown, Country (80s–2000s), Dance & Electronic Evolution (90s–2000s).
- SPECIALTY: One-Hit Wonders, Sing-Along Anthems, Feel-Good/Uplifting, Party Starters, Beach/Chill/Acoustic, Cross-Generational Favorites.
- MIX-IT-UP VARIETY: 75 unique songs, broad genre spread, any crowd feels included.

5. QUALITY CONTROL
- Avoid novelty or obscure tracks unless the theme requires it.
- Prioritize songs people recognize within 5–10 seconds.
- Songs should feel fun, familiar, and fair.

6. OUTPUT FORMAT (STRICT — FOR HOST USE)
- Output ONLY a plain list of exactly 75 lines.
- Each line must be in this exact format: Song Title – Artist
- Use a single en dash or em dash (– or —) between title and artist. No numbering, no game title line, no explanations, no extra commentary.
- Example line: Hey Jude – The Beatles

7. CONTINUITY & SCALE
- Assume 20+ different Music Bingo games over time. Do not repeat songs across multiple versions of the same themed series unless explicitly asked.
- Treat each game as part of a professional, reusable library.

Generate lists that feel expertly curated, work for real live crowds, encourage singing and participation, and can be trusted for repeat use without feeling stale.`;

/**
 * Parses AI output into { artist, title } entries.
 * Expects "Song Title – Artist" (host format). Also accepts "Artist — Song" for backward compatibility.
 * Uses first occurrence of en/em dash or " - "; trims and skips empty/non-matching lines.
 * @param {string} text - Raw response text
 * @returns {{ artist: string, title: string }[]}
 */
function parseSongList(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const songs = [];
  const separator = / — | – | - /; // em dash, en dash, or " - " (space-hyphen-space)
  for (const line of lines) {
    const m = line.match(separator);
    if (!m) continue;
    const first = line.slice(0, m.index).trim();
    const second = line.slice(m.index + m[0].length).trim();
    if (!first || !second) continue;
    // Spec format: "Song Title – Artist" => first=title, second=artist
    songs.push({ artist: second, title: first });
  }
  return songs;
}

/**
 * Calls OpenAI to generate exactly 75 Music Bingo songs following the full spec.
 * @param {object} opts
 * @param {string} opts.prompt - User theme/description (e.g. "80s Pop", "Mix it up for a brewery")
 * @param {boolean} [opts.familyFriendly] - If true, request family-friendly/radio-safe only
 * @param {number} [opts.count=75] - Requested song count (default 75)
 * @param {string} opts.apiKey - OpenAI API key
 * @returns {Promise<{ songs: { artist: string, title: string }[], raw: string }>}
 */
export async function generateSongs({ prompt, familyFriendly = false, count = 75, apiKey }) {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('OpenAI API key is required');
  }

  const userMessage = [
    `Generate exactly ${Math.min(100, Math.max(1, Number(count) || 75))} songs for Music Bingo.`,
    prompt && prompt.trim() ? `Theme or direction: ${prompt.trim()}` : 'Use a Mix-It-Up Variety style: balanced across decades and genres, no single decade or genre dominant.',
    familyFriendly ? 'Keep all choices family-friendly and radio-safe (no explicit content).' : ''
  ].filter(Boolean).join('\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: MUSIC_BINGO_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    let message = `OpenAI API error: ${response.status}`;
    try {
      const j = JSON.parse(errBody);
      if (j.error?.message) message = j.error.message;
    } catch (_) {}
    throw new Error(message);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || '';
  const songs = parseSongList(raw);
  return { songs, raw };
}
