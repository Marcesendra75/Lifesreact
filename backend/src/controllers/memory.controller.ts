import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import { createMemorySchema, updateMemorySchema } from '../validators/memory.validator';
import * as memoryService from '../services/memory.service';

export async function create(req: AuthRequest, res: Response) {
  try {
    const parsed = createMemorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }

    const memory = await memoryService.createMemory({
      userId: req.userId as string,
      caption: parsed.data.caption,
      file: req.file,
    });

    res.status(201).json({ success: true, data: memory });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al crear el recuerdo' });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, parseInt(req.query.pageSize as string) || 20);

    const result = await memoryService.listMemories(req.userId as string, page, pageSize);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener los recuerdos' });
  }
}

export async function getOne(req: AuthRequest, res: Response) {
  try {
    const memory = await memoryService.getMemoryById(req.params.id);
    if (!memory || memory.userId !== req.userId) {
      return res.status(404).json({ success: false, error: 'Recuerdo no encontrado' });
    }
    res.json({ success: true, data: memory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener el recuerdo' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const parsed = updateMemorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }

    const memory = await memoryService.updateMemoryCaption(
      req.params.id,
      req.userId as string,
      parsed.data.caption
    );
    res.json({ success: true, data: memory });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al editar el recuerdo' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await memoryService.deleteMemory(req.params.id, req.userId as string);
    res.json({ success: true, message: 'Recuerdo eliminado' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al eliminar el recuerdo' });
  }
}