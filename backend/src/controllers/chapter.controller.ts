import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import { createChapterSchema, updateChapterSchema } from '../validators/chapter.validator';
import * as chapterService from '../services/chapter.service';

export async function create(req: AuthRequest, res: Response) {
  try {
    const parsed = createChapterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const chapter = await chapterService.createChapter(req.userId as string, parsed.data);
    res.status(201).json({ success: true, data: chapter });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al crear el capítulo' });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const chapters = await chapterService.listChapters(req.userId as string);
    res.json({ success: true, data: chapters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener los capítulos' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const parsed = updateChapterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const chapter = await chapterService.updateChapter(req.params.id, req.userId as string, parsed.data);
    res.json({ success: true, data: chapter });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al editar el capítulo' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await chapterService.deleteChapter(req.params.id, req.userId as string);
    res.json({ success: true, message: 'Capítulo eliminado' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al eliminar el capítulo' });
  }
}