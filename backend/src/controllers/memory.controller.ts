import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import { createMemorySchema, updateMemorySchema, createCommentSchema, reactionSchema } from '../validators/memory.validator';
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
      chapterId: parsed.data.chapterId,
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

export async function getFeed(req: AuthRequest, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, parseInt(req.query.pageSize as string) || 20);

    const result = await memoryService.getFeed(req.userId as string, page, pageSize);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener el feed' });
  }
}

export async function getByUser(req: AuthRequest, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, parseInt(req.query.pageSize as string) || 20);
    const result = await memoryService.listMemoriesOfUser(req.params.userId, req.userId as string, page, pageSize);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(403).json({ success: false, error: err.message || 'Error al obtener los recuerdos' });
  }
}

export async function getSaved(req: AuthRequest, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, parseInt(req.query.pageSize as string) || 20);
    const result = await memoryService.listSavedMemories(req.userId as string, page, pageSize);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener los guardados' });
  }
}

export async function getOne(req: AuthRequest, res: Response) {
  try {
    const memory = await memoryService.getMemoryById(req.params.id, req.userId as string);
    if (!memory) {
      return res.status(404).json({ success: false, error: 'Recuerdo no encontrado' });
    }
    if (memory.userId !== req.userId) {
      const puedeVer = await memoryService.puedeVerRecuerdoDe(memory.userId, req.userId as string);
      if (!puedeVer) {
        return res.status(403).json({ success: false, error: 'No tenés permiso para ver este recuerdo' });
      }
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

export async function setReaction(req: AuthRequest, res: Response) {
  try {
    const parsed = reactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const result = await memoryService.setReaction(req.params.id, req.userId as string, parsed.data.type);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al reaccionar' });
  }
}

export async function listComments(req: AuthRequest, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, parseInt(req.query.pageSize as string) || 20);
    const result = await memoryService.listComments(req.params.id, req.userId as string, page, pageSize);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener los comentarios' });
  }
}

export async function addComment(req: AuthRequest, res: Response) {
  try {
    const parsed = createCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }

    const comment = await memoryService.addComment(req.params.id, req.userId as string, parsed.data.content, parsed.data.parentId);
    res.status(201).json({ success: true, data: comment });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al comentar' });
  }
}

export async function listReplies(req: AuthRequest, res: Response) {
  try {
    const replies = await memoryService.listReplies(req.params.commentId, req.userId as string);
    res.json({ success: true, data: replies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener las respuestas' });
  }
}

export async function setCommentReaction(req: AuthRequest, res: Response) {
  try {
    const parsed = reactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const result = await memoryService.setCommentReaction(req.params.commentId, req.userId as string, parsed.data.type);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al reaccionar' });
  }
}

export async function listCommentReactions(req: AuthRequest, res: Response) {
  try {
    const result = await memoryService.listCommentReactions(req.params.commentId, req.userId as string);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener las reacciones' });
  }
}

export async function removeComment(req: AuthRequest, res: Response) {
  try {
    await memoryService.deleteComment(req.params.commentId, req.userId as string);
    res.json({ success: true, message: 'Comentario eliminado' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al eliminar el comentario' });
  }
}

export async function listReactions(req: AuthRequest, res: Response) {
  try {
    const result = await memoryService.listReactions(req.params.id, req.userId as string);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener las reacciones' });
  }
}

export async function share(req: AuthRequest, res: Response) {
  try {
    const result = await memoryService.incrementShareCount(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: 'Error al compartir' });
  }
}