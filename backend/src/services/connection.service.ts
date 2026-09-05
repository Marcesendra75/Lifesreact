import prisma from '../config/prisma';

export async function sendConnectionRequest(requesterId: string, addresseeEmail: string) {
  const addressee = await prisma.user.findUnique({ where: { email: addresseeEmail } });

  if (!addressee) {
    throw new Error('No encontramos ninguna cuenta con ese email');
  }
  if (addressee.id === requesterId) {
    throw new Error('No podés enviarte una solicitud a vos mismo');
  }

  // revisamos los dos sentidos, para no permitir una segunda solicitud
  // si ya existe una pendiente o aceptada entre las mismas dos personas
  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId, addresseeId: addressee.id },
        { requesterId: addressee.id, addresseeId: requesterId },
      ],
    },
  });

  if (existing) {
    if (existing.status === 'accepted') {
      throw new Error('Ya están conectados');
    }
    if (existing.status === 'pending') {
      throw new Error('Ya hay una solicitud pendiente entre ustedes');
    }
    // si fue rechazada antes, la borramos para permitir reintentar
    await prisma.connection.delete({ where: { id: existing.id } });
  }

  return prisma.connection.create({
    data: { requesterId, addresseeId: addressee.id },
  });
}

export async function listConnections(userId: string, status?: 'pending' | 'accepted' | 'rejected') {
  return prisma.connection.findMany({
    where: {
      OR: [{ requesterId: userId }, { addresseeId: userId }],
      ...(status ? { status } : {}),
    },
    include: {
      requester: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      addressee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function acceptConnection(connectionId: string, userId: string) {
  const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection || connection.addresseeId !== userId) {
    throw new Error('Solicitud no encontrada');
  }
  if (connection.status !== 'pending') {
    throw new Error('Esta solicitud ya fue respondida');
  }

  return prisma.connection.update({
    where: { id: connectionId },
    data: { status: 'accepted', respondedAt: new Date() },
  });
}

export async function rejectConnection(connectionId: string, userId: string) {
  const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection || connection.addresseeId !== userId) {
    throw new Error('Solicitud no encontrada');
  }
  if (connection.status !== 'pending') {
    throw new Error('Esta solicitud ya fue respondida');
  }

  return prisma.connection.update({
    where: { id: connectionId },
    data: { status: 'rejected', respondedAt: new Date() },
  });
}

export async function removeConnection(connectionId: string, userId: string) {
  const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection || (connection.requesterId !== userId && connection.addresseeId !== userId)) {
    throw new Error('Conexión no encontrada');
  }
  await prisma.connection.delete({ where: { id: connectionId } });
}

// usado por family.service para confirmar que dos usuarios estén conectados
// antes de dejar que uno etiquete al otro en su árbol
export async function areConnected(userIdA: string, userIdB: string) {
  const connection = await prisma.connection.findFirst({
    where: {
      status: 'accepted',
      OR: [
        { requesterId: userIdA, addresseeId: userIdB },
        { requesterId: userIdB, addresseeId: userIdA },
      ],
    },
  });
  return !!connection;
}