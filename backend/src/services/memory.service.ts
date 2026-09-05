import prisma from '../config/prisma';
import { uploadFile, deleteFile, validateFile, getSignedFileUrl } from './storage.service';

interface CreateMemoryInput {
  userId: string;
  caption?: string;
  file?: Express.Multer.File;
}

export async function createMemory({ userId, caption, file }: CreateMemoryInput) {
  // regla de negocio: un recuerdo tiene que tener texto o archivo, no puede estar vacío
  if (!caption && !file) {
    throw new Error('El recuerdo necesita al menos texto o un archivo');
  }

  let mediaKey: string | undefined;
  let mediaType: 'image' | 'video' | undefined;

  if (file) {
    validateFile(file.mimetype, file.size);
    mediaKey = await uploadFile(file.buffer, file.originalname, file.mimetype, 'memories');
    mediaType = file.mimetype.startsWith('video') ? 'video' : 'image';
  }

  const memory = await prisma.memory.create({
    data: { userId, caption, mediaKey, mediaType },
  });

  return attachSignedUrl(memory);
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

  const withUrls = await Promise.all(items.map(attachSignedUrl));

  return { items: withUrls, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getMemoryById(id: string) {
  const memory = await prisma.memory.findUnique({ where: { id } });
  if (!memory) return null;
  return attachSignedUrl(memory);
}

export async function updateMemoryCaption(id: string, userId: string, caption: string) {
  // el where con userId incluido asegura que nadie pueda editar un recuerdo ajeno,
  // aunque adivine el id de otro usuario
  const result = await prisma.memory.updateMany({
    where: { id, userId },
    data: { caption },
  });
  if (result.count === 0) {
    throw new Error('Recuerdo no encontrado o no te pertenece');
  }
  return getMemoryById(id);
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

// agrega la URL firmada temporal al objeto antes de devolverlo al frontend
async function attachSignedUrl(memory: any) {
  if (!memory.mediaKey) return { ...memory, mediaUrl: null };
  const mediaUrl = await getSignedFileUrl(memory.mediaKey);
  return { ...memory, mediaUrl };
}