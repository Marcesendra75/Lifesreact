import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as chatService from '../services/chat.service';
import { sendMessageSchema, startConversationSchema, externalMediaSchema } from '../validators/chat.validator';

export async function start(req: AuthRequest, res: Response) {
  try {
    const parsed = startConversationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    const result = await chatService.startConversation(req.userId as string, parsed.data.userId, parsed.data.content);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al iniciar la conversación' });
  }
}

export async function send(req: AuthRequest, res: Response) {
  try {
    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    const mensaje = await chatService.sendMessage(req.params.id, req.userId as string, parsed.data.content, parsed.data.replyToId);
    res.status(201).json({ success: true, data: mensaje });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al enviar el mensaje' });
  }
}

export async function sendAttachment(req: AuthRequest, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Falta el archivo' });
    const { replyToId, caption } = req.body;
    const mensaje = await chatService.sendAttachment(req.params.id, req.userId as string, req.file, { replyToId, caption });
    res.status(201).json({ success: true, data: mensaje });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al enviar la imagen' });
  }
}

export async function sendVoice(req: AuthRequest, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Falta el audio' });
    const { replyToId, duration } = req.body;
    const mensaje = await chatService.sendVoiceMessage(req.params.id, req.userId as string, req.file, Number(duration), replyToId);
    res.status(201).json({ success: true, data: mensaje });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al enviar el audio' });
  }
}

export async function sendExternalMedia(req: AuthRequest, res: Response) {
  try {
    const parsed = externalMediaSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    const mensaje = await chatService.sendExternalMedia(req.params.id, req.userId as string, parsed.data.url, parsed.data.type, parsed.data.replyToId);
    res.status(201).json({ success: true, data: mensaje });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al enviar' });
  }
}

export async function react(req: AuthRequest, res: Response) {
  try {
    const { emoji } = req.body;
    const result = await chatService.reactToMessage(req.params.messageId, req.userId as string, emoji);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al reaccionar' });
  }
}

export async function pin(req: AuthRequest, res: Response) {
  try {
    const result = await chatService.togglePin(req.params.messageId, req.userId as string);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al fijar el mensaje' });
  }
}

export async function pinned(req: AuthRequest, res: Response) {
  try {
    const data = await chatService.listPinned(req.params.id, req.userId as string);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al obtener los mensajes fijados' });
  }
}

export async function respond(req: AuthRequest, res: Response) {
  try {
    const { decision } = req.body;
    if (!['accept', 'reject', 'block', 'spam'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'Decisión inválida' });
    }
    const result = await chatService.respondToRequest(req.params.id, req.userId as string, decision);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al responder' });
  }
}

export async function markRead(req: AuthRequest, res: Response) {
  try {
    await chatService.markAsRead(req.params.id, req.userId as string);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al marcar como leído' });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const data = await chatService.listConversations(req.userId as string);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener las conversaciones' });
  }
}

export async function listRequests(req: AuthRequest, res: Response) {
  try {
    const data = await chatService.listMessageRequests(req.userId as string);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener las solicitudes' });
  }
}

export async function requestsCount(req: AuthRequest, res: Response) {
  try {
    const count = await chatService.getMessageRequestsCount(req.userId as string);
    res.json({ success: true, data: { count } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al contar solicitudes' });
  }
}

export async function unreadTotalCount(req: AuthRequest, res: Response) {
  try {
    const count = await chatService.getUnreadTotalCount(req.userId as string);
    res.json({ success: true, data: { count } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al contar mensajes sin leer' });
  }
}

export async function messages(req: AuthRequest, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, parseInt(req.query.pageSize as string) || 30);
    const data = await chatService.getMessages(req.params.id, req.userId as string, page, pageSize);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al obtener los mensajes' });
  }
}

export async function typing(req: AuthRequest, res: Response) {
  try {
    await chatService.notifyTyping(req.params.id, req.userId as string, !!req.body.isTyping);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Error' });
  }
}

export async function settings(req: AuthRequest, res: Response) {
  try {
    const { mutedUntil, isPinned } = req.body;
    const data = await chatService.updateParticipantSettings(req.params.id, req.userId as string, {
      mutedUntil: mutedUntil ? new Date(mutedUntil) : mutedUntil === null ? null : undefined,
      isPinned,
    });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al guardar la configuración' });
  }
}