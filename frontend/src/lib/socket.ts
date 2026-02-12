/**
 * Socket client — single source. Re-exports from realtime/socketClient so the app
 * uses one singleton and has joinRoom for players.
 */
import { getSocket as getSocketImpl, getSocketUrl, joinRoom as joinRoomImpl } from '../realtime/socketClient';
import type { Socket } from 'socket.io-client';

export const getSocket = getSocketImpl;

/** Join a game room as player (emits player:join). Use after getSocket() when code + name are ready. */
export function joinRoom(
  socket: Socket,
  opts: { code: string; role: 'player'; name: string }
): void {
  joinRoomImpl(socket, opts);
}

/** For debug/status: hostname we connect to. */
export function getSocketBackendLabel(): string {
  try {
    return new URL(getSocketUrl()).hostname;
  } catch {
    return typeof window !== 'undefined' ? window.location.hostname : 'unknown';
  }
}

/** True if this build was given a backend URL (VITE_SOCKET_URL or VITE_API_URL). */
export function isBackendUrlSet(): boolean {
  return !!(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL);
}
