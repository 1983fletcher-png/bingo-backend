import { io } from 'socket.io-client';

// Same backend URL as API: VITE_SOCKET_URL || VITE_API_URL || dev proxy / origin (see docs/FRONTEND-BACKEND-LINKING.md)
const url =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : window.location.origin);

export function getSocket() {
  return io(url, { path: '/socket.io', transports: ['websocket', 'polling'] });
}

/** For debug/status: hostname we connect to (so user can verify build has correct backend). */
export function getSocketBackendLabel(): string {
  const u = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
  if (u && typeof u === 'string') {
    try {
      return new URL(u).hostname;
    } catch {
      return 'set';
    }
  }
  if (import.meta.env.DEV) return 'dev (proxy)';
  return typeof window !== 'undefined' ? window.location.hostname : 'unknown';
}

/** True if this build was given a backend URL (VITE_SOCKET_URL or VITE_API_URL). */
export function isBackendUrlSet(): boolean {
  return !!(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL);
}
