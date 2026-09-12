// ============================================
// LIFE'S — Servidor de tiempo real (Socket.IO)
// Base para notificaciones en vivo y, más adelante, el chat.
// Cada usuario conectado entra a una "room" con su propio userId —
// así emitToUser() le llega a todas sus pestañas/dispositivos abiertos
// sin tener que llevar un registro manual de sockets.
// ============================================
import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // mismo JWT que ya usás para las rutas HTTP — el cliente manda el token
  // al conectar, no en cada mensaje
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Token requerido'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lifes_secret') as { userId: string };
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error('Token inválido o expirado'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId as string;
    socket.join(userId);

    socket.on('disconnect', () => {
      // Socket.IO ya limpia la room solo al desconectar, no hace falta nada acá
    });
  });

  console.log('🔌 Socket.IO listo');
  return io;
}

// para emitir desde cualquier service sin pasar la instancia de mano en mano
export function emitToUser(userId: string, event: string, payload: unknown) {
  if (!io) return; // por si algo emite antes de que el server termine de levantar
  io.to(userId).emit(event, payload);
}