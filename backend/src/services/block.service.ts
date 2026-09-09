import prisma from '../config/prisma';
import { getSignedFileUrl } from './storage.service';

export async function blockUser(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) {
    throw new Error('No podés bloquearte a vos mismo');
  }

  const target = await prisma.user.findUnique({ where: { id: blockedId } });
  if (!target) {
    throw new Error('Usuario no encontrado');
  }

  // bloquear corta el vínculo activo (pendiente o aceptado) — pero si había
  // un rechazo previo, lo dejamos intacto para que el cooldown de 7 días
  // se siga respetando aunque bloqueen y desbloqueen a la persona
  await prisma.connection.deleteMany({
    where: {
      status: { in: ['pending', 'accepted'] },
      OR: [
        { requesterId: blockerId, addresseeId: blockedId },
        { requesterId: blockedId, addresseeId: blockerId },
      ],
    },
  });

  return prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    update: {},
    create: { blockerId, blockedId },
  });
}

export async function unblockUser(blockerId: string, blockedId: string) {
  await prisma.block.deleteMany({ where: { blockerId, blockedId } });
}

export async function listBlocked(blockerId: string) {
  const blocks = await prisma.block.findMany({
    where: { blockerId },
    include: { blocked: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return Promise.all(blocks.map(async (b) => ({
    id: b.id,
    blockedAt: b.createdAt,
    user: {
      id: b.blocked.id,
      firstName: b.blocked.firstName,
      lastName: b.blocked.lastName,
      avatarUrl: b.blocked.avatarUrl ? await getSignedFileUrl(b.blocked.avatarUrl) : null,
    },
  })));
}

// usado por otros services (búsqueda, perfil, conexiones) para saber si
// dos personas se bloquearon entre sí, en cualquiera de los dos sentidos
export async function isBlockedEitherWay(userIdA: string, userIdB: string) {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userIdA, blockedId: userIdB },
        { blockerId: userIdB, blockedId: userIdA },
      ],
    },
  });
  return !!block;
}