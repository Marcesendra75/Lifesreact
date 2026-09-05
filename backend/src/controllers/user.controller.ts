import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import { updateProfileSchema } from '../validators/user.validator';
import * as userService from '../services/user.service';

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }

    const user = await userService.updateProfile(req.userId as string, parsed.data);
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al actualizar el perfil' });
  }
}

export async function uploadAvatar(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Falta el archivo' });
    }
    const user = await userService.uploadAvatar(req.userId as string, req.file);
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al subir el avatar' });
  }
}

export async function uploadCover(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Falta el archivo' });
    }
    const user = await userService.uploadCover(req.userId as string, req.file);
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al subir la portada' });
  }
}