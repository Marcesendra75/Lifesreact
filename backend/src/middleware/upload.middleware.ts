import multer from 'multer';

// guardamos el archivo en memoria (como Buffer), no en disco,
// porque de ahí lo mandamos directo a R2 sin pasos intermedios
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB, mismo límite que ya definimos en storage.service.ts
  },
});