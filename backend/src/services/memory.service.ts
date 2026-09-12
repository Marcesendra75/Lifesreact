import prisma from '../config/prisma';
import { uploadFile, deleteFile, validateFile, getSignedFileUrl } from './storage.service';
import { areConnected } from './connection.service';
import { isBlockedEitherWay } from './block.service';
import { notify } from './notification.service';
import { getHiddenMemoryIds, getMutedUserIds, getHiddenCommentIds, listSavedMemoryIds } from './interaction.service';

interface CreateMemoryInput {
  userId: string;
  caption?: string;
  chapterId?: string;
  file?: Express.Multer.File;
}

export async function createMemory({ userId, caption, chapterId, file }: CreateMemoryInput) {
  if (!caption && !file) {
    throw new Error('El recuerdo necesita al menos texto o un archivo');
  }

  // si viene un capítulo, confirmamos que sea tuyo
  if (chapterId) {
    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter || chapter.ownerId !== userId) {
      throw new Error('Capítulo no encontrado o no te pertenece');
    }
  }

  let mediaKey: string | undefined;
  let mediaType: 'image' | 'video' | undefined;

  if (file) {
    validateFile(file.mimetype, file.size);
    mediaKey = await uploadFile(file.buffer, file.originalname, file.mimetype, 'memories');
    mediaType = file.mimetype.startsWith('video') ? 'video' : 'image';
  }

  const memory = await prisma.memory.create({
    data: { userId, caption, mediaKey, mediaType, chapterId },
  });

  return enrichMemory(memory, userId);
}

export async function listMemories(userId: string, page: number, pageSize: number) {
  const [items, total] = await Promise.all([
    prisma.memory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.memory.count({ where: { userId } }),
  ]);

  const withExtras = await Promise.all(items.map((m) => enrichMemory(m, userId)));

  return { items: withExtras, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// ── Feed social: tus recuerdos + los de tus conexiones aceptadas ──
export async function getFeed(userId: string, page: number, pageSize: number) {
  const connections = await prisma.connection.findMany({
    where: {
      status: 'accepted',
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  const connectionIds = connections.map((c) =>
    c.requesterId === userId ? c.addresseeId : c.requesterId
  );
  const authorIds = [userId, ...connectionIds];

  // sacamos del feed lo que el usuario ocultó puntualmente, y todo lo que
  // venga de gente que silenció (sin romper la conexión ni avisarle a nadie)
  const [hiddenIds, mutedIds] = await Promise.all([
    getHiddenMemoryIds(userId),
    getMutedUserIds(userId),
  ]);
  const autoresVisibles = authorIds.filter((id) => !mutedIds.includes(id));

  const where = {
    userId: { in: autoresVisibles },
    id: { notIn: hiddenIds },
  };

  const [items, total] = await Promise.all([
    prisma.memory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    }),
    prisma.memory.count({ where }),
  ]);

  const withExtras = await Promise.all(items.map((m) => enrichFeedMemory(m, userId)));

  return { items: withExtras, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// ── Recuerdos de otra persona (para su perfil) ──
// Misma regla de privacidad que el perfil público: los ve si es él mismo,
// si están conectados, o si el perfil no es privado. Nunca si hay bloqueo.
export async function listMemoriesOfUser(targetUserId: string, viewerId: string, page: number, pageSize: number) {
  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target || !target.isActive) {
    throw new Error('Usuario no encontrado');
  }

  const esUnoMismo = targetUserId === viewerId;

  if (!esUnoMismo && await isBlockedEitherWay(viewerId, targetUserId)) {
    throw new Error('No podés ver los recuerdos de esta persona');
  }

  if (!esUnoMismo) {
    const conectados = await areConnected(viewerId, targetUserId);
    if (!conectados && target.isPrivate) {
      throw new Error('Este perfil es privado');
    }
  }

  const [items, total] = await Promise.all([
    prisma.memory.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.memory.count({ where: { userId: targetUserId } }),
  ]);

  const withExtras = await Promise.all(items.map((m) => enrichMemory(m, viewerId)));

  return { items: withExtras, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getMemoryById(id: string, viewerId?: string) {
  const memory = await prisma.memory.findUnique({ where: { id } });
  if (!memory) return null;
  return enrichMemory(memory, viewerId);
}

// ── Publicaciones guardadas ──
// Trae los recuerdos que el usuario guardó, con los mismos datos que el feed
// (autor, reacciones, comentarios). Si guardaste algo de alguien que después
// te bloqueó (o vos a él), lo salteamos en vez de romper la lista.
export async function listSavedMemories(userId: string, page: number, pageSize: number) {
  const idsGuardadosEnOrden = await listSavedMemoryIds(userId);

  const memorias = await prisma.memory.findMany({
    where: { id: { in: idsGuardadosEnOrden } },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  });

  const noBloqueadas: typeof memorias = [];
  for (const m of memorias) {
    if (m.userId === userId || !(await isBlockedEitherWay(userId, m.userId))) {
      noBloqueadas.push(m);
    }
  }

  // reordenamos según el orden real en que se guardaron (más reciente primero,
  // ya que listSavedMemoryIds las trae en ese orden)
  const porId = new Map(noBloqueadas.map((m) => [m.id, m]));
  const ordenadas = idsGuardadosEnOrden.map((id) => porId.get(id)).filter((m): m is NonNullable<typeof m> => !!m);

  const total = ordenadas.length;
  const pagina = ordenadas.slice((page - 1) * pageSize, page * pageSize);
  const withExtras = await Promise.all(pagina.map((m) => enrichFeedMemory(m, userId)));

  return { items: withExtras, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// ¿el viewer puede ver los recuerdos de ownerId? (es él mismo, o están conectados)
export async function puedeVerRecuerdoDe(ownerId: string, viewerId: string) {
  if (ownerId === viewerId) return true;
  const conexion = await prisma.connection.findFirst({
    where: {
      status: 'accepted',
      OR: [
        { requesterId: ownerId, addresseeId: viewerId },
        { requesterId: viewerId, addresseeId: ownerId },
      ],
    },
  });
  return !!conexion;
}

const MINUTOS_LIMITE_EDICION = 60;

export async function updateMemoryCaption(id: string, userId: string, caption: string) {
  const memory = await prisma.memory.findUnique({ where: { id } });
  if (!memory || memory.userId !== userId) {
    throw new Error('Recuerdo no encontrado o no te pertenece');
  }

  const minutosPasados = (Date.now() - memory.createdAt.getTime()) / 60000;
  if (minutosPasados > MINUTOS_LIMITE_EDICION) {
    throw new Error(`Ya pasó más de ${MINUTOS_LIMITE_EDICION} minutos — este recuerdo no se puede editar`);
  }

  await prisma.memory.update({ where: { id }, data: { caption } });
  return getMemoryById(id, userId);
}

export async function deleteMemory(id: string, userId: string) {
  const memory = await prisma.memory.findUnique({ where: { id } });
  if (!memory || memory.userId !== userId) {
    throw new Error('Recuerdo no encontrado o no te pertenece');
  }

  if (memory.mediaKey) {
    await deleteFile(memory.mediaKey);
  }

  await prisma.memory.delete({ where: { id } });
}

// ── Reacciones (reemplaza el like simple: 4 tipos, una sola activa por persona) ──
const REACTION_TYPES = ['emocionante', 'inspirador', 'recordare', 'conmueve'] as const;

function contadoresVacios() {
  return { emocionante: 0, inspirador: 0, recordare: 0, conmueve: 0, divierte: 0 };
}

export async function setReaction(memoryId: string, userId: string, type: string) {
  const memory = await prisma.memory.findUnique({ where: { id: memoryId } });
  if (!memory) throw new Error('Recuerdo no encontrado');

  const existing = await prisma.memoryReaction.findUnique({
    where: { memoryId_userId: { memoryId, userId } },
  });

  let miReaccion: string | null = type;

  try {
    if (existing && existing.type === type) {
      // tocaste la misma reacción de nuevo → se saca
      await prisma.memoryReaction.delete({ where: { id: existing.id } });
      miReaccion = null;
    } else if (existing) {
      // tenías otra reacción puesta → cambia
      await prisma.memoryReaction.update({ where: { id: existing.id }, data: { type: type as any } });
    } else {
      await prisma.memoryReaction.create({ data: { memoryId, userId, type: type as any } });
    }
  } catch (err: any) {
    // P2025 = intentamos borrar/actualizar algo que ya no existía (llegó un clic duplicado después).
    // P2002 = dos clics casi simultáneos intentaron crear la reacción al mismo tiempo; uno gana,
    // el otro choca contra la restricción de "una reacción por persona" — no es un error real.
    // En ambos casos, el resultado final ya es el que queríamos: seguimos y devolvemos el estado
    // actual real de la base, en vez de romper con un 400.
    if (err.code !== 'P2025' && err.code !== 'P2002') throw err;

    const actual = await prisma.memoryReaction.findUnique({
      where: { memoryId_userId: { memoryId, userId } },
    });
    miReaccion = actual?.type || null;
  }

  const conteos = await prisma.memoryReaction.groupBy({
    by: ['type'],
    where: { memoryId },
    _count: true,
  });
  const reactionCounts = contadoresVacios();
  conteos.forEach((c) => { (reactionCounts as any)[c.type] = c._count; });

  // solo notificamos cuando quedó puesta una reacción, no cuando se sacó
  if (miReaccion) {
  await notify.reaction(memory.userId, userId, memoryId, type);
  }

  return { miReaccion, reactionCounts };
}

export async function incrementShareCount(memoryId: string) {
  const memory = await prisma.memory.update({
    where: { id: memoryId },
    data: { sharesCount: { increment: 1 } },
  });
  return { sharesCount: memory.sharesCount };
}

// ── Comentarios ──
export async function addComment(memoryId: string, userId: string, content: string, parentId?: string) {
  const memory = await prisma.memory.findUnique({ where: { id: memoryId } });
  if (!memory) throw new Error('Recuerdo no encontrado');

  // Respetamos la configuración de privacidad de comentarios del dueño
  // del recuerdo — a él mismo siempre se le permite comentar en lo suyo
  if (memory.userId !== userId) {
    const owner = await prisma.user.findUnique({
      where: { id: memory.userId },
      select: { commentPrivacy: true },
    });

    if (owner?.commentPrivacy === 'nobody') {
      throw new Error('Esta persona no permite comentarios en sus recuerdos');
    }
    if (owner?.commentPrivacy === 'connections') {
      const conectados = await areConnected(memory.userId, userId);
      if (!conectados) {
        throw new Error('Solo las conexiones de esta persona pueden comentar');
      }
    }
  }

  // Un solo nivel de anidamiento: si respondés una respuesta, se "achata"
  // contra la raíz del hilo — pero igual notificamos puntualmente a la
  // persona a la que le respondiste, no al dueño de la raíz
  let parentIdFinal: string | null = null;
  let aQuienNotificar: string | null = null;

  if (parentId) {
    const comentarioRespondido = await prisma.memoryComment.findUnique({ where: { id: parentId } });
    if (!comentarioRespondido || comentarioRespondido.memoryId !== memoryId) {
      throw new Error('El comentario que intentás responder no existe');
    }
    parentIdFinal = comentarioRespondido.parentId ?? comentarioRespondido.id;
    aQuienNotificar = comentarioRespondido.userId;
  }

  const comment = await prisma.memoryComment.create({
    data: { memoryId, userId, content, parentId: parentIdFinal, replyToUserId: aQuienNotificar },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  });

  if (aQuienNotificar) {
    await notify.commentReply(aQuienNotificar, userId, memoryId);
  } else {
    await notify.comment(memory.userId, userId, memoryId);
  }

  return enrichComment(comment, userId, !parentIdFinal);
}

const VENTANA_EDICION_MINUTOS = 60;

export async function editComment(commentId: string, userId: string, content: string) {
  const comment = await prisma.memoryComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error('Comentario no encontrado');
  if (comment.userId !== userId) throw new Error('Solo podés editar tus propios comentarios');

  const minutosPasados = (Date.now() - comment.createdAt.getTime()) / 60000;
  if (minutosPasados > VENTANA_EDICION_MINUTOS) {
    throw new Error('Ya pasó la hora para editar este comentario');
  }

  const actualizado = await prisma.memoryComment.update({
    where: { id: commentId },
    data: { content, editedAt: new Date() },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  });

  return enrichComment(actualizado, userId, !actualizado.parentId);
}

export async function listComments(memoryId: string, viewerId: string, page: number, pageSize: number) {
  const ocultosIds = await getHiddenCommentIds(viewerId);
  // acá solo traemos los comentarios raíz — las respuestas se piden aparte
  // con listReplies, contraídas detrás de un "Ver N respuestas" por defecto
  const where = { memoryId, parentId: null, id: { notIn: ocultosIds } };

  const [items, total, ocultosDeEstePost] = await Promise.all([
    prisma.memoryComment.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    }),
    prisma.memoryComment.count({ where }),
    // los que ocultaste, pero solo los de ESTE post y solo raíz
    prisma.memoryComment.findMany({
      where: { memoryId, parentId: null, id: { in: ocultosIds } },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    }),
  ]);

  const [withUrls, ocultosConUrls] = await Promise.all([
    Promise.all(items.map((c) => enrichComment(c, viewerId, true))),
    Promise.all(ocultosDeEstePost.map((c) => enrichComment(c, viewerId, true))),
  ]);

  return {
    items: withUrls,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    ocultos: ocultosConUrls,
  };
}

// ── Respuestas de un hilo (se piden aparte, al desplegar "Ver N respuestas") ──
export async function listReplies(commentId: string, viewerId: string) {
  const ocultosIds = await getHiddenCommentIds(viewerId);
  const replies = await prisma.memoryComment.findMany({
    where: { parentId: commentId, id: { notIn: ocultosIds } },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  });
  return Promise.all(replies.map((r) => enrichComment(r, viewerId, false)));
}

export async function deleteComment(commentId: string, userId: string) {
  const comment = await prisma.memoryComment.findUnique({
    where: { id: commentId },
    include: { memory: true },
  });
  if (!comment) throw new Error('Comentario no encontrado');

  // puede borrarlo quien lo escribió, O el dueño del recuerdo (moderar su propio muro)
  if (comment.userId !== userId && comment.memory.userId !== userId) {
    throw new Error('No tenés permiso para borrar este comentario');
  }

  await prisma.memoryComment.delete({ where: { id: commentId } });
}

// ── Lista de quién reaccionó con qué (para el desglose) ──
export async function listReactions(memoryId: string, viewerId: string) {
  const reactions = await prisma.memoryReaction.findMany({
    where: { memoryId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  });

  return Promise.all(reactions.map(async (r) => ({
    type: r.type,
    user: {
      id: r.user.id,
      firstName: r.user.firstName,
      lastName: r.user.lastName,
      avatarUrl: r.user.avatarUrl ? await getSignedFileUrl(r.user.avatarUrl) : null,
      esUnoMismo: r.user.id === viewerId,
      estaConectado: r.user.id === viewerId ? false : await areConnected(viewerId, r.user.id),
    },
  })));
}

// ── Reacciones a comentarios (mismo sistema de 4 tipos que los recuerdos) ──
export async function setCommentReaction(commentId: string, userId: string, type: string) {
  const comment = await prisma.memoryComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error('Comentario no encontrado');

  const existing = await prisma.commentReaction.findUnique({
    where: { commentId_userId: { commentId, userId } },
  });

  let miReaccion: string | null = type;

  try {
    if (existing && existing.type === type) {
      await prisma.commentReaction.delete({ where: { id: existing.id } });
      miReaccion = null;
    } else if (existing) {
      await prisma.commentReaction.update({ where: { id: existing.id }, data: { type: type as any } });
    } else {
      await prisma.commentReaction.create({ data: { commentId, userId, type: type as any } });
    }
  } catch (err: any) {
    if (err.code !== 'P2025' && err.code !== 'P2002') throw err;
    const actual = await prisma.commentReaction.findUnique({ where: { commentId_userId: { commentId, userId } } });
    miReaccion = actual?.type || null;
  }

  const reactionCounts = await contarReaccionesComentario(commentId);
  return { miReaccion, reactionCounts };
}

export async function listCommentReactions(commentId: string, viewerId: string) {
  const reactions = await prisma.commentReaction.findMany({
    where: { commentId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  });

  return Promise.all(reactions.map(async (r) => ({
    type: r.type,
    user: {
      id: r.user.id,
      firstName: r.user.firstName,
      lastName: r.user.lastName,
      avatarUrl: r.user.avatarUrl ? await getSignedFileUrl(r.user.avatarUrl) : null,
      esUnoMismo: r.user.id === viewerId,
      estaConectado: r.user.id === viewerId ? false : await areConnected(viewerId, r.user.id),
    },
  })));
}

async function contarReaccionesComentario(commentId: string) {
  const conteos = await prisma.commentReaction.groupBy({
    by: ['type'],
    where: { commentId },
    _count: true,
  });
  const reactionCounts = contadoresVacios();
  conteos.forEach((c) => { (reactionCounts as any)[c.type] = c._count; });
  return reactionCounts;
}

async function contarReacciones(memoryId: string) {
  const conteos = await prisma.memoryReaction.groupBy({
    by: ['type'],
    where: { memoryId },
    _count: true,
  });
  const reactionCounts = contadoresVacios();
  conteos.forEach((c) => { (reactionCounts as any)[c.type] = c._count; });
  return reactionCounts;
}

// ── Helpers ──
async function enrichMemory(memory: any, viewerId?: string) {
  const [mediaUrl, reactionCounts, commentsCount, miReaccion, autor] = await Promise.all([
    memory.mediaKey ? getSignedFileUrl(memory.mediaKey) : Promise.resolve(null),
    contarReacciones(memory.id),
    prisma.memoryComment.count({ where: { memoryId: memory.id } }),
    viewerId
      ? prisma.memoryReaction.findUnique({ where: { memoryId_userId: { memoryId: memory.id, userId: viewerId } } })
      : Promise.resolve(null),
    prisma.user.findUnique({ where: { id: memory.userId }, select: { id: true, firstName: true, lastName: true, avatarUrl: true } }),
  ]);

  const autorAvatarUrl = autor?.avatarUrl ? await getSignedFileUrl(autor.avatarUrl) : null;

  return {
    ...memory,
    mediaUrl,
    reactionCounts,
    commentsCount,
    miReaccion: miReaccion?.type || null,
    user: autor ? { id: autor.id, firstName: autor.firstName, lastName: autor.lastName, avatarUrl: autorAvatarUrl } : undefined,
  };
}

// como enrichMemory, pero además trae y firma la foto del autor (el feed muestra varios autores, no solo vos)
async function enrichFeedMemory(memory: any, viewerId: string) {
  const [mediaUrl, reactionCounts, commentsCount, miReaccion, avatarUrl] = await Promise.all([
    memory.mediaKey ? getSignedFileUrl(memory.mediaKey) : Promise.resolve(null),
    contarReacciones(memory.id),
    prisma.memoryComment.count({ where: { memoryId: memory.id } }),
    prisma.memoryReaction.findUnique({ where: { memoryId_userId: { memoryId: memory.id, userId: viewerId } } }),
    memory.user?.avatarUrl ? getSignedFileUrl(memory.user.avatarUrl) : Promise.resolve(null),
  ]);

  return {
    ...memory,
    mediaUrl,
    reactionCounts,
    commentsCount,
    miReaccion: miReaccion?.type || null,
    user: { ...memory.user, avatarUrl },
  };
}

async function enrichComment(comment: any, viewerId: string, incluirRepliesCount: boolean) {
  const [avatarUrl, reactionCounts, miReaccion, repliesCount] = await Promise.all([
    comment.user?.avatarUrl ? getSignedFileUrl(comment.user.avatarUrl) : Promise.resolve(null),
    contarReaccionesComentario(comment.id),
    prisma.commentReaction.findUnique({ where: { commentId_userId: { commentId: comment.id, userId: viewerId } } }),
    incluirRepliesCount ? prisma.memoryComment.count({ where: { parentId: comment.id } }) : Promise.resolve(0),
  ]);

  return {
    ...comment,
    user: { ...comment.user, avatarUrl },
    reactionCounts,
    miReaccion: miReaccion?.type || null,
    repliesCount,
  };
}