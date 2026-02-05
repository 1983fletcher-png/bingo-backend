import { io } from 'socket.io-client';

// Same backend URL as API: VITE_SOCKET_URL || VITE_API_URL || dev proxy / origin (see docs/FRONTEND-BACKEND-LINKING.md)
const url =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : window.location.origin);

export function getSocket() {
  return io(url, { path: '/socket.io', transports: ['websocket', 'polling'] });
}
