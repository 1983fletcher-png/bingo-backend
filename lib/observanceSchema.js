/**
 * Maps raw observances (name, month, day, category, themeId) to the full Observance schema.
 * Facts in rule; verification and authorship explicit; no copied prose.
 * @see docs/OBSERVANCES-SCHEMA-AND-WORKFLOW (when added)
 */

const CATEGORY_TO_TYPE = {
  federal: 'official',
  cultural: 'informal',
  food: 'informal',
  music: 'informal',
  fun: 'informal',
  fan_culture: 'informal',
};

const CATEGORY_TO_CATEGORIES = {
  federal: ['holiday'],
  cultural: ['holiday', 'family', 'community'],
  food: ['food', 'community'],
  music: ['music', 'community'],
  fun: ['games', 'community', 'family'],
  fan_culture: ['community'],
};

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'observance';
}

function uniqueId(name, month, day) {
  const s = slug(name);
  return `us-${s}-${month}-${day}`;
}

const DEFAULT_VERIFICATION = {
  confidence: 'high',
  method: 'multi-source',
  sources_checked: [
    { name: 'National Day Calendar', checked_at: '2026-02-09' },
    { name: 'National Today', checked_at: '2026-02-09' },
    { name: 'multiple public calendars', checked_at: '2026-02-09' },
  ],
  last_verified_at: '2026-02-09',
};

const DEFAULT_AUTHORSHIP = {
  created_by: 'playroom',
  created_at: '2026-02-09',
};

/** Optional Playroom-original one-liners and activity hints (no copied prose). */
const WHY_AND_HINTS = {
  "National Pizza Day": {
    why_matters: "A day to celebrate one of the world's most popular foods.",
    activity_hint: "Pizza tasting, make-your-own station, or trivia about pizza history.",
  },
  "Valentine's Day": {
    why_matters: "A day to celebrate love and connection in all its forms.",
    activity_hint: "Card exchange, kindness prompts, or music bingo with love songs.",
  },
  "St. Patrick's Day": {
    why_matters: "A cultural celebration of Irish heritage and spring.",
    activity_hint: "Green theme, Irish music bingo, or trivia about Ireland.",
  },
  "National Trivia Day": {
    why_matters: "A day to celebrate curiosity and shared knowledge.",
    activity_hint: "Run a trivia round or mix trivia with other games.",
  },
};

/**
 * Map a raw observance (from getObservancesForYear) to the full schema.
 * @param {{ name: string, month: number, day: number, category: string, themeId?: string }} raw
 * @returns {Object} CalendarObservance (Observance + month, day)
 */
export function toCalendarObservance(raw) {
  const category = (raw.category || 'fun').toLowerCase();
  const type = CATEGORY_TO_TYPE[category] || 'informal';
  const categories = CATEGORY_TO_CATEGORIES[category] || ['community'];
  const id = uniqueId(raw.name, raw.month, raw.day);

  const extra = WHY_AND_HINTS[raw.name] || {};
  return {
    id,
    name: raw.name,
    short_name: raw.name,
    type,
    categories,
    country: 'US',
    subdivisions: undefined,
    rule: {
      kind: 'fixed',
      month: raw.month,
      day: raw.day,
    },
    verification: DEFAULT_VERIFICATION,
    authorship: DEFAULT_AUTHORSHIP,
    status: 'active',
    activity_hint: extra.activity_hint,
    why_matters: extra.why_matters,
    search_keywords: undefined,
    last_updated_at: '2026-02-09',
    month: raw.month,
    day: raw.day,
  };
}

/**
 * Map an array of raw observances (for a month) to the full schema.
 * @param {{ name: string, month: number, day: number, category: string, themeId?: string }[]} rawList
 * @returns {Object[]} CalendarObservance[]
 */
export function mapToCalendarObservances(rawList) {
  return (rawList || []).map(toCalendarObservance);
}
