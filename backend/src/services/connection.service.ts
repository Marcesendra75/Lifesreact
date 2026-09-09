import prisma from '../config/prisma';
import { getSignedFileUrl } from './storage.service';
import { isBlockedEitherWay } from './block.service';
import { notify } from './notification.service';

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

  const creada = await prisma.connection.create({
    data: { requesterId, addresseeId: addressee.id },
  });
  await notify.connectionRequest(addressee.id, requesterId, creada.id);
  return creada;
}

export async function listConnections(userId: string, status?: 'pending' | 'accepted' | 'rejected') {
  const connections = await prisma.connection.findMany({
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

  const resueltas = await Promise.all(connections.map((c) => resolverPropuestaVencida(c)));

  return Promise.all(resueltas.map(async (c: any) => ({
    ...c,
    requester: { ...c.requester, avatarUrl: c.requester.avatarUrl ? await getSignedFileUrl(c.requester.avatarUrl) : null },
    addressee: { ...c.addressee, avatarUrl: c.addressee.avatarUrl ? await getSignedFileUrl(c.addressee.avatarUrl) : null },
  })));
}

export async function acceptConnection(connectionId: string, userId: string) {
  const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection || connection.addresseeId !== userId) {
    throw new Error('Solicitud no encontrada');
  }
  if (connection.status !== 'pending') {
    throw new Error('Esta solicitud ya fue respondida');
  }

  const actualizada = await prisma.connection.update({
    where: { id: connectionId },
    data: { status: 'accepted', respondedAt: new Date() },
  });

  await notify.connectionAccepted(connection.requesterId, userId, connectionId);
  return actualizada;
}

export async function rejectConnection(connectionId: string, userId: string) {
  const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection || connection.addresseeId !== userId) {
    throw new Error('Solicitud no encontrada');
  }
  if (connection.status !== 'pending') {
    throw new Error('Esta solicitud ya fue respondida');
  }

  const actualizada = await prisma.connection.update({
    where: { id: connectionId },
    data: { status: 'rejected', respondedAt: new Date() },
  });

  await notify.connectionRejected(connection.requesterId, userId, connectionId);
  return actualizada;
}

const DIAS_ESPERA_TRAS_RECHAZO_TIPO = 7;
const DIAS_LIMITE_PROPUESTA_TIPO = 30;

// Si hay una propuesta de tipo de vínculo pendiente y ya pasaron 30 días
// sin respuesta, la resolvemos sola como "amigo" — se llama de paso cada
// vez que se lee la conexión, no hace falta un cron corriendo aparte.
async function resolverPropuestaVencida(connection: any) {
  if (!connection.relationTypePendiente || !connection.relationTypePropuestoEn) return connection;

  const diasPasados = (Date.now() - connection.relationTypePropuestoEn.getTime()) / (1000 * 60 * 60 * 24);
  if (diasPasados < DIAS_LIMITE_PROPUESTA_TIPO) return connection;

  return prisma.connection.update({
    where: { id: connection.id },
    data: {
      relationType: 'amigo',
      relationTypePendiente: null,
      relationTypePropuestoPor: null,
      relationTypePropuestoEn: null,
    },
  });
}

export async function proponerTipoVinculo(connectionId: string, userId: string, tipo: string) {
  const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection || (connection.requesterId !== userId && connection.addresseeId !== userId)) {
    throw new Error('Conexión no encontrada');
  }
  if (connection.status !== 'accepted') {
    throw new Error('Solo podés establecer un tipo de vínculo con alguien ya conectado');
  }
  if (connection.relationTypePendiente) {
    throw new Error('Ya hay una propuesta de vínculo esperando respuesta');
  }
  if (connection.relationTypeRechazadoEn) {
    const diasPasados = (Date.now() - connection.relationTypeRechazadoEn.getTime()) / (1000 * 60 * 60 * 24);
    if (diasPasados < DIAS_ESPERA_TRAS_RECHAZO_TIPO) {
      const diasRestantes = Math.ceil(DIAS_ESPERA_TRAS_RECHAZO_TIPO - diasPasados);
      throw new Error(`La última propuesta fue rechazada. Podés volver a proponer en ${diasRestantes} día${diasRestantes === 1 ? '' : 's'}`);
    }
  }

  const actualizada = await prisma.connection.update({
    where: { id: connectionId },
    data: {
      relationTypePendiente: tipo as any,
      relationTypePropuestoPor: userId,
      relationTypePropuestoEn: new Date(),
      relationTypeRechazadoEn: null,
    },
  });

  const destinatario = connection.requesterId === userId ? connection.addresseeId : connection.requesterId;
  await notify.relationTypeProposed(destinatario, userId, connectionId);
  return actualizada;
}

export async function aceptarTipoVinculo(connectionId: string, userId: string) {
  let connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection || (connection.requesterId !== userId && connection.addresseeId !== userId)) {
    throw new Error('Conexión no encontrada');
  }
  connection = await resolverPropuestaVencida(connection);
  if (!connection) throw new Error('Conexión no encontrada');

  if (!connection.relationTypePendiente) {
    throw new Error('No hay ninguna propuesta pendiente');
  }
  if (connection.relationTypePropuestoPor === userId) {
    throw new Error('No podés aceptar tu propia propuesta');
  }

  const propuestoPor = connection.relationTypePropuestoPor as string;

  const actualizada = await prisma.connection.update({
    where: { id: connectionId },
    data: {
      relationType: connection.relationTypePendiente,
      relationTypePendiente: null,
      relationTypePropuestoPor: null,
      relationTypePropuestoEn: null,
    },
  });

  await notify.relationTypeAccepted(propuestoPor, userId, connectionId);
  return actualizada;
}

export async function rechazarTipoVinculo(connectionId: string, userId: string) {
  let connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection || (connection.requesterId !== userId && connection.addresseeId !== userId)) {
    throw new Error('Conexión no encontrada');
  }
  connection = await resolverPropuestaVencida(connection);
  if (!connection) throw new Error('Conexión no encontrada');

  if (!connection.relationTypePendiente) {
    throw new Error('No hay ninguna propuesta pendiente');
  }
  if (connection.relationTypePropuestoPor === userId) {
    throw new Error('No podés rechazar tu propia propuesta');
  }

  const propuestoPor = connection.relationTypePropuestoPor as string;

  const actualizada = await prisma.connection.update({
    where: { id: connectionId },
    data: {
      relationTypePendiente: null,
      relationTypePropuestoPor: null,
      relationTypePropuestoEn: null,
      relationTypeRechazadoEn: new Date(),
    },
  });

  await notify.relationTypeRejected(propuestoPor, userId, connectionId);
  return actualizada;
}

export async function cancelarTipoVinculo(connectionId: string, userId: string) {
  const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection || (connection.requesterId !== userId && connection.addresseeId !== userId)) {
    throw new Error('Conexión no encontrada');
  }
  if (!connection.relationTypePendiente) {
    throw new Error('No hay ninguna propuesta pendiente');
  }
  if (connection.relationTypePropuestoPor !== userId) {
    throw new Error('Solo quien propuso el vínculo puede cancelarlo');
  }

  const actualizada = await prisma.connection.update({
    where: { id: connectionId },
    data: {
      relationTypePendiente: null,
      relationTypePropuestoPor: null,
      relationTypePropuestoEn: null,
    },
  });

  const destinatario = connection.requesterId === userId ? connection.addresseeId : connection.requesterId;
  await notify.relationTypeCancelled(destinatario, userId, connectionId);
  return actualizada;
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

const DIAS_ESPERA_TRAS_RECHAZO = 7;

export async function sendConnectionRequestById(requesterId: string, addresseeId: string) {
  const addressee = await prisma.user.findUnique({ where: { id: addresseeId } });

  if (!addressee) {
    throw new Error('Usuario no encontrado');
  }
  if (addressee.id === requesterId) {
    throw new Error('No podés enviarte una solicitud a vos mismo');
  }

  if (await isBlockedEitherWay(requesterId, addressee.id)) {
    throw new Error('No podés enviar una solicitud a esta persona');
  }

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
    if (existing.status === 'rejected') {
      const diasPasados = existing.respondedAt
        ? (Date.now() - existing.respondedAt.getTime()) / (1000 * 60 * 60 * 24)
        : DIAS_ESPERA_TRAS_RECHAZO; // por las dudas, si por algún motivo no quedó respondedAt, no bloqueamos para siempre
      if (diasPasados < DIAS_ESPERA_TRAS_RECHAZO) {
        const diasRestantes = Math.ceil(DIAS_ESPERA_TRAS_RECHAZO - diasPasados);
        throw new Error(`Esta persona rechazó tu solicitud. Podés volver a intentarlo en ${diasRestantes} día${diasRestantes === 1 ? '' : 's'}`);
      }
    }
    await prisma.connection.delete({ where: { id: existing.id } });
  }

  const creada = await prisma.connection.create({
    data: { requesterId, addresseeId: addressee.id },
  });
  await notify.connectionRequest(addressee.id, requesterId, creada.id);
  return creada;
}

// usado por family.service para confirmar que dos usuarios estén conectados