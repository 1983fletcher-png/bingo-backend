/**
 * Trivia Room store — canonical state machine, players, responses, leaderboard.
 * In-memory; optional JSON persistence can be added later.
 * Room state shape aligns with frontend lib/models.ts (RoomModel, PlayerModel, etc.).
 */

import { customAlphabet } from 'nanoid';

const nanoidRoom = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

const triviaRooms = new Map();

const DEFAULT_SETTINGS = {
  leaderboardsVisibleToPlayers: true,
  leaderboardsVisibleOnDisplay: true,
  mcTipsEnabled: true,
  autoAdvanceEnabled: false,
  speedBonusEnabled: false,
};

/**
 * @param {{ pack: object, hostId: string, settings?: object }} opts
 * @returns {object} room
 */
export function createRoom(opts = {}) {
  const pack = opts.pack || null;
  const packId = pack?.id || '';
  const hostId = opts.hostId || '';
  const settings = { ...DEFAULT_SETTINGS, ...opts.settings };
  let roomId;
  do {
    roomId = nanoidRoom();
  } while (triviaRooms.has(roomId));

  const now = new Date().toISOString();
  const hostToken = customAlphabet('abcdefghjkmnpqrstuvwxyz23456789', 24)();
  const room = {
    roomId,
    createdAt: now,
    state: 'WAITING_ROOM',
    mode: 'trivia',
    packId,
    hostId,
    hostToken,
    settings,
    runtime: {
      currentQuestionIndex: 0,
      roundIndex: 0,
      questionStartAt: null,
      revealAt: null,
      endedAt: null,
    },
    pack: pack,
    players: new Map(),
    responses: [],
  };
  triviaRooms.set(roomId, room);
  return room;
}

export function getRoom(roomId) {
  return triviaRooms.get(roomId) || null;
}

const VALID_STATES = new Set([
  'ROOM_CREATED', 'WAITING_ROOM', 'READY_CHECK', 'ACTIVE_ROUND',
  'REVEAL', 'LEADERBOARD', 'REVIEW', 'END_ROOM'
]);

/** Allowed transitions: from -> to (so REVEAL only from ACTIVE_ROUND, etc.). */
const ALLOWED_TRANSITIONS = {
  ROOM_CREATED: ['WAITING_ROOM'],
  WAITING_ROOM: ['READY_CHECK', 'END_ROOM'],
  READY_CHECK: ['ACTIVE_ROUND', 'WAITING_ROOM'],
  ACTIVE_ROUND: ['REVEAL', 'LEADERBOARD'],
  REVEAL: ['LEADERBOARD', 'ACTIVE_ROUND'],
  LEADERBOARD: ['ACTIVE_ROUND', 'REVIEW', 'END_ROOM'],
  REVIEW: ['LEADERBOARD', 'END_ROOM'],
  END_ROOM: [],
};

export function updateRoomState(roomId, nextState) {
  const room = triviaRooms.get(roomId);
  if (!room || !VALID_STATES.has(nextState)) return false;
  const allowed = ALLOWED_TRANSITIONS[room.state];
  if (!Array.isArray(allowed) || !allowed.includes(nextState)) return false;
  room.state = nextState;
  const now = new Date().toISOString();
  if (nextState === 'ACTIVE_ROUND') room.runtime.questionStartAt = now;
  if (nextState === 'REVEAL') room.runtime.revealAt = now;
  if (nextState === 'END_ROOM') room.runtime.endedAt = now;
  return true;
}

export function advanceToNextQuestion(roomId) {
  const room = triviaRooms.get(roomId);
  if (!room || !room.pack?.questions?.length) return false;
  const next = room.runtime.currentQuestionIndex + 1;
  if (next >= room.pack.questions.length) return false;
  room.runtime.currentQuestionIndex = next;
  room.state = 'ACTIVE_ROUND';
  room.runtime.questionStartAt = new Date().toISOString();
  room.runtime.revealAt = null;
  return true;
}

/**
 * Ensure displayName is unique in the room; add suffix " (2)", " (3)" etc. if duplicate.
 */
function uniqueDisplayName(room, playerId, displayName) {
  const base = (displayName || 'Player').trim();
  const used = new Set();
  for (const [pid, p] of room.players) {
    if (pid === playerId) continue;
    used.add((p.displayName || '').trim().toLowerCase());
  }
  const baseLower = base.toLowerCase();
  if (!used.has(baseLower)) return base;
  let n = 2;
  while (used.has(`${baseLower} (${n})`)) n++;
  return `${base} (${n})`;
}

/**
 * @param {string} roomId
 * @param {{ playerId: string, displayName: string, isAnonymous: boolean }} player
 */
export function upsertPlayer(roomId, player) {
  const room = triviaRooms.get(roomId);
  if (!room) return null;
  const now = new Date().toISOString();
  const existing = room.players.get(player.playerId);
  const displayName = existing
    ? existing.displayName
    : uniqueDisplayName(room, player.playerId, player.displayName);
  const data = {
    playerId: player.playerId,
    displayName,
    isAnonymous: player.isAnonymous ?? false,
    joinedAt: existing?.joinedAt || now,
    lastSeenAt: now,
    score: existing?.score ?? 0,
    correctCount: existing?.correctCount ?? 0,
    answeredCount: existing?.answeredCount ?? 0,
  };
  room.players.set(player.playerId, data);
  return data;
}

/**
 * Compute points for a correct answer: basePoints + speed bonus (if enabled).
 * Speed bonus: floor((timeRemainingSec / timeLimitSec) * basePoints), cap at basePoints.
 */
export function computePoints(room, question, submittedAt) {
  const basePoints = question.scoring?.basePoints ?? 1;
  const speedBonusEnabled =
    room.settings?.speedBonusEnabled &&
    (question.scoring?.speedBonusEnabled !== false);
  if (!speedBonusEnabled || !room.runtime.questionStartAt || !question.timeLimitSec) {
    return basePoints;
  }
  const startMs = new Date(room.runtime.questionStartAt).getTime();
  const submittedMs = new Date(submittedAt).getTime();
  const elapsedSec = Math.max(0, Math.floor((submittedMs - startMs) / 1000));
  const timeRemainingSec = Math.max(0, question.timeLimitSec - elapsedSec);
  const bonus = Math.floor(
    (timeRemainingSec / question.timeLimitSec) * basePoints
  );
  const cappedBonus = Math.min(bonus, basePoints);
  return basePoints + cappedBonus;
}

/**
 * Remove existing response for (questionId, playerId) and undo its points/counts.
 * Used when player changes answer before reveal (last submission wins).
 */
export function removeResponseForPlayerQuestion(roomId, questionId, playerId) {
  const room = triviaRooms.get(roomId);
  if (!room) return null;
  const idx = room.responses.findIndex(
    (r) => r.questionId === questionId && r.playerId === playerId
  );
  if (idx === -1) return null;
  const existing = room.responses[idx];
  room.responses.splice(idx, 1);
  const p = room.players.get(playerId);
  if (p) {
    p.score = Math.max(0, (p.score || 0) - (existing.pointsAwarded || 0));
    p.answeredCount = Math.max(0, (p.answeredCount || 0) - 1);
    if (existing.isCorrect) p.correctCount = Math.max(0, (p.correctCount || 0) - 1);
  }
  return true;
}

/**
 * @param {string} roomId
 * @param {string} questionId
 * @param {string} playerId
 * @param {*} payload
 * @param {number} [pointsAwarded]
 * @param {boolean} [isCorrect]
 */
export function recordResponse(roomId, questionId, playerId, payload, pointsAwarded = 0, isCorrect = false) {
  const room = triviaRooms.get(roomId);
  if (!room) return null;
  const now = new Date().toISOString();
  room.responses.push({
    roomId,
    questionId,
    playerId,
    submittedAt: now,
    payload,
    pointsAwarded,
    isCorrect,
  });
  const p = room.players.get(playerId);
  if (p) {
    p.answeredCount = (p.answeredCount || 0) + 1;
    if (isCorrect) p.correctCount = (p.correctCount || 0) + 1;
    p.score = (p.score || 0) + (pointsAwarded || 0);
    p.lastSeenAt = now;
  }
  return true;
}

export function computeLeaderboard(roomId, limit = 10) {
  const room = triviaRooms.get(roomId);
  if (!room) return [];
  const list = Array.from(room.players.values())
    .map((p) => ({
      ...p,
      percentageCorrect: p.answeredCount > 0 ? Math.round((p.correctCount / p.answeredCount) * 100) : 0,
    }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return list.slice(0, limit);
}

/**
 * Build snapshot for room:snapshot event (and for rejoin).
 */
export function buildRoomSnapshot(roomId) {
  const room = triviaRooms.get(roomId);
  if (!room) return null;
  const questions = room.pack?.questions || [];
  const currentQuestion = questions[room.runtime.currentQuestionIndex] || null;
  const playersList = Array.from(room.players.values());
  const responsesCount = room.responses.filter(
    (r) => r.questionId === currentQuestion?.id
  ).length;
  const leaderboardTop = computeLeaderboard(roomId, 10);

  const runtime = { ...room.runtime };
  if (currentQuestion?.timeLimitSec != null) runtime.timeLimitSec = currentQuestion.timeLimitSec;

  return {
    room: {
      roomId: room.roomId,
      createdAt: room.createdAt,
      state: room.state,
      mode: room.mode,
      packId: room.packId,
      hostId: room.hostId,
      settings: room.settings,
      runtime,
    },
    players: playersList,
    currentQuestion: currentQuestion,
    responsesCount,
    leaderboardTop,
    pack: room.pack || undefined,
  };
}

export function updateRoomSetting(roomId, key, value) {
  const room = triviaRooms.get(roomId);
  if (!room || !room.settings) return false;
  if (Object.prototype.hasOwnProperty.call(room.settings, key)) {
    room.settings[key] = value;
    return true;
  }
  return false;
}

/**
 * Resolve dispute in REVEAL: confirm (no-op), accept_variant (add to question acceptedVariants), void (remove points for this question).
 */
export function resolveDispute(roomId, questionId, action, variantText) {
  const room = triviaRooms.get(roomId);
  if (!room || room.state !== 'REVEAL') return false;
  const q = room.pack?.questions?.find((qu) => qu.id === questionId);
  if (!q) return false;

  if (action === 'confirm') return true;
  if (action === 'accept_variant' && variantText && typeof variantText === 'string') {
    if (q.answer && typeof q.answer === 'object' && Array.isArray(q.answer.acceptedVariants)) {
      const v = variantText.trim();
      if (v && !q.answer.acceptedVariants.includes(v)) q.answer.acceptedVariants.push(v);
    }
    return true;
  }
  if (action === 'void') {
    for (const r of room.responses) {
      if (r.questionId !== questionId || !r.pointsAwarded) continue;
      const p = room.players.get(r.playerId);
      if (p) p.score = Math.max(0, (p.score || 0) - r.pointsAwarded);
    }
    return true;
  }
  return false;
}
