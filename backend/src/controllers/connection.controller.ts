import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import { sendConnectionRequestSchema } from '../validators/connection.validator';
import * as connectionService from '../services/connection.service';

export async function sendRequest(req: AuthRequest, res: Response) {
  try {
    const parsed = sendConnectionRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }

    const connection = await connectionService.sendConnectionRequest(
      req.userId as string,
      parsed.data.addresseeEmail
    );
    res.status(201).json({ success: true, data: connection });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al enviar la solicitud' });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const status = req.query.status as 'pending' | 'accepted' | 'rejected' | undefined;
    const connections = await connectionService.listConnections(req.userId as string, status);
    res.json({ success: true, data: connections });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener las conexiones' });
  }
}

export async function accept(req: AuthRequest, res: Response) {
  try {
    const connection = await connectionService.acceptConnection(req.params.id, req.userId as string);
    res.json({ success: true, data: connection });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al aceptar la solicitud' });
  }
}

export async function reject(req: AuthRequest, res: Response) {
  try {
    const connection = await connectionService.rejectConnection(req.params.id, req.userId as string);
    res.json({ success: true, data: connection });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al rechazar la solicitud' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await connectionService.removeConnection(req.params.id, req.userId as string);
    res.json({ success: true, message: 'Conexión eliminada' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al eliminar la conexión' });
  }
}