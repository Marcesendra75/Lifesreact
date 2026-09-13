// ============================================
// LIFE'S — Chat 1 a 1 (Fase 1)
// Solicitud de mensaje: el destinatario ve los mensajes SIN marcarlos
// como leídos hasta que decide Aceptar/Rechazar/Bloquear/Spam. Mientras
// esté "pending" de su lado, el que inició solo puede mandar hasta
// LIMITE_MENSAJES_SIN_ACEPTAR mensajes.
// ============================================
import prisma from '../config/prisma';
import { isBlockedEitherWay } from './block.service';
import { areConnected } from './connection.service';
import { emitToUser, isUserOnline } from '../realtime/socket';
import { getSignedFileUrl, uploadFile, validateFile } from './storage.service';

const LIMITE_MENSAJES_SIN_ACEPTAR = 2;
const EMOJIS_REACCION_PERMITIDOS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '💪', '😍', '😘', '😡', '🥰', '🤔', '😭', '😋', '🔥', '🫂', '🫶'];

async function attachAvatares(users: any[]) {
  return Promise.all(users.map(async (u) => ({
    ...u,
    avatarUrl: u.avatarUrl ? await getSignedFileUrl(u.avatarUrl) : null,
  })));
}

function otroParticipante(conversation: any, userId: string) {
  return conversation.participants.find((p: any) => p.userId !== userId);
}

async function enrichMessage(mensaje: any) {
  const [avatarUrl, reactions, replyTo, attachmentUrl] = await Promise.all([
    mensaje.sender.avatarUrl ? getSignedFileUrl(mensaje.sender.avatarUrl) : Promise.resolve(null),
    prisma.messageReaction.findMany({ where: { messageId: mensaje.id }, select: { userId: true, emoji: true } }),
    mensaje.replyToId
      ? prisma.message.findUnique({
          where: { id: mensaje.replyToId },
          include: { sender: { select: { firstName: true, lastName: true } } },
        })
      : Promise.resolve(null),
    mensaje.attachmentKey && mensaje.attachmentType !== 'gif' && mensaje.attachmentType !== 'sticker'
      ? getSignedFileUrl(mensaje.attachmentKey)
      : Promise.resolve(mensaje.attachmentKey || null),
  ]);

  return {
    ...mensaje,
    sender: { ...mensaje.sender, avatarUrl },
    attachmentUrl,
    reactions,
    replyTo: replyTo
      ? {
          id: replyTo.id,
          content: replyTo.content,
          attachmentType: replyTo.attachmentType,
          senderName: `${replyTo.sender.firstName} ${replyTo.sender.lastName || ''}`.trim(),
        }
      : null,
  };
}

// validación compartida entre mandar texto y mandar un archivo
async function assertPuedeEscribir(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
  if (!conversation) throw new Error('Conversación no encontrada');

  const miFila = conversation.participants.find((p) => p.userId === userId);
  if (!miFila || miFila.status === 'left') throw new Error('No formás parte de esta conversación');
  if (miFila.status === 'blocked' || miFila.status === 'rejected') {
    throw new Error('Ya no podés escribir en esta conversación');
  }

  const otro = otroParticipante(conversation, userId);
  if (otro && (otro.status === 'blocked' || otro.status === 'rejected')) {
    throw new Error('Esta persona ya no puede recibir tus mensajes');
  }
  if (otro && otro.status === 'pending') {
    const yaMandados = await prisma.message.count({ where: { conversationId, senderId: userId } });
    if (yaMandados >= LIMITE_MENSAJES_SIN_ACEPTAR) {
      throw new Error(`Ya le enviaste ${LIMITE_MENSAJES_SIN_ACEPTAR} mensajes — esperá a que responda antes de escribirle de nuevo`);
    }
  }
}

// ── Empezar (o retomar) una conversación con alguien ──
export async function startConversation(userId: string, targetUserId: string, content: string) {
  if (userId === targetUserId) throw new Error('No podés escribirte a vos mismo');

  const bloqueados = await isBlockedEitherWay(userId, targetUserId);
  if (bloqueados) throw new Error('No podés enviarle mensajes a esta persona');

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) throw new Error('Usuario no encontrado');

  // ¿ya existe una conversación 1 a 1 entre estos dos?
  let conversation = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      participants: { every: { userId: { in: [userId, targetUserId] } } },
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: targetUserId } } },
      ],
    },
    include: { participants: true },
  });

  if (!conversation) {
    const yaConectados = await areConnected(userId, targetUserId);
    conversation = await prisma.conversation.create({
      data: {
        createdById: userId,
        participants: {
          create: [
            { userId, status: 'accepted' },
            { userId: targetUserId, status: yaConectados ? 'accepted' : 'pending' },
          ],
        },
      },
      include: { participants: true },
    });
  } else {
    // si ya existía pero VOS la habías rechazado/bloqueado de tu lado, al
    // volver a escribir vos mismo la reactivamos de tu lado únicamente
    const miFila = conversation.participants.find((p) => p.userId === userId);
    if (miFila && (miFila.status === 'rejected' || miFila.status === 'blocked')) {
      await prisma.conversationParticipant.update({ where: { id: miFila.id }, data: { status: 'accepted', isSpam: false } });
    }
  }

  const mensaje = await enviarMensajeInterno(conversation.id, userId, content);
  return { conversationId: conversation.id, message: mensaje };
}

// ── Enviar un mensaje a una conversación ya existente ──
export async function sendMessage(conversationId: string, userId: string, content: string, replyToId?: string) {
  await assertPuedeEscribir(conversationId, userId);

  let replyToIdValido: string | undefined;
  if (replyToId) {
    const original = await prisma.message.findFirst({ where: { id: replyToId, conversationId } });
    if (!original) throw new Error('El mensaje al que respondés ya no existe');
    replyToIdValido = original.id;
  }

  return enviarMensajeInterno(conversationId, userId, content, { replyToId: replyToIdValido });
}

// ── Enviar una imagen ──
export async function sendAttachment(
  conversationId: string,
  userId: string,
  file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  opts: { replyToId?: string; caption?: string } = {}
) {
  await assertPuedeEscribir(conversationId, userId);

  if (!file.mimetype.startsWith('image/')) throw new Error('Por ahora solo se pueden enviar imágenes');
  validateFile(file.mimetype, file.size);

  let replyToIdValido: string | undefined;
  if (opts.replyToId) {
    const original = await prisma.message.findFirst({ where: { id: opts.replyToId, conversationId } });
    if (!original) throw new Error('El mensaje al que respondés ya no existe');
    replyToIdValido = original.id;
  }

  const attachmentKey = await uploadFile(file.buffer, file.originalname, file.mimetype, 'chat');

  return enviarMensajeInterno(conversationId, userId, opts.caption || null, {
    replyToId: replyToIdValido,
    attachmentKey,
    attachmentType: 'image',
  });
}

async function enviarMensajeInterno(
  conversationId: string,
  senderId: string,
  content: string | null,
  opts: { replyToId?: string; attachmentKey?: string; attachmentType?: string } = {}
) {
  const mensaje = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
      replyToId: opts.replyToId,
      attachmentKey: opts.attachmentKey,
      attachmentType: opts.attachmentType,
    },
    include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  });

  await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
  const destinatarios = conversation!.participants.filter((p) => p.userId !== senderId);

  const mensajeEnriquecido = await enrichMessage(mensaje);

  for (const d of destinatarios) {
    emitToUser(d.userId, 'chat:message', { conversationId, message: mensajeEnriquecido });
  }

  return mensajeEnriquecido;
}

// ── Mandar un GIF o sticker de GIPHY (la URL ya es pública, no subimos nada nuestro) ──
export async function sendExternalMedia(conversationId: string, userId: string, url: string, type: 'gif' | 'sticker', replyToId?: string) {
  await assertPuedeEscribir(conversationId, userId);

  let replyToIdValido: string | undefined;
  if (replyToId) {
    const original = await prisma.message.findFirst({ where: { id: replyToId, conversationId } });
    if (!original) throw new Error('El mensaje al que respondés ya no existe');
    replyToIdValido = original.id;
  }

  return enviarMensajeInterno(conversationId, userId, null, {
    replyToId: replyToIdValido,
    attachmentKey: url,
    attachmentType: type,
  });
}

// ── Reaccionar a un mensaje (tocar el mismo emoji de nuevo lo saca) ──
export async function reactToMessage(messageId: string, userId: string, emoji: string) {
  if (!EMOJIS_REACCION_PERMITIDOS.includes(emoji)) throw new Error('Esa reacción no está disponible');

  const mensaje = await prisma.message.findUnique({ where: { id: messageId } });
  if (!mensaje) throw new Error('Mensaje no encontrado');

  const participante = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: mensaje.conversationId, userId } },
  });
  if (!participante) throw new Error('No formás parte de esta conversación');

  const existente = await prisma.messageReaction.findUnique({ where: { messageId_userId: { messageId, userId } } });

  if (existente && existente.emoji === emoji) {
    await prisma.messageReaction.delete({ where: { id: existente.id } });
  } else if (existente) {
    await prisma.messageReaction.update({ where: { id: existente.id }, data: { emoji } });
  } else {
    await prisma.messageReaction.create({ data: { messageId, userId, emoji } });
  }

  const reactions = await prisma.messageReaction.findMany({ where: { messageId }, select: { userId: true, emoji: true } });

  const conversation = await prisma.conversation.findUnique({ where: { id: mensaje.conversationId }, include: { participants: true } });
  const otro = otroParticipante(conversation!, userId);
  if (otro) emitToUser(otro.userId, 'chat:message-reaction', { conversationId: mensaje.conversationId, messageId, reactions });

  return { reactions };
}

// ── Fijar / desfijar un mensaje ──
export async function togglePin(messageId: string, userId: string) {
  const mensaje = await prisma.message.findUnique({ where: { id: messageId } });
  if (!mensaje) throw new Error('Mensaje no encontrado');

  const participante = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: mensaje.conversationId, userId } },
  });
  if (!participante) throw new Error('No formás parte de esta conversación');

  const actualizado = await prisma.message.update({ where: { id: messageId }, data: { isPinned: !mensaje.isPinned } });

  const conversation = await prisma.conversation.findUnique({ where: { id: mensaje.conversationId }, include: { participants: true } });
  const otro = otroParticipante(conversation!, userId);
  if (otro) emitToUser(otro.userId, 'chat:message-pin', { conversationId: mensaje.conversationId, messageId, isPinned: actualizado.isPinned });

  return { isPinned: actualizado.isPinned };
}

export async function listPinned(conversationId: string, userId: string) {
  const participante = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participante) throw new Error('No formás parte de esta conversación');

  const items = await prisma.message.findMany({
    where: { conversationId, isPinned: true },
    orderBy: { createdAt: 'desc' },
    include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  });
  return Promise.all(items.map((m) => enrichMessage(m)));
}

// ── Responder a la solicitud de mensaje ──
export async function respondToRequest(conversationId: string, userId: string, decision: 'accept' | 'reject' | 'block' | 'spam') {
  const participante = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participante) throw new Error('No formás parte de esta conversación');

  const nuevoStatus = decision === 'accept' ? 'accepted' : decision === 'reject' ? 'rejected' : 'blocked';
  await prisma.conversationParticipant.update({
    where: { id: participante.id },
    data: { status: nuevoStatus, isSpam: decision === 'spam' },
  });

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
  const otro = otroParticipante(conversation!, userId);
  if (otro && decision === 'accept') {
    emitToUser(otro.userId, 'chat:request-accepted', { conversationId });
  }
  if (otro && (decision === 'reject' || decision === 'spam' || decision === 'block')) {
    emitToUser(otro.userId, 'chat:request-rejected', { conversationId });
  }

  return { status: nuevoStatus };
}

// ── Marcar como leído ──
export async function markAsRead(conversationId: string, userId: string) {
  const participante = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participante) throw new Error('No formás parte de esta conversación');

  await prisma.conversationParticipant.update({ where: { id: participante.id }, data: { lastReadAt: new Date() } });

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
  const otro = otroParticipante(conversation!, userId);
  if (!otro) return;

  const [yo, otroUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { showReadReceipts: true } }),
    prisma.user.findUnique({ where: { id: otro.userId }, select: { showReadReceipts: true } }),
  ]);

  // recíproco, como WhatsApp: si cualquiera de los dos lo desactivó,
  // ninguno ve el "visto" del otro
  if (yo?.showReadReceipts && otroUser?.showReadReceipts) {
    emitToUser(otro.userId, 'chat:read', { conversationId, readAt: new Date() });
  }
}

// ── Listar mis conversaciones (bandeja normal, ya aceptadas) ──
export async function listConversations(userId: string) {
  return buildInbox(userId, 'accepted');
}

// ── Solicitudes de mensaje pendientes ──
export async function listMessageRequests(userId: string) {
  return buildInbox(userId, 'pending');
}

async function buildInbox(userId: string, statusFiltro: 'accepted' | 'pending') {
  const misParticipaciones = await prisma.conversationParticipant.findMany({
    where: { userId, status: statusFiltro },
    include: {
      conversation: {
        include: {
          participants: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      },
    },
    orderBy: { conversation: { updatedAt: 'desc' } },
  });

  return Promise.all(misParticipaciones.map(async (mp) => {
    const otro = mp.conversation.participants.find((p) => p.userId !== userId);
    const otroUser = otro ? (await attachAvatares([otro.user]))[0] : null;
    const ultimoMensaje = mp.conversation.messages[0] || null;
    const noLeidos = await prisma.message.count({
      where: {
        conversationId: mp.conversationId,
        senderId: { not: userId },
        createdAt: mp.lastReadAt ? { gt: mp.lastReadAt } : undefined,
      },
    });

    return {
      conversationId: mp.conversationId,
      otro: otroUser,
      ultimoMensaje,
      noLeidos,
      isPinned: mp.isPinned,
      mutedUntil: mp.mutedUntil,
      updatedAt: mp.conversation.updatedAt,
    };
  }));
}

export async function getMessageRequestsCount(userId: string) {
  const pendientes = await prisma.conversationParticipant.findMany({
    where: { userId, status: 'pending' },
    select: { conversationId: true },
  });
  return pendientes.length;
}

// para el ícono del Navbar — cuenta TODO lo que no leíste: tanto
// solicitudes de mensaje nuevas como mensajes nuevos en chats que ya
// tenías aceptados
export async function getUnreadTotalCount(userId: string) {
  const misParticipaciones = await prisma.conversationParticipant.findMany({
    where: { userId, status: { in: ['pending', 'accepted'] } },
  });

  let total = 0;
  for (const p of misParticipaciones) {
    if (p.status === 'pending') {
      total += 1; // cada solicitud sin responder cuenta como 1, sin importar cuántos mensajes tenga
      continue;
    }
    const noLeidos = await prisma.message.count({
      where: {
        conversationId: p.conversationId,
        senderId: { not: userId },
        createdAt: p.lastReadAt ? { gt: p.lastReadAt } : undefined,
      },
    });
    if (noLeidos > 0) total += 1; // 1 por conversación con pendientes, no por mensaje individual
  }
  return total;
}

// ── Historial de una conversación puntual ──
export async function getMessages(conversationId: string, userId: string, page: number, pageSize: number) {
  const participante = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participante) throw new Error('No formás parte de esta conversación');

  const [items, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    }),
    prisma.message.count({ where: { conversationId } }),
  ]);

  const withUrls = await Promise.all(items.map((m) => enrichMessage(m)));

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
  const otro = otroParticipante(conversation!, userId);

  let otroLastReadAt: Date | null = null;
  let otroPresencia: { online: boolean; lastSeenAt: Date | null } | null = null;

  if (otro) {
    const [yo, otroUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { showReadReceipts: true, showLastSeen: true } }),
      prisma.user.findUnique({ where: { id: otro.userId }, select: { showReadReceipts: true, showLastSeen: true, lastSeenAt: true } }),
    ]);
    if (yo?.showReadReceipts && otroUser?.showReadReceipts) otroLastReadAt = otro.lastReadAt;
    if (yo?.showLastSeen && otroUser?.showLastSeen) {
      otroPresencia = { online: isUserOnline(otro.userId), lastSeenAt: otroUser.lastSeenAt };
    }
  }

  return { items: withUrls.reverse(), total, page, pageSize, totalPages: Math.ceil(total / pageSize), otroLastReadAt, otroPresencia };
}

// ── "Escribiendo..." — no se guarda en la base, solo se retransmite ──
export async function notifyTyping(conversationId: string, userId: string, isTyping: boolean) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId }, include: { participants: true } });
  if (!conversation) return;
  const otro = otroParticipante(conversation, userId);
  if (otro) emitToUser(otro.userId, 'chat:typing', { conversationId, userId, isTyping });
}

// ── Config por conversación (silenciar, fijar) ──
export async function updateParticipantSettings(conversationId: string, userId: string, data: { mutedUntil?: Date | null; isPinned?: boolean }) {
  const participante = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participante) throw new Error('No formás parte de esta conversación');
  return prisma.conversationParticipant.update({ where: { id: participante.id }, data });
}