#!/usr/bin/env node
/**
 * Smoke test for observances API logic (no server required).
 * Run: node scripts/smoke-observances.js
 * Exit 0 = pass; exit 1 = fail.
 */

import { getUpcoming, getObservancesForYear, CATEGORIES } from '../lib/holidaysAndObservancesUS.js';

const from = '2026-02-04';
const days = 30;

const upcoming = getUpcoming(from, days, null);
if (!Array.isArray(upcoming)) {
  console.error('FAIL: getUpcoming should return an array');
  process.exit(1);
}
const hasShape = upcoming.every((o) => typeof o.name === 'string' && typeof o.month === 'number' && typeof o.day === 'number');
if (!hasShape) {
  console.error('FAIL: each observance must have name, month, day');
  process.exit(1);
}

const calendar = getObservancesForYear(2026, null);
const feb = calendar.filter((o) => o.month === 2);
if (!Array.isArray(feb) || feb.some((o) => o.month !== 2)) {
  console.error('FAIL: calendar filter by month');
  process.exit(1);
}

const withCategory = getUpcoming(from, 14, CATEGORIES.CULTURAL);
if (!Array.isArray(withCategory) || !withCategory.every((o) => o.category === CATEGORIES.CULTURAL)) {
  console.error('FAIL: category filter');
  process.exit(1);
}

console.log('OK observances: upcoming', upcoming.length, 'calendar Feb 2026', feb.length, 'cultural filter', withCategory.length);
process.exit(0);
