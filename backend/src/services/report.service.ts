import prisma from '../config/prisma';
import { getSignedFileUrl } from './storage.service';
import { classifyText, classifyImage } from './moderation.service';

type EntityType = 'memory' | 'comment' | 'user';
type Reason =
  | 'spam' | 'contenido_inapropiado' | 'acoso' | 'discurso_odio'
  | 'violencia' | 'desnudez_sexual' | 'informacion_falsa' | 'suplantacion' | 'otro';

export async function createReport(params: {
  reporterId: string;
  entityType: EntityType;
  entityId: string;
  reason: Reason;
  detalle?: string;
}) {
  const { reporterId, entityType, entityId, reason, detalle } = params;

  await validarQueExiste(entityType, entityId);

  const existente = await prisma.report.findUnique({
    where: { reporterId_entityType_entityId: { reporterId, entityType, entityId } },
  });
  if (existente) {
    throw new Error('Ya reportaste esto antes');
  }

  const { texto, imageKey } = await obtenerContenidoParaClasificar(entityType, entityId);

  const [clasifTexto, clasifImagen] = await Promise.all([
    classifyText(texto),
    imageKey ? classifyImage(await getSignedFileUrl(imageKey)) : Promise.resolve(null),
  ]);

  const flagged = clasifTexto.flagged || !!clasifImagen?.flagged;
  const categories = Array.from(new Set([...clasifTexto.categories, ...(clasifImagen?.categories || [])]));
  const score = Math.max(clasifTexto.score, clasifImagen?.score || 0);

  return prisma.report.create({
    data: {
      reporterId,
      entityType,
      entityId,
      reason,
      detalle,
      aiFlagged: flagged,
      aiCategories: categories,
      aiScore: score,
    },
  });
}

async function validarQueExiste(entityType: EntityType, entityId: string) {
  if (entityType === 'memory') {
    const m = await prisma.memory.findUnique({ where: { id: entityId } });
    if (!m) throw new Error('Ese recuerdo no existe');
  } else if (entityType === 'comment') {
    const c = await prisma.memoryComment.findUnique({ where: { id: entityId } });
    if (!c) throw new Error('Ese comentario no existe');
  } else if (entityType === 'user') {
    const u = await prisma.user.findUnique({ where: { id: entityId } });
    if (!u) throw new Error('Ese usuario no existe');
  }
}

async function obtenerContenidoParaClasificar(entityType: EntityType, entityId: string) {
  if (entityType === 'memory') {
    const m = await prisma.memory.findUnique({ where: { id: entityId } });
    return { texto: m?.caption || '', imageKey: m?.mediaType === 'image' ? m?.mediaKey : null };
  }
  if (entityType === 'comment') {
    const c = await prisma.memoryComment.findUnique({ where: { id: entityId } });
    return { texto: c?.content || '', imageKey: null };
  }
  if (entityType === 'user') {
    const u = await prisma.user.findUnique({ where: { id: entityId } });
    return { texto: u?.bio || '', imageKey: null };
  }
  return { texto: '', imageKey: null };
}

export async function listReports(status?: 'pending' | 'reviewed' | 'actioned' | 'dismissed', page = 1, pageSize = 20) {
  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where: status ? { status } : {},
      orderBy: [{ aiScore: 'desc' }, { createdAt: 'desc' }], // los más graves según la IA, primero
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { reporter: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.report.count({ where: status ? { status } : {} }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}