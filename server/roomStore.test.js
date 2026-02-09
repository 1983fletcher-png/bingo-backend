/**
 * Unit tests for Trivia Room store: scoring (computePoints), dispute (resolveDispute), state transitions.
 * Run: node server/roomStore.test.js
 */
import assert from 'assert';
import {
  createRoom,
  getRoom,
  updateRoomState,
  advanceToNextQuestion,
  upsertPlayer,
  recordResponse,
  computePoints,
  computeLeaderboard,
  updateRoomSetting,
  resolveDispute,
  buildRoomSnapshot,
} from './roomStore.js';

// Use a fixed pack so we can test computePoints
const testPack = {
  id: 'test-pack',
  questions: [
    { id: 'q1', timeLimitSec: 30, scoring: { basePoints: 1 }, difficulty: 'easy' },
    { id: 'q2', timeLimitSec: 60, scoring: { basePoints: 2, speedBonusEnabled: true }, difficulty: 'medium' },
    { id: 'q3', timeLimitSec: 45, scoring: { basePoints: 3 }, difficulty: 'hard' },
  ],
};

function testComputePoints() {
  const room = createRoom({ pack: testPack, hostId: 'host1' });
  room.runtime.questionStartAt = new Date(Date.now() - 10 * 1000).toISOString(); // 10 sec ago
  const q = room.pack.questions[1];
  const submittedAt = new Date(Date.now() - 5 * 1000).toISOString(); // 5 sec after start => 25 sec remaining of 60
  room.settings.speedBonusEnabled = true;
  const points = computePoints(room, q, submittedAt);
  // timeRemaining = 25, timeLimit = 60, basePoints = 2 => bonus = floor(25/60*2) = 0, total = 2
  assert.ok(points >= 2 && points <= 3, `computePoints with speed bonus should be basePoints + bonus: ${points}`);
}

function testComputePointsNoSpeedBonus() {
  const room = createRoom({ pack: testPack, hostId: 'host1' });
  const q = room.pack.questions[0];
  q.scoring = { basePoints: 1, speedBonusEnabled: false };
  room.settings.speedBonusEnabled = false;
  const points = computePoints(room, q, new Date().toISOString());
  assert.strictEqual(points, 1, 'Without speed bonus, points should equal basePoints');
}

function testStateTransitions() {
  const room = createRoom({ pack: testPack, hostId: 'h1' });
  assert.strictEqual(room.state, 'WAITING_ROOM');
  assert.ok(updateRoomState(room.roomId, 'READY_CHECK'), 'WAITING_ROOM -> READY_CHECK');
  assert.ok(updateRoomState(room.roomId, 'ACTIVE_ROUND'), 'READY_CHECK -> ACTIVE_ROUND');
  assert.ok(updateRoomState(room.roomId, 'REVEAL'), 'ACTIVE_ROUND -> REVEAL');
  assert.ok(updateRoomState(room.roomId, 'LEADERBOARD'), 'REVEAL -> LEADERBOARD');
  // LEADERBOARD can transition to ACTIVE_ROUND (next round)
  assert.ok(updateRoomState(room.roomId, 'ACTIVE_ROUND'), 'LEADERBOARD -> ACTIVE_ROUND (next round)');
  assert.ok(!updateRoomState(room.roomId, 'WAITING_ROOM'), 'ACTIVE_ROUND -> WAITING_ROOM invalid');
}

function testAdvanceToNextQuestion() {
  const room = createRoom({ pack: testPack, hostId: 'h1' });
  updateRoomState(room.roomId, 'READY_CHECK');
  updateRoomState(room.roomId, 'ACTIVE_ROUND');
  assert.strictEqual(room.runtime.currentQuestionIndex, 0);
  advanceToNextQuestion(room.roomId);
  assert.strictEqual(room.runtime.currentQuestionIndex, 1);
  assert.strictEqual(room.state, 'ACTIVE_ROUND');
  advanceToNextQuestion(room.roomId);
  advanceToNextQuestion(room.roomId);
  assert.strictEqual(room.runtime.currentQuestionIndex, 2);
  const noMore = advanceToNextQuestion(room.roomId);
  assert.ok(!noMore, 'No more questions after last');
}

function testRecordResponseAndLeaderboard() {
  const room = createRoom({ pack: testPack, hostId: 'h1' });
  upsertPlayer(room.roomId, { playerId: 'p1', displayName: 'Alice', isAnonymous: false });
  upsertPlayer(room.roomId, { playerId: 'p2', displayName: 'Bob', isAnonymous: false });
  updateRoomState(room.roomId, 'READY_CHECK');
  updateRoomState(room.roomId, 'ACTIVE_ROUND');
  recordResponse(room.roomId, 'q1', 'p1', { optionId: 'A' }, 1, true);
  recordResponse(room.roomId, 'q1', 'p2', { optionId: 'B' }, 0, false);
  const lb = computeLeaderboard(room.roomId, 10);
  assert.strictEqual(lb.length, 2);
  assert.strictEqual(lb[0].playerId, 'p1');
  assert.strictEqual(lb[0].score, 1);
  assert.strictEqual(lb[1].score, 0);
}

function testResolveDisputeAcceptVariant() {
  const packWithShort = {
    id: 'test',
    questions: [
      { id: 'q1', type: 'short', answer: { primary: 'Paris', acceptedVariants: [] }, scoring: { basePoints: 1 } },
    ],
  };
  const room = createRoom({ pack: packWithShort, hostId: 'h1' });
  updateRoomState(room.roomId, 'READY_CHECK');
  updateRoomState(room.roomId, 'ACTIVE_ROUND');
  updateRoomState(room.roomId, 'REVEAL');
  const q = room.pack.questions[0];
  assert.strictEqual(q.answer.acceptedVariants.length, 0);
  const ok = resolveDispute(room.roomId, 'q1', 'accept_variant', 'paris');
  assert.ok(ok, 'resolveDispute accept_variant should return true');
  assert.ok(q.answer.acceptedVariants.includes('paris'), 'acceptedVariants should include new variant');
}

function testResolveDisputeVoid() {
  const packWithShort = {
    id: 'test2',
    questions: [{ id: 'q1', type: 'mc', answer: { correct: 'A' }, scoring: { basePoints: 2 } }],
  };
  const room = createRoom({ pack: packWithShort, hostId: 'h1' });
  upsertPlayer(room.roomId, { playerId: 'p1', displayName: 'P1', isAnonymous: false });
  updateRoomState(room.roomId, 'READY_CHECK');
  updateRoomState(room.roomId, 'ACTIVE_ROUND');
  recordResponse(room.roomId, 'q1', 'p1', { optionId: 'A' }, 2, true);
  updateRoomState(room.roomId, 'REVEAL');
  assert.strictEqual(room.players.get('p1').score, 2);
  const ok = resolveDispute(room.roomId, 'q1', 'void');
  assert.ok(ok, 'resolveDispute void should return true');
  assert.strictEqual(room.players.get('p1').score, 0);
}

function testBuildRoomSnapshot() {
  const room = createRoom({ pack: testPack, hostId: 'h1' });
  updateRoomState(room.roomId, 'READY_CHECK');
  updateRoomState(room.roomId, 'ACTIVE_ROUND');
  const snap = buildRoomSnapshot(room.roomId);
  assert.ok(snap);
  assert.strictEqual(snap.room.state, 'ACTIVE_ROUND');
  assert.ok(snap.room.runtime.questionStartAt);
  assert.strictEqual(snap.currentQuestion?.id, 'q1');
  assert.strictEqual(snap.room.runtime.timeLimitSec, 30, 'timeLimitSec should be from current question');
}

function run() {
  const tests = [
    testComputePoints,
    testComputePointsNoSpeedBonus,
    testStateTransitions,
    testAdvanceToNextQuestion,
    testRecordResponseAndLeaderboard,
    testResolveDisputeAcceptVariant,
    testResolveDisputeVoid,
    testBuildRoomSnapshot,
  ];
  let passed = 0;
  for (const t of tests) {
    try {
      t();
      passed++;
      console.log(`  ✓ ${t.name}`);
    } catch (err) {
      console.error(`  ✗ ${t.name}: ${err.message}`);
    }
  }
  console.log(`\n${passed}/${tests.length} tests passed`);
  process.exit(passed === tests.length ? 0 : 1);
}

run();
