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

// cuántas pestañas/dispositivos tiene conectados cada usuario ahora mismo —
// simple en memoria, alcanza para un solo proceso de backend
const conexionesPorUsuario = new Map<string, number>();

export function isUserOnline(userId: string): boolean {
  return (conexionesPorUsuario.get(userId) || 0) > 0;
}

// le avisamos SOLO a la gente con la que ya tenés una conversación
// aceptada (no a todo el mundo) — y solo si los dos tienen "mostrar
// última conexión" activado, misma reciprocidad que usamos en el resto
async function emitirPresencia(userId: string, online: boolean) {
  const prisma = (await import('../config/prisma')).default;

  const yo = await prisma.user.findUnique({ where: { id: userId }, select: { showLastSeen: true } });
  if (!yo?.showLastSeen) return;

  const misConversaciones = await prisma.conversationParticipant.findMany({
    where: { userId, status: 'accepted' },
    select: { conversationId: true },
  });
  const ids = misConversaciones.map((c) => c.conversationId);
  if (ids.length === 0) return;

  const otros = await prisma.conversationParticipant.findMany({
    where: { conversationId: { in: ids }, userId: { not: userId } },
    select: { userId: true, user: { select: { showLastSeen: true } } },
    distinct: ['userId'],
  });

  for (const o of otros) {
    if (!o.user.showLastSeen) continue;
    emitToUser(o.userId, 'chat:presence', { userId, online, lastSeenAt: online ? null : new Date().toISOString() });
  }
}

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
    const eraOffline = !conexionesPorUsuario.has(userId);
    conexionesPorUsuario.set(userId, (conexionesPorUsuario.get(userId) || 0) + 1);
    if (eraOffline) emitirPresencia(userId, true).catch(() => {});

    socket.on('disconnect', async () => {
      const restantes = (conexionesPorUsuario.get(userId) || 1) - 1;
      if (restantes <= 0) {
        conexionesPorUsuario.delete(userId);
        // recién cuando se desconecta la ÚLTIMA pestaña/dispositivo
        // actualizamos "última vez" — mientras tenga algo abierto en
        // cualquier lado, sigue contando como "en línea"
        const prisma = (await import('../config/prisma')).default;
        await prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } }).catch(() => {});
        emitirPresencia(userId, false).catch(() => {});
      } else {
        conexionesPorUsuario.set(userId, restantes);
      }
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