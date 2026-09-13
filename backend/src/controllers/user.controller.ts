import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import { updateProfileSchema } from '../validators/user.validator';
import * as userService from '../services/user.service';

export async function suggestions(req: AuthRequest, res: Response) {
  try {
    const result = await userService.getSuggestedUsers(req.userId as string);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener sugerencias' });
  }
}

export async function search(req: AuthRequest, res: Response) {
  try {
    const q = (req.query.q as string) || '';
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 15;
    const result = await userService.searchUsers(q, req.userId as string, page, pageSize);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al buscar personas' });
  }
}

export async function updatePrivacy(req: AuthRequest, res: Response) {
  try {
    const { isPrivate } = req.body;
    if (typeof isPrivate !== 'boolean') {
      return res.status(400).json({ success: false, error: 'isPrivate tiene que ser true o false' });
    }
    const user = await userService.setPrivacy(req.userId as string, isPrivate);
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al actualizar la privacidad' });
  }
}

export async function updateCommentPrivacy(req: AuthRequest, res: Response) {
  try {
    const { commentPrivacy } = req.body;
    if (!['everyone', 'connections', 'nobody'].includes(commentPrivacy)) {
      return res.status(400).json({ success: false, error: 'Valor inválido' });
    }
    const user = await userService.setCommentPrivacy(req.userId as string, commentPrivacy);
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al actualizar' });
  }
}

export async function updateChatPrivacy(req: AuthRequest, res: Response) {
  try {
    const { campo, valor } = req.body;
    if (!['showReadReceipts', 'showLastSeen'].includes(campo) || typeof valor !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Datos inválidos' });
    }
    const user = await userService.setChatPrivacy(req.userId as string, campo, valor);
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al actualizar' });
  }
}

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

export async function mutuals(req: AuthRequest, res: Response) {
  try {
    const result = await userService.getMutualConnections(req.userId as string, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener vínculos mutuos' });
  }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const profile = await userService.getPublicProfile(req.params.id, req.userId as string);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message || 'Usuario no encontrado' });
  }
}