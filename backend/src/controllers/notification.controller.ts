import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as notificationService from '../services/notification.service';

export async function list(req: AuthRequest, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, parseInt(req.query.pageSize as string) || 20);
    const result = await notificationService.listNotifications(req.userId as string, page, pageSize);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener notificaciones' });
  }
}

export async function unreadCount(req: AuthRequest, res: Response) {
  try {
    const count = await notificationService.getUnreadCount(req.userId as string);
    res.json({ success: true, data: { count } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al contar notificaciones' });
  }
}

export async function markRead(req: AuthRequest, res: Response) {
  try {
    const notif = await notificationService.markAsRead(req.params.id, req.userId as string);
    res.json({ success: true, data: notif });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al marcar como leída' });
  }
}

export async function markAllRead(req: AuthRequest, res: Response) {
  try {
    await notificationService.markAllAsRead(req.userId as string);
    res.json({ success: true, message: 'Todas marcadas como leídas' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al marcar todas como leídas' });
  }
}