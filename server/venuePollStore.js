/**
 * Venue-based polling: permanent join link per venue, active poll per venue, archive on end.
 * Used with pollStore for actual poll data.
 */

import { customAlphabet } from 'nanoid';

const nanoidVenue = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);
const nanoidHost = customAlphabet('abcdefghjkmnpqrstuvwxyz23456789', 24);

const venues = new Map();
const archives = [];

function createVenueCode() {
  let code;
  do {
    code = nanoidVenue();
  } while (venues.has(code));
  return code;
}

/**
 * Create a new venue. Returns { venueCode, hostToken }.
 */
export function createVenue() {
  const venueCode = createVenueCode();
  const hostToken = nanoidHost();
  const venue = {
    venueCode,
    hostToken,
    activePollId: null,
    createdAt: Date.now(),
  };
  venues.set(venueCode, venue);
  return { venueCode, hostToken };
}

export function getVenue(venueCode) {
  return venues.get((venueCode || '').trim().toUpperCase()) || null;
}

export function getActivePollId(venueCode) {
  const v = getVenue(venueCode);
  return v ? v.activePollId : null;
}

/**
 * Set the active poll for a venue. Returns true if venue exists and hostToken matches.
 */
export function setActivePoll(venueCode, pollId, hostToken) {
  const v = getVenue(venueCode);
  if (!v || v.hostToken !== hostToken) return false;
  v.activePollId = pollId;
  return true;
}

/**
 * End the current poll: archive it, clear activePollId. Returns archived payload or null.
 */
export function endPoll(venueCode, hostToken, getPollPayload) {
  const v = getVenue(venueCode);
  if (!v || v.hostToken !== hostToken) return null;
  const pollId = v.activePollId;
  if (!pollId || !getPollPayload) {
    v.activePollId = null;
    return null;
  }
  const payload = getPollPayload(pollId);
  if (payload) {
    archives.push({
      venueCode: v.venueCode,
      pollId,
      question: payload.question,
      responseType: payload.responseType,
      options: payload.options,
      grouped: payload.grouped,
      total: payload.grouped?.total ?? 0,
      locked: payload.locked,
      endedAt: Date.now(),
      createdAt: payload.createdAt,
    });
  }
  v.activePollId = null;
  return payload;
}

export function getArchives(venueCode, hostToken) {
  const v = getVenue(venueCode);
  if (!v || v.hostToken !== hostToken) return [];
  return archives.filter((a) => a.venueCode === venueCode);
}
