import prisma from '../config/prisma';

// ── Ocultar publicaciones ──
export async function hideMemory(userId: string, memoryId: string) {
  const memory = await prisma.memory.findUnique({ where: { id: memoryId } });
  if (!memory) throw new Error('Recuerdo no encontrado');

  await prisma.hiddenMemory.upsert({
    where: { userId_memoryId: { userId, memoryId } },
    update: {},
    create: { userId, memoryId },
  });
}

export async function unhideMemory(userId: string, memoryId: string) {
  await prisma.hiddenMemory.deleteMany({ where: { userId, memoryId } });
}

// usado por getFeed para excluir lo que el usuario ocultó
export async function getHiddenMemoryIds(userId: string): Promise<string[]> {
  const ocultas = await prisma.hiddenMemory.findMany({ where: { userId }, select: { memoryId: true } });
  return ocultas.map((h) => h.memoryId);
}

// ── Silenciar personas ──
const DIAS_SILENCIO_TEMPORAL = 30;

export type DuracionSilencio = 'temporal' | 'permanente';

export async function muteUser(muterId: string, mutedId: string, duracion: DuracionSilencio = 'permanente') {
  if (muterId === mutedId) throw new Error('No podés silenciarte a vos mismo');

  const target = await prisma.user.findUnique({ where: { id: mutedId } });
  if (!target) throw new Error('Usuario no encontrado');

  const expiresAt = duracion === 'temporal'
    ? new Date(Date.now() + DIAS_SILENCIO_TEMPORAL * 24 * 60 * 60 * 1000)
    : null;

  await prisma.mute.upsert({
    where: { muterId_mutedId: { muterId, mutedId } },
    update: { expiresAt },
    create: { muterId, mutedId, expiresAt },
  });
}

export async function unmuteUser(muterId: string, mutedId: string) {
  await prisma.mute.deleteMany({ where: { muterId, mutedId } });
}

export async function listMuted(muterId: string) {
  // limpiamos silencios temporales ya vencidos antes de listar, así la lista
  // y el feed quedan siempre coherentes entre sí
  await prisma.mute.deleteMany({ where: { muterId, expiresAt: { lt: new Date() } } });

  const mutes = await prisma.mute.findMany({
    where: { muterId },
    include: { muted: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return mutes;
}

// usado por getFeed para excluir publicaciones de gente silenciada
// (solo mientras el silencio siga vigente — un temporal vencido no cuenta)
export async function getMutedUserIds(userId: string): Promise<string[]> {
  const mutes = await prisma.mute.findMany({
    where: { muterId: userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    select: { mutedId: true },
  });
  return mutes.map((m) => m.mutedId);
}

// usado por el perfil ajeno, para saber si mostrar "Silenciar" o "Desilenciar"
export async function getMuteStatus(muterId: string, mutedId: string) {
  const mute = await prisma.mute.findUnique({ where: { muterId_mutedId: { muterId, mutedId } } });
  if (!mute) return { silenciado: false, expiresAt: null };
  if (mute.expiresAt && mute.expiresAt < new Date()) return { silenciado: false, expiresAt: null };
  return { silenciado: true, expiresAt: mute.expiresAt };
}

// ── Guardar publicaciones ──
export async function saveMemory(userId: string, memoryId: string) {
  const memory = await prisma.memory.findUnique({ where: { id: memoryId } });
  if (!memory) throw new Error('Recuerdo no encontrado');

  await prisma.savedMemory.upsert({
    where: { userId_memoryId: { userId, memoryId } },
    update: {},
    create: { userId, memoryId },
  });
}

export async function unsaveMemory(userId: string, memoryId: string) {
  await prisma.savedMemory.deleteMany({ where: { userId, memoryId } });
}

export async function listSavedMemoryIds(userId: string): Promise<string[]> {
  const saved = await prisma.savedMemory.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { memoryId: true } });
  return saved.map((s) => s.memoryId);
}

// ── Ocultar comentarios (solo para tu propia vista) ──
export async function hideComment(userId: string, commentId: string) {
  const comment = await prisma.memoryComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error('Comentario no encontrado');

  await prisma.hiddenComment.upsert({
    where: { userId_commentId: { userId, commentId } },
    update: {},
    create: { userId, commentId },
  });
}

export async function unhideComment(userId: string, commentId: string) {
  await prisma.hiddenComment.deleteMany({ where: { userId, commentId } });
}

export async function getHiddenCommentIds(userId: string): Promise<string[]> {
  const ocultos = await prisma.hiddenComment.findMany({ where: { userId }, select: { commentId: true } });
  return ocultos.map((h) => h.commentId);
}