/**
 * Single socket client for Playroom — singleton, reconnect, join helpers.
 * Base URL: VITE_SOCKET_URL (preferred) else VITE_API_URL.
 * @see docs/ROUTES-THEME-FEUD-REFERENCE.md
 */

import { io, type Socket } from 'socket.io-client';

function getSocketUrl(): string {
  const raw =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? '' : window.location.origin);
  if (!raw || typeof raw !== 'string') return window.location.origin;
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}

const url = getSocketUrl();
let socketInstance: Socket | null = null;

/** Connect once (singleton). Reconnects automatically with limited attempts. */
export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(url, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });
    socketInstance.on('connect_error', (err) => {
      console.warn('[socketClient] connect_error:', err.message);
    });
    socketInstance.on('reconnect_failed', () => {
      console.warn('[socketClient] reconnect_failed');
    });
  }
  return socketInstance;
}

/** Join a game room as player (emits player:join). Use after getSocket() and when code + name are ready. */
export function joinRoom(
  socket: Socket,
  opts: { code: string; role: 'player'; name: string }
): void {
  if (opts.role !== 'player') return;
  socket.emit('player:join', {
    code: opts.code.trim().toUpperCase(),
    name: opts.name || 'Anonymous',
  });
}

/** For display: subscribe to game (emits display:subscribe with code). */
export function subscribeDisplay(socket: Socket, code: string): void {
  socket.emit('display:subscribe', { code: code.trim().toUpperCase() });
}

export { getSocketUrl };
