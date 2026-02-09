import { io, type Socket } from 'socket.io-client';

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

let socketInstance: Socket | null = null;

/** Single shared socket for the app. Prevents multiple connections and browser freeze. */
export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(url, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      // Limit reconnection attempts to prevent infinite retries and browser freezing
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      // Don't auto-connect if initial connection fails immediately
      autoConnect: true,
    });
    
    // Add error handler to prevent silent failures
    socketInstance.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
    });
    
    socketInstance.on('reconnect_failed', () => {
      console.warn('Socket reconnection failed after maximum attempts');
    });
  }
  return socketInstance;
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
