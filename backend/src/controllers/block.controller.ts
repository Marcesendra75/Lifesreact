import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as blockService from '../services/block.service';

export async function block(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Falta el id del usuario' });
    }
    await blockService.blockUser(req.userId as string, userId);
    res.json({ success: true, message: 'Usuario bloqueado' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al bloquear' });
  }
}

export async function unblock(req: AuthRequest, res: Response) {
  try {
    await blockService.unblockUser(req.userId as string, req.params.id);
    res.json({ success: true, message: 'Usuario desbloqueado' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al desbloquear' });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const blocked = await blockService.listBlocked(req.userId as string);
    res.json({ success: true, data: blocked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener la lista de bloqueados' });
  }
}