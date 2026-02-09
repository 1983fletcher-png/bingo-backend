import { io } from 'socket.io-client';

// Same backend URL as API: VITE_SOCKET_URL || VITE_API_URL || dev proxy / origin (see docs/FRONTEND-BACKEND-LINKING.md)
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

export function getSocket() {
  // Try polling first (more reliable through Railway/proxies), then upgrade to websocket
  return io(url, { path: '/socket.io', transports: ['polling', 'websocket'] });
}

/** For debug/status: hostname we connect to (so user can verify build has correct backend). */
export function getSocketBackendLabel(): string {
  try {
    return new URL(url).hostname;
  } catch {
    return typeof window !== 'undefined' ? window.location.hostname : 'unknown';
  }
}

/** True if this build was given a backend URL (VITE_SOCKET_URL or VITE_API_URL). */
export function isBackendUrlSet(): boolean {
  return !!(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL);
}
