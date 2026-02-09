/**
 * Interactive Polling store — standalone, independent from Trivia/Room.
 * In-memory; persist per poll: question, raw responses, grouped results, venue.
 */

import { customAlphabet } from 'nanoid';

const nanoidPoll = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);
const nanoidHost = customAlphabet('abcdefghjkmnpqrstuvwxyz23456789', 24);

const polls = new Map();

const PROFANITY_LIST = [
  'ass', 'butt', 'damn', 'crap', 'shit', 'fuck', 'fucking', 'fucker',
  'bitch', 'dick', 'cock', 'pussy', 'bastard', 'hell', 'piss', 'slut',
];
function maskProfanity(text) {
  if (!text || typeof text !== 'string') return '';
  let out = text;
  const re = new RegExp(PROFANITY_LIST.join('|'), 'gi');
  out = out.replace(re, (m) => {
    if (m.length <= 2) return m[0] + '***';
    return m[0] + '*'.repeat(Math.min(m.length - 1, 3)) + (m.length > 4 ? m.slice(-1) : '');
  });
  return out;
}

function normalizeInput(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Group raw responses: normalize key, count, keep first occurrence as display label. Top 8 + Other. */
function computeGrouped(rawResponses, responseType, options) {
  const byKey = new Map(); // normalizedKey -> { count, label (display), rawTexts[] }
  for (const r of rawResponses) {
    const raw = (r.text || r.optionId || '').trim();
    if (!raw) continue;
    const key = responseType === 'multiple' ? raw.toLowerCase() : normalizeInput(raw);
    if (!key) continue;
    const existing = byKey.get(key);
    const displayLabel = responseType === 'multiple' && options?.length
      ? (options.find((o) => o.trim().toLowerCase() === raw.toLowerCase()) || raw)
      : raw;
    if (existing) {
      existing.count += 1;
      existing.rawTexts.push(raw);
    } else {
      byKey.set(key, { count: 1, label: displayLabel, rawTexts: [raw] });
    }
  }
  const total = rawResponses.length;
  const entries = Array.from(byKey.entries())
    .map(([k, v]) => ({ key: k, ...v }))
    .sort((a, b) => b.count - a.count);
  const top8 = entries.slice(0, 8);
  const otherCount = total - top8.reduce((s, e) => s + e.count, 0);
  return {
    top8: top8.map((e) => ({ label: e.label, count: e.count, rawTexts: e.rawTexts })),
    otherCount: Math.max(0, otherCount),
    total,
  };
}

function buildPollPayload(poll, opts = {}) {
  const { forDisplay = false } = opts;
  const grouped = computeGrouped(poll.rawResponses, poll.responseType, poll.options);
  const top8 = grouped.top8.map((e) => ({
    label: forDisplay ? maskProfanity(e.label) : e.label,
    count: e.count,
    percentage: grouped.total > 0 ? Math.round((e.count / grouped.total) * 100) : 0,
  }));
  return {
    pollId: poll.pollId,
    question: poll.question,
    responseType: poll.responseType,
    options: poll.options || [],
    locked: poll.locked,
    venueName: poll.venueName || '',
    logoUrl: poll.logoUrl || null,
    showTicker: poll.showTicker !== false,
    rawResponsesCount: poll.rawResponses.length,
    grouped: {
      top8,
      otherCount: grouped.otherCount,
      total: grouped.total,
    },
    recentSubmission: poll.recentSubmission || null,
    createdAt: poll.createdAt,
  };
}

/**
 * @param {{
 *   question: string,
 *   responseType: 'open' | 'multiple',
 *   options?: string[],
 *   venueName?: string,
 *   logoUrl?: string | null,
 * }} opts
 */
export function createPoll(opts = {}) {
  let pollId;
  do {
    pollId = nanoidPoll();
  } while (polls.has(pollId));

  const question = (opts.question || '').trim();
  if (!question) return null;

  const responseType = opts.responseType === 'multiple' ? 'multiple' : 'open';
  const options = responseType === 'multiple' && Array.isArray(opts.options)
    ? opts.options.slice(0, 10).map((o) => String(o).trim()).filter(Boolean)
    : [];

  const poll = {
    pollId,
    hostToken: nanoidHost(),
    hostId: null,
    question,
    responseType,
    options,
    rawResponses: [],
    locked: false,
    venueName: (opts.venueName || '').trim(),
    logoUrl: opts.logoUrl && typeof opts.logoUrl === 'string' ? opts.logoUrl : null,
    showTicker: true,
    recentSubmission: null,
    createdAt: Date.now(),
  };
  polls.set(pollId, poll);
  return poll;
}

export function getPoll(pollId) {
  return polls.get(pollId) || null;
}

export function assertHost(poll, socketId, hostToken) {
  if (!poll) return false;
  if (poll.hostId === socketId) return true;
  if (hostToken && hostToken === poll.hostToken) {
    poll.hostId = socketId;
    return true;
  }
  return false;
}

/** Join as host, player, or display — all get same payload (poll:update shape). */
export function joinPoll(pollId, role, socketId, hostToken) {
  const poll = getPoll(pollId);
  if (!poll) return null;
  if (role === 'host') {
    if (hostToken && hostToken === poll.hostToken) poll.hostId = socketId;
    else if (!poll.hostId) poll.hostId = socketId;
  }
  return buildPollPayload(poll, { forDisplay: role === 'display' });
}

/** Submit a response (anonymous). One per device until host locks; same device can change answer (replace). */
export function submitResponse(pollId, payload, deviceId) {
  const poll = getPoll(pollId);
  if (!poll) return null;
  if (poll.locked) return null;

  const text = (payload.text || '').trim();
  const optionId = (payload.optionId || '').trim();
  if (deviceId) {
    poll.rawResponses = poll.rawResponses.filter((r) => r.deviceId !== deviceId);
  }
  const rid = `r-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  if (poll.responseType === 'multiple') {
    if (!optionId || !poll.options.some((o) => o.trim().toLowerCase() === optionId.toLowerCase())) return null;
    poll.rawResponses.push({ responseId: rid, optionId, text: optionId, timestamp: Date.now(), deviceId: deviceId || null });
  } else {
    if (!text || text.length > 500) return null;
    poll.rawResponses.push({ responseId: rid, text, timestamp: Date.now(), deviceId: deviceId || null });
  }
  poll.recentSubmission = { text: optionId || text, at: Date.now() };
  return buildPollPayload(poll);
}

/** Lock or unlock poll. */
export function setLocked(pollId, locked, hostToken, socketId) {
  const poll = getPoll(pollId);
  if (!poll || !assertHost(poll, socketId, hostToken)) return null;
  poll.locked = Boolean(locked);
  return buildPollPayload(poll);
}

/** Clear all responses. */
export function clearResults(pollId, hostToken, socketId) {
  const poll = getPoll(pollId);
  if (!poll || !assertHost(poll, socketId, hostToken)) return null;
  poll.rawResponses = [];
  poll.recentSubmission = null;
  return buildPollPayload(poll);
}

/** Reset poll (clear + unlock). */
export function resetPoll(pollId, hostToken, socketId) {
  const poll = getPoll(pollId);
  if (!poll || !assertHost(poll, socketId, hostToken)) return null;
  poll.rawResponses = [];
  poll.recentSubmission = null;
  poll.locked = false;
  return buildPollPayload(poll);
}

/** Toggle live ticker. */
export function setShowTicker(pollId, show, hostToken, socketId) {
  const poll = getPoll(pollId);
  if (!poll || !assertHost(poll, socketId, hostToken)) return null;
  poll.showTicker = Boolean(show);
  return buildPollPayload(poll);
}

/** Get payload for broadcast (host gets full; display gets masked). */
export function getPayloadForBroadcast(pollId, forDisplay = false) {
  const poll = getPoll(pollId);
  if (!poll) return null;
  return buildPollPayload(poll, { forDisplay });
}

/** Export: raw + grouped for analysis. */
export function exportPollData(pollId, hostToken, socketId) {
  const poll = getPoll(pollId);
  if (!poll || !assertHost(poll, socketId, hostToken)) return null;
  const grouped = computeGrouped(poll.rawResponses, poll.responseType, poll.options);
  return {
    pollId: poll.pollId,
    question: poll.question,
    responseType: poll.responseType,
    options: poll.options,
    venueName: poll.venueName,
    createdAt: poll.createdAt,
    locked: poll.locked,
    rawResponses: poll.rawResponses,
    grouped: grouped.top8.map((e) => ({ label: e.label, count: e.count })),
    otherCount: grouped.otherCount,
    total: grouped.total,
  };
}
