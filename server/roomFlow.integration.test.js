/**
 * Room flow integration test: host create, player join, state transitions, submit response.
 * Spawns the backend on a test port, runs socket clients, then exits.
 * Run: npm run test:room-flow
 * Requires: socket.io-client (devDependency). Install with npm install.
 */
import { spawn } from 'child_process';
import { io } from 'socket.io-client';

const TEST_PORT = Number(process.env.TEST_PORT) || 30999;
const BASE_URL = process.env.BASE_URL || `http://localhost:${TEST_PORT}`;

const minimalPack = {
  id: 'integration-test-pack',
  title: 'Integration Test Pack',
  presetType: 'weekly_bar_classic',
  durationMinutes: 5,
  audienceRating: 'pg13',
  themeTags: [],
  includesMedia: false,
  verified: false,
  verificationLevel: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  questions: [
    {
      id: 'q1',
      type: 'mc',
      prompt: 'What is 2 + 2?',
      difficulty: 'easy',
      timeLimitSec: 30,
      scoring: { basePoints: 1 },
      answer: { correct: 'B', options: [{ id: 'A', text: '3' }, { id: 'B', text: '4' }, { id: 'C', text: '5' }] },
      sources: [],
      flags: {},
    },
  ],
};

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function once(socket, event) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout waiting for ${event}`)), 8000);
    socket.once(event, (data) => {
      clearTimeout(t);
      resolve(data);
    });
  });
}

async function runTests() {
  let serverProcess = null;
  const useExternalServer = process.env.BASE_URL != null;

  if (!useExternalServer) {
    serverProcess = spawn('node', ['index.js'], {
      env: { ...process.env, PORT: String(TEST_PORT) },
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    serverProcess.stdout?.on('data', (d) => process.stdout.write(d));
    serverProcess.stderr?.on('data', (d) => process.stderr.write(d));
    await wait(2500);
  }

  const hostSocket = io(BASE_URL, { transports: ['websocket'], autoConnect: true });
  await new Promise((resolve, reject) => {
    hostSocket.on('connect', resolve);
    hostSocket.on('connect_error', reject);
    setTimeout(() => reject(new Error('host connect timeout')), 5000);
  });

  let roomId;
  let hostToken;
  hostSocket.emit('room:host-create', {
    pack: minimalPack,
    settings: { leaderboardsVisibleToPlayers: true, mcTipsEnabled: false, autoAdvanceEnabled: false },
  });

  const snapshot1 = await once(hostSocket, 'room:snapshot');
  if (!snapshot1.room || snapshot1.room.state !== 'WAITING_ROOM') throw new Error('expected WAITING_ROOM');
  roomId = snapshot1.room.roomId;
  if (!roomId) throw new Error('snapshot missing roomId');

  const created = await once(hostSocket, 'room:created');
  if (created.hostToken) hostToken = created.hostToken;

  const playerSocket = io(BASE_URL, { transports: ['websocket'], autoConnect: true });
  await new Promise((resolve, reject) => {
    playerSocket.on('connect', resolve);
    playerSocket.on('connect_error', reject);
    setTimeout(() => reject(new Error('player connect timeout')), 5000);
  });

  const playerId = 'test-player-' + Date.now();
  playerSocket.emit('room:join', {
    roomId,
    role: 'player',
    playerId,
    displayName: 'TestPlayer',
    isAnonymous: false,
  });
  const playerSnapshot = await once(playerSocket, 'room:snapshot');
  if (!playerSnapshot.room || !playerSnapshot.players?.some((p) => p.playerId === playerId)) throw new Error('player join failed');

  hostSocket.emit('room:host-set-state', { roomId, nextState: 'READY_CHECK' });
  const snapReady = await once(hostSocket, 'room:snapshot');
  if (snapReady.room.state !== 'READY_CHECK') throw new Error('expected READY_CHECK');

  hostSocket.emit('room:host-set-state', { roomId, nextState: 'ACTIVE_ROUND' });
  const snapActive = await once(hostSocket, 'room:snapshot');
  if (snapActive.room.state !== 'ACTIVE_ROUND') throw new Error('expected ACTIVE_ROUND');
  const currentQ = snapActive.currentQuestion;
  if (!currentQ || currentQ.id !== 'q1') throw new Error('expected current question q1');

  playerSocket.emit('room:submit-response', {
    roomId,
    questionId: 'q1',
    playerId,
    payload: { optionId: 'B' },
  });
  const snapAfterSubmit = await once(hostSocket, 'room:snapshot');
  if (snapAfterSubmit.responsesCount !== 1) throw new Error('expected 1 response');

  hostSocket.emit('room:host-set-state', { roomId, nextState: 'REVEAL' });
  const snapReveal = await once(hostSocket, 'room:snapshot');
  if (snapReveal.room.state !== 'REVEAL') throw new Error('expected REVEAL');

  hostSocket.emit('room:host-next', { roomId });
  const snapNext = await once(hostSocket, 'room:snapshot');
  if (snapNext.room.state !== 'LEADERBOARD') throw new Error('expected LEADERBOARD after next');

  hostSocket.close();
  playerSocket.close();
  if (serverProcess) serverProcess.kill('SIGTERM');
  console.log('Room flow integration: all steps passed.');
}

runTests().catch((err) => {
  console.error('Room flow integration failed:', err.message);
  process.exit(1);
});
