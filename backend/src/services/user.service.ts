import prisma from '../config/prisma';
import { uploadFile, deleteFile, validateFile, getSignedFileUrl } from './storage.service';

interface UpdateProfileInput {
  bio?: string;
  country?: string;
  city?: string;
  birthDate?: string;
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      bio: data.bio,
      country: data.country,
      city: data.city,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
    },
  });
  return attachSignedUrls(user);
}

export async function uploadAvatar(userId: string, file: Express.Multer.File) {
  // solo imágenes acá, un avatar en video no tiene sentido
  if (!file.mimetype.startsWith('image/')) {
    throw new Error('El avatar tiene que ser una imagen');
  }
  validateFile(file.mimetype, file.size);

  const current = await prisma.user.findUnique({ where: { id: userId } });

  const key = await uploadFile(file.buffer, file.originalname, file.mimetype, 'avatars');

  // borramos el avatar viejo de R2 después de subir el nuevo, así no se acumula basura
  if (current?.avatarUrl) {
    await deleteFile(current.avatarUrl).catch(() => {});
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: key },
  });
  return attachSignedUrls(user);
}

export async function uploadCover(userId: string, file: Express.Multer.File) {
  if (!file.mimetype.startsWith('image/')) {
    throw new Error('La portada tiene que ser una imagen');
  }
  validateFile(file.mimetype, file.size);

  const current = await prisma.user.findUnique({ where: { id: userId } });

  const key = await uploadFile(file.buffer, file.originalname, file.mimetype, 'covers');

  if (current?.coverUrl) {
    await deleteFile(current.coverUrl).catch(() => {});
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { coverUrl: key },
  });
  return attachSignedUrls(user);
}

// reemplaza el key guardado en la base por una URL firmada temporal,
// y saca los campos sensibles antes de mandar el usuario al frontend
export async function attachSignedUrls(user: any) {
  const { passwordHash, resetToken, resetTokenExp, failedLoginAttempts, lockedUntil, ...safe } = user;

  return {
    ...safe,
    avatarUrl: user.avatarUrl ? await getSignedFileUrl(user.avatarUrl) : null,
    coverUrl: user.coverUrl ? await getSignedFileUrl(user.coverUrl) : null,
  };
}