import { S3Client } from '@aws-sdk/client-s3';

// R2 habla el mismo protocolo que S3, así que usamos el cliente de AWS
// apuntando al endpoint de Cloudflare en vez de a Amazon
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME as string;