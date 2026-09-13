import prisma from '../config/prisma';
import { uploadFile, deleteFile, validateFile, getSignedFileUrl } from './storage.service';
import { isBlockedEitherWay } from './block.service';
import { getMuteStatus } from './interaction.service';

interface UpdateProfileInput {
  bio?: string;
  country?: string;
  city?: string;
  birthDate?: string;
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      bio: data.bio,
      country: data.country,
      city: data.city,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
    },
  });
  return attachSignedUrls(user);
}

export async function uploadAvatar(userId: string, file: Express.Multer.File) {
  // solo imágenes acá, un avatar en video no tiene sentido
  if (!file.mimetype.startsWith('image/')) {
    throw new Error('El avatar tiene que ser una imagen');
  }
  validateFile(file.mimetype, file.size);

   const key = await uploadFile(file.buffer, file.originalname, file.mimetype, 'avatars');

  // OJO: ya NO borramos el avatar viejo — ahora cada cambio de foto queda
  // como un recuerdo permanente con su propio like/comentarios, así que
  // el archivo viejo tiene que seguir existiendo para siempre
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: key },
  });

  // creamos un recuerdo por detrás para que la foto tenga like y comentarios reales
  const memory = await prisma.memory.create({
    data: {
      userId,
      caption: `${user.firstName} actualizó su foto de perfil`,
      mediaKey: key,
      mediaType: 'image',
    },
  });

  const safeUser: any = await attachSignedUrls(user);
  return { ...safeUser, profileMemoryId: memory.id };
}

export async function uploadCover(userId: string, file: Express.Multer.File) {
  if (!file.mimetype.startsWith('image/')) {
    throw new Error('La portada tiene que ser una imagen');
  }
  validateFile(file.mimetype, file.size);

   const key = await uploadFile(file.buffer, file.originalname, file.mimetype, 'covers');

  // mismo caso que el avatar: no borramos, el historial queda como recuerdos permanentes
  const user = await prisma.user.update({
    where: { id: userId },
    data: { coverUrl: key },
  });

  const memory = await prisma.memory.create({
    data: {
      userId,
      caption: `${user.firstName} actualizó su foto de portada`,
      mediaKey: key,
      mediaType: 'image',
    },
  });

  const safeUser: any = await attachSignedUrls(user);
  return { ...safeUser, profileMemoryId: memory.id };
}

// reemplaza el key guardado en la base por una URL firmada temporal,
// y saca los campos sensibles antes de mandar el usuario al frontend
export async function attachSignedUrls(user: any) {
  const { passwordHash, resetToken, resetTokenExp, verificationToken, verificationTokenExp, failedLoginAttempts, lockedUntil, ...safe } = user;

  return {
    ...safe,
    avatarUrl: user.avatarUrl ? await getSignedFileUrl(user.avatarUrl) : null,
    coverUrl: user.coverUrl ? await getSignedFileUrl(user.coverUrl) : null,
  };
}

// Buscador de personas: por nombre, apellido o email exacto — nunca te muestra a vos mismo
const DIAS_ESPERA_TRAS_RECHAZO = 7;

// cuenta cuántas conexiones aceptadas tienen en común dos usuarios —
// mismo criterio que ya usamos para "vínculos mutuos" en Personas
async function contarConexionesMutuas(userIdA: string, userIdB: string): Promise<number> {
  const [conexionesA, conexionesB] = await Promise.all([
    prisma.connection.findMany({
      where: { status: 'accepted', OR: [{ requesterId: userIdA }, { addresseeId: userIdA }] },
      select: { requesterId: true, addresseeId: true },
    }),
    prisma.connection.findMany({
      where: { status: 'accepted', OR: [{ requesterId: userIdB }, { addresseeId: userIdB }] },
      select: { requesterId: true, addresseeId: true },
    }),
  ]);
  const idsA = new Set(conexionesA.map((c) => (c.requesterId === userIdA ? c.addresseeId : c.requesterId)));
  const idsB = new Set(conexionesB.map((c) => (c.requesterId === userIdB ? c.addresseeId : c.requesterId)));
  let mutuos = 0;
  for (const id of idsA) if (idsB.has(id)) mutuos++;
  return mutuos;
}

export async function searchUsers(query: string, currentUserId: string, page: number, pageSize: number) {
  const texto = query.trim();
  if (texto.length < 2) return { items: [], total: 0, page, pageSize, totalPages: 0 };

  // separamos en palabras para poder buscar "Marcelo Sendra" aunque
  // "Marcelo" esté en firstName y "Sendra" en lastName, en campos distintos
  const palabras = texto.split(/\s+/).filter(Boolean);

  const bloqueadosIds = (await prisma.block.findMany({
    where: { OR: [{ blockerId: currentUserId }, { blockedId: currentUserId }] },
    select: { blockerId: true, blockedId: true },
  })).map(b => (b.blockerId === currentUserId ? b.blockedId : b.blockerId));

  const where = {
    id: { not: currentUserId, notIn: bloqueadosIds },
    isActive: true,
    OR: [
      // el texto completo coincide con nombre, apellido, o el email exacto
      { firstName: { contains: texto, mode: 'insensitive' as const } },
      { lastName: { contains: texto, mode: 'insensitive' as const } },
      { email: { equals: texto, mode: 'insensitive' as const } },
      // o cada palabra por separado aparece en nombre y/o apellido (en cualquier orden)
      ...(palabras.length > 1
        ? [{
            AND: palabras.map((palabra) => ({
              OR: [
                { firstName: { contains: palabra, mode: 'insensitive' as const } },
                { lastName: { contains: palabra, mode: 'insensitive' as const } },
              ],
            })),
          }]
        : []),
    ],
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, firstName: true, lastName: true, avatarUrl: true, isPrivate: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  const withExtras = await Promise.all(
    users.map(async (u) => {
      const conexion = await prisma.connection.findFirst({
        where: {
          OR: [
            { requesterId: currentUserId, addresseeId: u.id },
            { requesterId: u.id, addresseeId: currentUserId },
          ],
        },
      });

      // "pendiente_enviada" solo si LA SOLICITUD LA MANDASTE VOS — si te la mandaron
      // a vos, en el buscador seguís viendo "Conectar" (esa persona ya está en
      // tu bandeja de Solicitudes, ahí es donde corresponde aceptarla, no acá)
      let estadoConexion: 'ninguna' | 'pendiente_enviada' | 'conectado' | 'rechazada' = 'ninguna';
      let diasRestantes: number | null = null;
      if (conexion) {
        if (conexion.status === 'accepted') {
          estadoConexion = 'conectado';
        } else if (conexion.status === 'pending' && conexion.requesterId === currentUserId) {
          estadoConexion = 'pendiente_enviada';
        } else if (conexion.status === 'rejected' && conexion.requesterId === currentUserId) {
          const diasPasados = conexion.respondedAt
            ? (Date.now() - conexion.respondedAt.getTime()) / (1000 * 60 * 60 * 24)
            : DIAS_ESPERA_TRAS_RECHAZO;
          if (diasPasados < DIAS_ESPERA_TRAS_RECHAZO) {
            estadoConexion = 'rechazada';
            diasRestantes = Math.ceil(DIAS_ESPERA_TRAS_RECHAZO - diasPasados);
          }
        }
      }

      // solo calculamos los mutuos cuando hacen falta (si ya están
      // conectados, no tiene sentido mostrar "X en común")
      const mutuos = estadoConexion === 'conectado' ? 0 : await contarConexionesMutuas(currentUserId, u.id);

      return {
        ...u,
        avatarUrl: u.avatarUrl ? await getSignedFileUrl(u.avatarUrl) : null,
        estadoConexion,
        diasRestantes,
        mutuos,
      };
    })
  );

  return { items: withExtras, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function setPrivacy(userId: string, isPrivate: boolean) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isPrivate },
  });
  return attachSignedUrls(user);
}

export async function setCommentPrivacy(userId: string, commentPrivacy: 'everyone' | 'connections' | 'nobody') {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { commentPrivacy },
  });
  return attachSignedUrls(user);
}

export async function setChatPrivacy(userId: string, campo: 'showReadReceipts' | 'showLastSeen', valor: boolean) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { [campo]: valor },
  });
  return attachSignedUrls(user);
}

export async function getMutualConnections(userId: string, otherUserId: string) {
  const misConexiones = await prisma.connection.findMany({
    where: { status: 'accepted', OR: [{ requesterId: userId }, { addresseeId: userId }] },
    select: { requesterId: true, addresseeId: true },
  });
  const misAmigosIds = new Set(misConexiones.map(c => c.requesterId === userId ? c.addresseeId : c.requesterId));

  const susConexiones = await prisma.connection.findMany({
    where: { status: 'accepted', OR: [{ requesterId: otherUserId }, { addresseeId: otherUserId }] },
    select: { requesterId: true, addresseeId: true },
  });
  const susAmigosIds = susConexiones.map(c => c.requesterId === otherUserId ? c.addresseeId : c.requesterId);

  const mutuosIds = susAmigosIds.filter(id => misAmigosIds.has(id));
  if (mutuosIds.length === 0) return [];

  const usuarios = await prisma.user.findMany({
    where: { id: { in: mutuosIds } },
    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
  });

  return Promise.all(usuarios.map(async (u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    avatarUrl: u.avatarUrl ? await getSignedFileUrl(u.avatarUrl) : null,
  })));
}

const SUGERENCIAS_LIMITE = 10;

export async function getSuggestedUsers(userId: string) {
  // mis conexiones aceptadas
  const misConexiones = await prisma.connection.findMany({
    where: { status: 'accepted', OR: [{ requesterId: userId }, { addresseeId: userId }] },
    select: { requesterId: true, addresseeId: true },
  });
  const misAmigosIds = misConexiones.map(c => c.requesterId === userId ? c.addresseeId : c.requesterId);

  // gente con la que ya tengo cualquier vínculo (aceptado, pendiente o rechazado) — no sugerir de nuevo
  const todasMisConexiones = await prisma.connection.findMany({
    where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
    select: { requesterId: true, addresseeId: true },
  });
  const yaVinculados = new Set(
    todasMisConexiones.map(c => c.requesterId === userId ? c.addresseeId : c.requesterId)
  );

  const bloqueos = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  const bloqueadosIds = new Set(bloqueos.map(b => b.blockerId === userId ? b.blockedId : b.blockerId));

  const excluidos = new Set([userId, ...yaVinculados, ...bloqueadosIds]);

  // candidatos por vínculo mutuo: amigos de mis amigos, contando cuántos en común tenemos
  const conteoMutuos = new Map<string, number>();
  if (misAmigosIds.length > 0) {
    const conexionesDeAmigos = await prisma.connection.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: { in: misAmigosIds } }, { addresseeId: { in: misAmigosIds } }],
      },
      select: { requesterId: true, addresseeId: true },
    });
    for (const c of conexionesDeAmigos) {
      const candidatoId = misAmigosIds.includes(c.requesterId) ? c.addresseeId : c.requesterId;
      if (excluidos.has(candidatoId)) continue;
      conteoMutuos.set(candidatoId, (conteoMutuos.get(candidatoId) || 0) + 1);
    }
  }

  let candidatosIds = Array.from(conteoMutuos.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, SUGERENCIAS_LIMITE);

  // si no llegamos al límite con vínculos mutuos, completamos por cercanía (misma ciudad)
  if (candidatosIds.length < SUGERENCIAS_LIMITE) {
    const yo = await prisma.user.findUnique({ where: { id: userId }, select: { city: true } });
    if (yo?.city) {
      const excluidosParaCercania = new Set([...excluidos, ...candidatosIds]);
      const porCercania = await prisma.user.findMany({
        where: { city: yo.city, isActive: true, id: { notIn: Array.from(excluidosParaCercania) } },
        select: { id: true },
        take: SUGERENCIAS_LIMITE - candidatosIds.length,
      });
      candidatosIds = [...candidatosIds, ...porCercania.map(u => u.id)];
    }
  }

  if (candidatosIds.length === 0) return [];

  const usuarios = await prisma.user.findMany({
    where: { id: { in: candidatosIds } },
    select: { id: true, firstName: true, lastName: true, avatarUrl: true, city: true },
  });

  // mantenemos el orden ya calculado (mutuos primero, después cercanía)
  const ordenados = candidatosIds
    .map(id => usuarios.find(u => u.id === id))
    .filter((u): u is NonNullable<typeof u> => !!u);

  return Promise.all(ordenados.map(async (u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    avatarUrl: u.avatarUrl ? await getSignedFileUrl(u.avatarUrl) : null,
    city: u.city,
    mutuos: conteoMutuos.get(u.id) || 0,
  })));
}

export async function getPublicProfile(targetUserId: string, viewerId: string) {
  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target || !target.isActive) {
    throw new Error('Usuario no encontrado');
  }

  const esUnoMismo = targetUserId === viewerId;

  if (!esUnoMismo && await isBlockedEitherWay(viewerId, targetUserId)) {
    throw new Error('No podés ver este perfil');
  }

  const conexionAceptada = esUnoMismo
    ? null
    : await prisma.connection.findFirst({
        where: {
          status: 'accepted',
          OR: [
            { requesterId: viewerId, addresseeId: targetUserId },
            { requesterId: targetUserId, addresseeId: viewerId },
          ],
        },
      });

  const puedeVerContenido = esUnoMismo || !!conexionAceptada || !target.isPrivate;

  const muteStatus = esUnoMismo ? { silenciado: false, expiresAt: null } : await getMuteStatus(viewerId, targetUserId);

  // mismo cálculo de estado que en el buscador, para que el botón del
  // perfil sea coherente con lo que ya viste en los resultados de búsqueda
  let estadoConexion: 'ninguna' | 'pendiente_enviada' | 'pendiente_recibida' | 'conectado' | 'rechazada' = 'ninguna';
  let diasRestantes: number | null = null;
  let solicitudPendienteId: string | null = null;
  let solicitudRecibidaId: string | null = null;

  if (!esUnoMismo) {
    const cualquierConexion = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: viewerId, addresseeId: targetUserId },
          { requesterId: targetUserId, addresseeId: viewerId },
        ],
      },
    });

    if (cualquierConexion) {
      if (cualquierConexion.status === 'accepted') {
        estadoConexion = 'conectado';
      } else if (cualquierConexion.status === 'pending' && cualquierConexion.requesterId === viewerId) {
        estadoConexion = 'pendiente_enviada';
        solicitudPendienteId = cualquierConexion.id;
      } else if (cualquierConexion.status === 'pending' && cualquierConexion.requesterId === targetUserId) {
        estadoConexion = 'pendiente_recibida';
        solicitudRecibidaId = cualquierConexion.id;
      } else if (cualquierConexion.status === 'rejected' && cualquierConexion.requesterId === viewerId) {
        const diasPasados = cualquierConexion.respondedAt
          ? (Date.now() - cualquierConexion.respondedAt.getTime()) / (1000 * 60 * 60 * 24)
          : DIAS_ESPERA_TRAS_RECHAZO;
        if (diasPasados < DIAS_ESPERA_TRAS_RECHAZO) {
          estadoConexion = 'rechazada';
          diasRestantes = Math.ceil(DIAS_ESPERA_TRAS_RECHAZO - diasPasados);
        }
      }
    }
  }

  return {
    id: target.id,
    firstName: target.firstName,
    lastName: target.lastName,
    avatarUrl: target.avatarUrl ? await getSignedFileUrl(target.avatarUrl) : null,
    coverUrl: target.coverUrl ? await getSignedFileUrl(target.coverUrl) : null,
    bio: target.bio,
    city: target.city,
    country: target.country,
    membershipLevel: target.membershipLevel,
    isPrivate: target.isPrivate,
    esUnoMismo,
    estaConectado: !!conexionAceptada,
    connectionId: conexionAceptada?.id || null,
    puedeVerContenido,
    estadoConexion,
    diasRestantes,
    estaSilenciado: muteStatus.silenciado,
    silenciadoHasta: muteStatus.expiresAt,
    solicitudPendienteId,
    solicitudRecibidaId,
  };
}