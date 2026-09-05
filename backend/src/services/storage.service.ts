import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';
import { r2Client, BUCKET_NAME } from '../config/storage';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// tipos de archivo que vamos a aceptar por ahora, nada de ejecutables ni cualquier cosa
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/quicktime',
];

export function validateFile(mimetype: string, sizeBytes: number) {
  if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
    throw new Error('Tipo de archivo no permitido');
  }
  // 50MB tope por archivo, ajustamos esto más adelante si hace falta
  const MAX_SIZE = 50 * 1024 * 1024;
  if (sizeBytes > MAX_SIZE) {
    throw new Error('El archivo supera el tamaño máximo permitido (50MB)');
  }
}

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimetype: string,
  folder: string // ej: 'memories', 'avatars'
) {
  // nombre random para el archivo, así nadie puede adivinar URLs de otros usuarios
  const ext = path.extname(originalName);
  const key = `${folder}/${crypto.randomUUID()}${ext}`;

  await r2Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));

  return key; // esto es lo que guardamos en la base, no la URL completa
}

export async function deleteFile(key: string) {
  await r2Client.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  }));
}

export async function getSignedFileUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(r2Client, command, { expiresIn: 3600 });
}