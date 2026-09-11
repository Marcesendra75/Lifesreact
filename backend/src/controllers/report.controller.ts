import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as reportService from '../services/report.service';

const ENTITY_TYPES = ['memory', 'comment', 'user'];
const REASONS = [
  'spam', 'contenido_inapropiado', 'acoso', 'discurso_odio',
  'violencia', 'desnudez_sexual', 'informacion_falsa', 'suplantacion', 'otro',
];

export async function create(req: AuthRequest, res: Response) {
  try {
    const { entityType, entityId, reason, detalle } = req.body;

    if (!ENTITY_TYPES.includes(entityType)) {
      return res.status(400).json({ success: false, error: 'Tipo de contenido inválido' });
    }
    if (!REASONS.includes(reason)) {
      return res.status(400).json({ success: false, error: 'Motivo inválido' });
    }
    if (!entityId) {
      return res.status(400).json({ success: false, error: 'Falta el id del contenido reportado' });
    }

    const report = await reportService.createReport({
      reporterId: req.userId as string,
      entityType,
      entityId,
      reason,
      detalle,
    });

    res.status(201).json({ success: true, data: report });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al reportar' });
  }
}

// listado — hoy sin panel admin todavía, pero ya queda listo para cuando exista
export async function list(req: AuthRequest, res: Response) {
  try {
    const status = req.query.status as any;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, parseInt(req.query.pageSize as string) || 20);
    const result = await reportService.listReports(status, page, pageSize);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener los reportes' });
  }
}