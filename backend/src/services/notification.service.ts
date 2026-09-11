import prisma from '../config/prisma';
import { getSignedFileUrl } from './storage.service';

const VENTANA_AGRUPADO_HORAS = 24; // reacciones/comentarios del mismo día se agrupan juntos

// Crea o suma a una notificación de reacción/comentario agrupada
async function notificarAgrupado(params: {
  userId: string;
  type: 'reaction' | 'comment';
  actorId: string;
  entityId: string;
}) {
  const { userId, type, actorId, entityId } = params;
  if (userId === actorId) return; // no te notificás a vos mismo

  const limite = new Date(Date.now() - VENTANA_AGRUPADO_HORAS * 60 * 60 * 1000);

  const existente = await prisma.notification.findFirst({
    where: { userId, type, entityType: 'memory', entityId, createdAt: { gte: limite } },
    orderBy: { createdAt: 'desc' },
  });

  if (!existente) {
    return prisma.notification.create({
      data: { userId, type, actorId, entityType: 'memory', entityId, actorIds: [actorId], actorsCount: 1 },
    });
  }

  const yaEstaba = existente.actorIds.includes(actorId);
  const actorIds = yaEstaba ? existente.actorIds : [...existente.actorIds, actorId];

  return prisma.notification.update({
    where: { id: existente.id },
    data: {
      actorId,
      actorIds,
      actorsCount: actorIds.length,
      isRead: false,
    },
  });
}

// Notificaciones simples (1 evento = 1 notificación, sin agrupar)
async function notificarSimple(params: {
  userId: string;
  type: 'connection_request' | 'connection_accepted' | 'connection_rejected' | 'relation_type_proposed' | 'relation_type_accepted' | 'relation_type_rejected' | 'relation_type_cancelled';
  actorId: string;
  entityId: string;
}) {
  const { userId, type, actorId, entityId } = params;
  if (userId === actorId) return;

  return prisma.notification.create({
    data: { userId, type, actorId, entityType: 'connection', entityId, actorIds: [actorId], actorsCount: 1 },
  });
}

export const notify = {
  connectionRequest: (userId: string, actorId: string, connectionId: string) =>
    notificarSimple({ userId, type: 'connection_request', actorId, entityId: connectionId }),
  connectionAccepted: (userId: string, actorId: string, connectionId: string) =>
    notificarSimple({ userId, type: 'connection_accepted', actorId, entityId: connectionId }),
  connectionRejected: (userId: string, actorId: string, connectionId: string) =>
    notificarSimple({ userId, type: 'connection_rejected', actorId, entityId: connectionId }),
  relationTypeProposed: (userId: string, actorId: string, connectionId: string) =>
    notificarSimple({ userId, type: 'relation_type_proposed', actorId, entityId: connectionId }),
  relationTypeAccepted: (userId: string, actorId: string, connectionId: string) =>
    notificarSimple({ userId, type: 'relation_type_accepted', actorId, entityId: connectionId }),
  relationTypeRejected: (userId: string, actorId: string, connectionId: string) =>
    notificarSimple({ userId, type: 'relation_type_rejected', actorId, entityId: connectionId }),
  relationTypeCancelled: (userId: string, actorId: string, connectionId: string) =>
    notificarSimple({ userId, type: 'relation_type_cancelled', actorId, entityId: connectionId }),
  reaction: (userId: string, actorId: string, memoryId: string) =>
    notificarAgrupado({ userId, type: 'reaction', actorId, entityId: memoryId }),
  comment: (userId: string, actorId: string, memoryId: string) =>
    notificarAgrupado({ userId, type: 'comment', actorId, entityId: memoryId }),
  commentReply: (userId: string, actorId: string, memoryId: string) => {
    if (userId === actorId) return Promise.resolve(undefined);
    return prisma.notification.create({
      data: { userId, type: 'comment_reply', actorId, entityType: 'memory', entityId: memoryId, actorIds: [actorId], actorsCount: 1 },
    });
  },
  familyLinkProposed: (userId: string, actorId: string, memberId: string) => {
    if (userId === actorId) return Promise.resolve(undefined);
    return prisma.notification.create({
      data: { userId, type: 'family_link_proposed', actorId, entityType: 'family_member', entityId: memberId, actorIds: [actorId], actorsCount: 1 },
    });
  },
  familyLinkAccepted: (userId: string, actorId: string, memberId: string) => {
    if (userId === actorId) return Promise.resolve(undefined);
    return prisma.notification.create({
      data: { userId, type: 'family_link_accepted', actorId, entityType: 'family_member', entityId: memberId, actorIds: [actorId], actorsCount: 1 },
    });
  },
  familyLinkRejected: (userId: string, actorId: string, memberId: string) => {
    if (userId === actorId) return Promise.resolve(undefined);
    return prisma.notification.create({
      data: { userId, type: 'family_link_rejected', actorId, entityType: 'family_member', entityId: memberId, actorIds: [actorId], actorsCount: 1 },
    });
  },
};

export async function listNotifications(userId: string, page: number, pageSize: number) {
  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { actor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  const withUrls = await Promise.all(items.map(async (n) => ({
    ...n,
    actor: n.actor
      ? { ...n.actor, avatarUrl: n.actor.avatarUrl ? await getSignedFileUrl(n.actor.avatarUrl) : null }
      : null,
  })));

  return { items: withUrls, total, unreadCount, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markAsRead(notificationId: string, userId: string) {
  const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notif || notif.userId !== userId) throw new Error('Notificación no encontrada');
  return prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}