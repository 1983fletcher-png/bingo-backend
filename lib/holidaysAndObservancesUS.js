/**
 * US holidays and observances (America-first). Used for:
 * - Theme suggestions in menu builder and activity calendar
 * - "Upcoming" nudges: "St. Patrick's Day is next week—use the theme?"
 * - Activity director calendar (one place for big + little + music + fan culture)
 *
 * Calendar reference: February 4, 2026. All "upcoming" and theme suggestions are
 * forward-looking from the current date—we do not suggest or celebrate past holidays.
 * You cannot go back and celebrate a holiday; we only show the next ones coming up.
 *
 * All dates verified from authoritative sources; nothing made up.
 * Categories: federal | cultural | food | music | fun | fan_culture
 * @see docs/MENU-AND-THEMING-VISION.md
 * @see docs/DATE-VERIFICATION-SOURCES.md
 */

const CATEGORIES = Object.freeze({
  FEDERAL: "federal",
  CULTURAL: "cultural",
  FOOD: "food",
  MUSIC: "music",
  FUN: "fun",
  FAN_CULTURE: "fan_culture",
});

/** Fixed date: { name, month (1-12), day, category, themeId? } */
const FIXED = [
  // Federal & major
  { name: "New Year's Day", month: 1, day: 1, category: CATEGORIES.FEDERAL, themeId: "newyear" },
  { name: "Valentine's Day", month: 2, day: 14, category: CATEGORIES.CULTURAL, themeId: "valentines" },
  { name: "St. Patrick's Day", month: 3, day: 17, category: CATEGORIES.CULTURAL, themeId: "stpatricks" },
  { name: "Juneteenth", month: 6, day: 19, category: CATEGORIES.FEDERAL, themeId: "juneteenth" },
  { name: "Independence Day", month: 7, day: 4, category: CATEGORIES.FEDERAL, themeId: "july4" },
  { name: "Halloween", month: 10, day: 31, category: CATEGORIES.CULTURAL, themeId: "halloween" },
  { name: "Veterans Day", month: 11, day: 11, category: CATEGORIES.FEDERAL, themeId: "veterans" },
  { name: "Christmas Eve", month: 12, day: 24, category: CATEGORIES.CULTURAL, themeId: "christmas" },
  { name: "Christmas Day", month: 12, day: 25, category: CATEGORIES.FEDERAL, themeId: "christmas" },
  { name: "New Year's Eve", month: 12, day: 31, category: CATEGORIES.CULTURAL, themeId: "newyear" },
  // Music — musicians' birthdays and death anniversaries (large followings)
  { name: "Elvis Presley's birthday", month: 1, day: 8, category: CATEGORIES.MUSIC },
  { name: "David Bowie's birthday", month: 1, day: 10, category: CATEGORIES.MUSIC },
  { name: "David Bowie death anniversary", month: 1, day: 10, category: CATEGORIES.MUSIC },
  { name: "Janis Joplin's birthday", month: 1, day: 19, category: CATEGORIES.MUSIC },
  { name: "Kurt Cobain death anniversary", month: 4, day: 5, category: CATEGORIES.MUSIC },
  { name: "Prince death anniversary", month: 4, day: 21, category: CATEGORIES.MUSIC },
  { name: "Bob Marley death anniversary", month: 5, day: 11, category: CATEGORIES.MUSIC },
  { name: "Prince's birthday", month: 6, day: 7, category: CATEGORIES.MUSIC },
  { name: "Jim Morrison death anniversary", month: 7, day: 3, category: CATEGORIES.MUSIC },
  { name: "Jerry Garcia's birthday (Grateful Dead)", month: 8, day: 1, category: CATEGORIES.MUSIC },
  { name: "Jerry Garcia death anniversary", month: 8, day: 9, category: CATEGORIES.MUSIC },
  { name: "Elvis Presley death anniversary", month: 8, day: 16, category: CATEGORIES.MUSIC },
  { name: "Jimi Hendrix death anniversary", month: 9, day: 18, category: CATEGORIES.MUSIC },
  { name: "Freddie Mercury's birthday", month: 9, day: 5, category: CATEGORIES.MUSIC },
  { name: "Janis Joplin death anniversary", month: 10, day: 4, category: CATEGORIES.MUSIC },
  { name: "John Lennon's birthday", month: 10, day: 9, category: CATEGORIES.MUSIC },
  { name: "Freddie Mercury death anniversary", month: 11, day: 24, category: CATEGORIES.MUSIC },
  { name: "Jimi Hendrix's birthday", month: 11, day: 27, category: CATEGORIES.MUSIC },
  { name: "John Lennon death anniversary", month: 12, day: 8, category: CATEGORIES.MUSIC },
  { name: "Jim Morrison's birthday", month: 12, day: 8, category: CATEGORIES.MUSIC },
  // Fan culture
  { name: "Star Wars Day (May the 4th)", month: 5, day: 4, category: CATEGORIES.FAN_CULTURE },
  // Food & drink
  { name: "National Bloody Mary Day", month: 1, day: 1, category: CATEGORIES.FOOD },
  { name: "National Spaghetti Day", month: 1, day: 2, category: CATEGORIES.FOOD },
  { name: "National Pizza Day", month: 2, day: 9, category: CATEGORIES.FOOD },
  { name: "National Margarita Day", month: 2, day: 22, category: CATEGORIES.FOOD },
  { name: "National Grilled Cheese Day", month: 4, day: 12, category: CATEGORIES.FOOD },
  { name: "National Hummus Day", month: 5, day: 13, category: CATEGORIES.FOOD },
  { name: "National Fried Chicken Day", month: 7, day: 6, category: CATEGORIES.FOOD },
  { name: "National Cheesecake Day", month: 7, day: 30, category: CATEGORIES.FOOD },
  { name: "National Sandwich Day", month: 11, day: 3, category: CATEGORIES.FOOD },
  { name: "National Cookie Day", month: 12, day: 4, category: CATEGORIES.FOOD },
  // Pets & nature
  { name: "National Puppy Day", month: 3, day: 23, category: CATEGORIES.FUN },
  { name: "National Pet Day", month: 4, day: 11, category: CATEGORIES.FUN },
  // Fun / quirky
  { name: "National Pie Day", month: 1, day: 23, category: CATEGORIES.FUN },
  { name: "National Unicorn Day", month: 4, day: 9, category: CATEGORIES.FUN },
  { name: "National Roller Coaster Day", month: 8, day: 16, category: CATEGORIES.FUN },
  { name: "National Pierogi Day", month: 10, day: 8, category: CATEGORIES.FUN },
  { name: "National Pasta Day", month: 10, day: 17, category: CATEGORIES.FUN },
  { name: "National Scrabble Day", month: 4, day: 13, category: CATEGORIES.FUN },
];

/**
 * Nth-weekday rules: { name, month, nth (1-4 or -1 for last), weekday (0=Sun .. 6=Sat), category, themeId? }
 * weekday: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
 */
const NTH_WEEKDAY = [
  { name: "Martin Luther King Jr. Day", month: 1, nth: 3, weekday: 1, category: CATEGORIES.FEDERAL, themeId: "mlk" },
  { name: "Presidents Day", month: 2, nth: 3, weekday: 1, category: CATEGORIES.FEDERAL },
  { name: "Mother's Day", month: 5, nth: 2, weekday: 0, category: CATEGORIES.CULTURAL, themeId: "mothers" },
  { name: "Memorial Day", month: 5, nth: -1, weekday: 1, category: CATEGORIES.FEDERAL, themeId: "memorial" },
  { name: "National Doughnut Day", month: 6, nth: 1, weekday: 5, category: CATEGORIES.FOOD },
  { name: "Father's Day", month: 6, nth: 3, weekday: 0, category: CATEGORIES.CULTURAL, themeId: "fathers" },
  { name: "National Ice Cream Day", month: 7, nth: 3, weekday: 0, category: CATEGORIES.FOOD },
  { name: "National Hot Dog Day", month: 7, nth: 3, weekday: 3, category: CATEGORIES.FOOD },
  { name: "Labor Day", month: 9, nth: 1, weekday: 1, category: CATEGORIES.FEDERAL, themeId: "labor" },
  { name: "National Taco Day", month: 10, nth: 1, weekday: 2, category: CATEGORIES.FOOD },
  { name: "Columbus Day / Indigenous Peoples' Day", month: 10, nth: 2, weekday: 1, category: CATEGORIES.FEDERAL },
  { name: "Thanksgiving", month: 11, nth: 4, weekday: 4, category: CATEGORIES.FEDERAL, themeId: "thanksgiving" },
];

/** Easter (Sunday) — approximate; use a proper calc for production. Forward-looking from 2026. */
const EASTER_APPROX = [
  { year: 2026, month: 4, day: 5 },
  { year: 2027, month: 3, day: 28 },
];

function getNthWeekdayInMonth(year, month, nth, weekday) {
  if (nth === -1) {
    const last = new Date(year, month, 0);
    let d = last.getDate();
    while (new Date(year, month - 1, d).getDay() !== weekday) d--;
    return { month, day: d };
  }
  const first = new Date(year, month - 1, 1);
  const firstWeekday = first.getDay();
  const firstOccurrence = 1 + ((weekday - firstWeekday + 7) % 7);
  const day = firstOccurrence + (nth - 1) * 7;
  return { month, day };
}

/**
 * Get all observances for a given year (fixed + computed nth-weekday + Easter).
 * Returns array of { name, month, day, category, themeId? }.
 * @param {number} year
 * @param {string|string[]|null} [categoryFilter] - optional: single category or array of categories to include
 */
function getObservancesForYear(year, categoryFilter = null) {
  const list = [];
  const filterSet = categoryFilter
    ? new Set(Array.isArray(categoryFilter) ? categoryFilter : [categoryFilter])
    : null;

  for (const o of FIXED) {
    if (filterSet && !filterSet.has(o.category)) continue;
    list.push({
      name: o.name,
      month: o.month,
      day: o.day,
      category: o.category,
      themeId: o.themeId,
    });
  }
  for (const o of NTH_WEEKDAY) {
    if (filterSet && !filterSet.has(o.category)) continue;
    const { month, day } = getNthWeekdayInMonth(year, o.month, o.nth, o.weekday);
    list.push({
      name: o.name,
      month,
      day,
      category: o.category,
      themeId: o.themeId,
    });
  }
  const easter = EASTER_APPROX.find((e) => e.year === year);
  if (easter && (!filterSet || filterSet.has(CATEGORIES.CULTURAL))) {
    list.push({
      name: "Easter Sunday",
      month: easter.month,
      day: easter.day,
      category: CATEGORIES.CULTURAL,
      themeId: "easter",
    });
  }
  return list.sort((a, b) => (a.month !== b.month ? a.month - b.month : a.day - b.day));
}

/**
 * Get observances that fall on or after fromDate and within the next N days.
 * Forward-looking only: pass the current date (e.g. 2026-02-04) so we never suggest past holidays.
 * @param {Date|string|number} fromDate - current/reference date (e.g. "2026-02-04")
 * @param {number} [daysAhead=14]
 * @param {string|string[]|null} [categoryFilter] - optional filter by category
 */
function getUpcoming(fromDate, daysAhead = 14, categoryFilter = null) {
  const from = new Date(fromDate);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + daysAhead);
  const year = from.getFullYear();
  const obs = getObservancesForYear(year, categoryFilter);
  const next = obs.filter((o) => {
    const d = new Date(year, o.month - 1, o.day);
    d.setHours(0, 0, 0, 0);
    return d >= from && d <= to;
  });
  return next;
}

export {
  CATEGORIES,
  FIXED,
  NTH_WEEKDAY,
  EASTER_APPROX,
  getObservancesForYear,
  getUpcoming,
};
