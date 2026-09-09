import prisma from '../config/prisma';

interface ChapterData {
  nombre: string;
  desde: number;
  hasta: number;
  color: string;
}

export async function createChapter(ownerId: string, data: ChapterData) {
  return prisma.chapter.create({ data: { ownerId, ...data } });
}

export async function listChapters(ownerId: string) {
  return prisma.chapter.findMany({ where: { ownerId }, orderBy: { desde: 'asc' } });
}

async function assertOwnedChapter(id: string, ownerId: string) {
  const chapter = await prisma.chapter.findUnique({ where: { id } });
  if (!chapter || chapter.ownerId !== ownerId) {
    throw new Error('Capítulo no encontrado o no te pertenece');
  }
  return chapter;
}

export async function updateChapter(id: string, ownerId: string, data: Partial<ChapterData>) {
  await assertOwnedChapter(id, ownerId);
  return prisma.chapter.update({ where: { id }, data });
}

export async function deleteChapter(id: string, ownerId: string) {
  await assertOwnedChapter(id, ownerId);
  // las memories que apuntaban a este capítulo quedan con chapterId en null solas (onDelete: SetNull)
  await prisma.chapter.delete({ where: { id } });
}