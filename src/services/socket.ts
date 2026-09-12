// ============================================
// LIFE'S — Cliente de tiempo real (Socket.IO)
// Una sola conexión compartida por toda la app, mientras haya sesión
// activa. Se conecta con connectSocket(token) al loguearse y se corta
// con disconnectSocket() al cerrar sesión.
// ============================================
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  // devolvemos la instancia existente aunque todavía esté conectando (no
  // solo cuando ya está "connected") — así, si varias pantallas llaman a
  // connectSocket casi al mismo tiempo, nunca se crean sockets duplicados
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}