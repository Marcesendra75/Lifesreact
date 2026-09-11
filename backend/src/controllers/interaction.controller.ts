import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as interactionService from '../services/interaction.service';

export async function hide(req: AuthRequest, res: Response) {
  try {
    await interactionService.hideMemory(req.userId as string, req.params.memoryId);
    res.json({ success: true, message: 'Publicación ocultada' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al ocultar' });
  }
}

export async function unhide(req: AuthRequest, res: Response) {
  try {
    await interactionService.unhideMemory(req.userId as string, req.params.memoryId);
    res.json({ success: true, message: 'Publicación restaurada' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al restaurar' });
  }
}

export async function mute(req: AuthRequest, res: Response) {
  try {
    const { userId, duracion } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'Falta el id del usuario' });
    if (duracion && duracion !== 'temporal' && duracion !== 'permanente') {
      return res.status(400).json({ success: false, error: 'Duración inválida' });
    }
    await interactionService.muteUser(req.userId as string, userId, duracion || 'permanente');
    res.json({ success: true, message: 'Usuario silenciado' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al silenciar' });
  }
}

export async function unmute(req: AuthRequest, res: Response) {
  try {
    await interactionService.unmuteUser(req.userId as string, req.params.id);
    res.json({ success: true, message: 'Usuario ya no está silenciado' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al quitar el silencio' });
  }
}

export async function listMuted(req: AuthRequest, res: Response) {
  try {
    const muted = await interactionService.listMuted(req.userId as string);
    res.json({ success: true, data: muted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener la lista' });
  }
}

export async function save(req: AuthRequest, res: Response) {
  try {
    await interactionService.saveMemory(req.userId as string, req.params.memoryId);
    res.json({ success: true, message: 'Publicación guardada' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al guardar' });
  }
}

export async function listSavedIds(req: AuthRequest, res: Response) {
  try {
    const ids = await interactionService.listSavedMemoryIds(req.userId as string);
    res.json({ success: true, data: ids });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener los guardados' });
  }
}

export async function unsave(req: AuthRequest, res: Response) {
  try {
    await interactionService.unsaveMemory(req.userId as string, req.params.memoryId);
    res.json({ success: true, message: 'Publicación quitada de guardados' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al quitar de guardados' });
  }
}

export async function hideComment(req: AuthRequest, res: Response) {
  try {
    await interactionService.hideComment(req.userId as string, req.params.commentId);
    res.json({ success: true, message: 'Comentario ocultado' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al ocultar el comentario' });
  }
}

export async function unhideComment(req: AuthRequest, res: Response) {
  try {
    await interactionService.unhideComment(req.userId as string, req.params.commentId);
    res.json({ success: true, message: 'Comentario visible de nuevo' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al mostrar el comentario' });
  }
}