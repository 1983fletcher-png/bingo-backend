import { io } from 'socket.io-client';

const url =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV ? '' : window.location.origin);

export function getSocket() {
  return io(url, { path: '/socket.io', transports: ['websocket', 'polling'] });
}
