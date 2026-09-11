import prisma from '../config/prisma';
import { uploadFile, deleteFile, validateFile, getSignedFileUrl } from './storage.service';
import { areConnected } from './connection.service';
import { notify } from './notification.service';

interface MemberInput {
  ownerId: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  deathDate?: string;
  bio?: string;
  relacionManual?: string;
  motherId?: string;
  fatherId?: string;
  file?: Express.Multer.File;
}

// confirma que un familiar exista Y pertenezca al árbol de este dueño,
// así nadie puede referenciar (ni tocar) el árbol de otro usuario
async function assertOwnedMember(id: string, ownerId: string) {
  const member = await prisma.familyMember.findUnique({ where: { id } });
  if (!member || member.ownerId !== ownerId) {
    throw new Error('Familiar no encontrado o no te pertenece');
  }
  return member;
}

export async function createFamilyMember(input: MemberInput) {
  const { ownerId, firstName, lastName, gender, birthDate, deathDate, bio, relacionManual, motherId, fatherId, file } = input;

  if (motherId) await assertOwnedMember(motherId, ownerId);
  if (fatherId) await assertOwnedMember(fatherId, ownerId);

  let photoKey: string | undefined;
  if (file) {
    validateFile(file.mimetype, file.size);
    photoKey = await uploadFile(file.buffer, file.originalname, file.mimetype, 'family');
  }

  const member = await prisma.familyMember.create({
    data: {
      ownerId,
      firstName: firstName as string,
      lastName,
      gender,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      deathDate: deathDate ? new Date(deathDate) : undefined,
      bio,
      relacionManual: relacionManual || undefined,
      motherId,
      fatherId,
      photoKey,
    },
  });

  return attachPhotoUrl(member);
}

export async function listFamilyMembers(ownerId: string) {
  const members = await prisma.familyMember.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'asc' },
  });
  return Promise.all(members.map(attachPhotoUrl));
}

export async function getFamilyMember(id: string, ownerId: string) {
  const member = await assertOwnedMember(id, ownerId);
  return attachPhotoUrl(member);
}

export async function updateFamilyMember(id: string, ownerId: string, data: Omit<MemberInput, 'ownerId'>) {
  await assertOwnedMember(id, ownerId);

  // '' significa "quitar este vínculo" → lo convertimos a null;
  // undefined (el campo ni se mandó) queda undefined, así Prisma no lo toca
  const motherIdValue = data.motherId === '' ? null : data.motherId;
  const fatherIdValue = data.fatherId === '' ? null : data.fatherId;

  if (motherIdValue) await assertOwnedMember(motherIdValue, ownerId);
  if (fatherIdValue) await assertOwnedMember(fatherIdValue, ownerId);

  // nadie puede ser su propio padre o madre
  if (motherIdValue === id || fatherIdValue === id) {
    throw new Error('Un familiar no puede ser su propio padre o madre');
  }

  let photoKey: string | undefined;
  if (data.file) {
    validateFile(data.file.mimetype, data.file.size);
    photoKey = await uploadFile(data.file.buffer, data.file.originalname, data.file.mimetype, 'family');
  }

  const updated = await prisma.familyMember.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      deathDate: data.deathDate ? new Date(data.deathDate) : undefined,
      bio: data.bio,
      relacionManual: data.relacionManual === '' ? null : data.relacionManual,
      motherId: motherIdValue,
      fatherId: fatherIdValue,
      ...(photoKey ? { photoKey } : {}),
    },
  });

  return attachPhotoUrl(updated);
}

// antes de borrar el archivo de una foto, confirmamos que ningún OTRO
// nodo del árbol (de cualquier dueño) ni ningún usuario real la esté
// usando también — cubre tanto el caso de "foto de perfil vinculada"
// como el de "foto copiada al fusionar dos nodos"
async function esFotoCompartida(photoKey: string, excludeMemberId: string): Promise<boolean> {
  const [otroMiembro, usuarioConEsaFoto] = await Promise.all([
    prisma.familyMember.findFirst({ where: { photoKey, id: { not: excludeMemberId } } }),
    prisma.user.findFirst({ where: { avatarUrl: photoKey } }),
  ]);
  return !!otroMiembro || !!usuarioConEsaFoto;
}

export async function deleteFamilyMember(id: string, ownerId: string) {
  const member = await assertOwnedMember(id, ownerId);
  if (member.photoKey && !(await esFotoCompartida(member.photoKey, id))) {
    await deleteFile(member.photoKey);
  }
  await prisma.familyMember.delete({ where: { id } });
  // ojo: los hijos de este familiar NO se borran, solo pierden la referencia
  // a este padre/madre (así lo definimos con onDelete: SetNull en el schema)
}

export async function deleteEntireTree(ownerId: string) {
  // "Vaciar árbol" solo borra los nodos que vos cargaste a mano —
  // cualquier nodo vinculado a una cuenta real (tu propio "Yo", o
  // cualquier persona con la que ya tengas un vínculo aceptado) queda
  // intacto. Para cortar uno de esos vínculos puntuales hay que usar
  // "Desvincular" desde el modal de esa persona, no vaciar todo el árbol.
  const aBorrar = await prisma.familyMember.findMany({
    where: { ownerId, linkedUserId: null },
  });

  for (const m of aBorrar) {
    if (m.photoKey && !(await esFotoCompartida(m.photoKey, m.id))) await deleteFile(m.photoKey);
  }

  await prisma.familyMember.deleteMany({
    where: { ownerId, linkedUserId: null },
  });

  return { eliminados: aBorrar.length };
}

export async function createPartner(ownerId: string, memberAId: string, memberBId: string) {
  if (memberAId === memberBId) {
    throw new Error('Una persona no puede ser pareja de sí misma');
  }
  await assertOwnedMember(memberAId, ownerId);
  await assertOwnedMember(memberBId, ownerId);

  // el vínculo pudo haberse guardado en cualquiera de los dos órdenes
  const existing = await prisma.familyPartner.findFirst({
    where: {
      OR: [
        { memberAId, memberBId },
        { memberAId: memberBId, memberBId: memberAId },
      ],
    },
  });
  if (existing) {
    throw new Error('Ese vínculo de pareja ya existe');
  }

  return prisma.familyPartner.create({ data: { memberAId, memberBId } });
}

export async function deletePartner(id: string, ownerId: string) {
  const partner = await prisma.familyPartner.findUnique({ where: { id } });
  if (!partner) throw new Error('Vínculo no encontrado');

  const memberA = await prisma.familyMember.findUnique({ where: { id: partner.memberAId } });
  if (!memberA || memberA.ownerId !== ownerId) {
    throw new Error('No tenés permiso para borrar este vínculo');
  }

  await prisma.familyPartner.delete({ where: { id } });
}

export async function getFullTree(ownerId: string) {
  // si todavía no existe tu propio nodo en el árbol, lo creamos la primera vez
  // que pedís el árbol, usando tus datos reales de usuario
  let yo = await prisma.familyMember.findFirst({
    where: { ownerId, linkedUserId: ownerId },
  });

  if (!yo) {
    const user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (user) {
      yo = await prisma.familyMember.create({
        data: {
          ownerId,
          linkedUserId: ownerId,
          firstName: user.firstName,
          lastName: user.lastName,
          photoKey: user.avatarUrl,
        },
      });
    }
  }

  const [members, partners] = await Promise.all([
    prisma.familyMember.findMany({ where: { ownerId }, orderBy: { createdAt: 'asc' } }),
    prisma.familyPartner.findMany({ where: { memberA: { ownerId } } }),
  ]);

  const membersWithUrls = await Promise.all(members.map(attachPhotoUrl));
  return { members: membersWithUrls, partners, yoId: yo?.id ?? null };
}

async function attachPhotoUrl(member: any) {
  if (!member.photoKey) return { ...member, photoUrl: null };
  const photoUrl = await getSignedFileUrl(member.photoKey);
  return { ...member, photoUrl };
}

export async function proposeFamilyLink(memberId: string, ownerId: string, targetUserId: string) {
  const member = await assertOwnedMember(memberId, ownerId);

  if (targetUserId === ownerId) {
    throw new Error('No hace falta vincularte a vos mismo, el árbol ya es tuyo');
  }
  if (member.linkedUserId) {
    throw new Error('Este familiar ya está vinculado a una cuenta');
  }
  if (member.linkPendienteUserId) {
    throw new Error('Ya hay una propuesta esperando respuesta para este familiar');
  }

  // solo se puede etiquetar a alguien que ya aceptó estar conectado con vos
  const connected = await areConnected(ownerId, targetUserId);
  if (!connected) {
    throw new Error('Solo podés etiquetar a personas con las que ya estás conectado');
  }

  const updated = await prisma.familyMember.update({
    where: { id: memberId },
    data: { linkPendienteUserId: targetUserId, linkPropuestoEn: new Date() },
  });

  await notify.familyLinkProposed(targetUserId, ownerId, memberId);
  return attachPhotoUrl(updated);
}

export async function acceptFamilyLink(memberId: string, targetUserId: string) {
  const member = await prisma.familyMember.findUnique({ where: { id: memberId } });
  if (!member || member.linkPendienteUserId !== targetUserId) {
    throw new Error('No hay ninguna propuesta pendiente para vos en este familiar');
  }

  // si el nodo no tenía foto propia, copiamos la del usuario real — nunca
  // pisamos una foto que el dueño del árbol ya haya cargado a mano
  let photoKeyNuevo: string | undefined;
  if (!member.photoKey) {
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (targetUser?.avatarUrl) photoKeyNuevo = targetUser.avatarUrl;
  }

  const updated = await prisma.familyMember.update({
    where: { id: memberId },
    data: {
      linkedUserId: targetUserId,
      linkPendienteUserId: null,
      linkPropuestoEn: null,
      ...(photoKeyNuevo ? { photoKey: photoKeyNuevo } : {}),
    },
  });

  // reciprocidad: en TU árbol (el de quien acepta) creamos o buscamos un
  // nodo que te represente a quien te etiquetó — así, sin depender de
  // quién lo haga primero, cualquiera de los dos puede tocar "Copiar
  // árbol" desde ese nodo cuando quiera
  let anchorReciproco = await prisma.familyMember.findFirst({
    where: { ownerId: targetUserId, linkedUserId: member.ownerId },
  });
  if (!anchorReciproco) {
    const proposerUser = await prisma.user.findUnique({ where: { id: member.ownerId } });
    if (proposerUser) {
      anchorReciproco = await prisma.familyMember.create({
        data: {
          ownerId: targetUserId,
          linkedUserId: member.ownerId,
          firstName: proposerUser.firstName,
          lastName: proposerUser.lastName,
          photoKey: proposerUser.avatarUrl,
        },
      });
    }
  }

  await notify.familyLinkAccepted(member.ownerId, targetUserId, memberId);
  return { member: await attachPhotoUrl(updated), reciprocalMemberId: anchorReciproco?.id ?? null };
}

export async function rejectFamilyLink(memberId: string, targetUserId: string) {
  const member = await prisma.familyMember.findUnique({ where: { id: memberId } });
  if (!member || member.linkPendienteUserId !== targetUserId) {
    throw new Error('No hay ninguna propuesta pendiente para vos en este familiar');
  }

  await prisma.familyMember.update({
    where: { id: memberId },
    data: { linkPendienteUserId: null, linkPropuestoEn: null },
  });

  await notify.familyLinkRejected(member.ownerId, targetUserId, memberId);
}

export async function cancelFamilyLink(memberId: string, ownerId: string) {
  const member = await assertOwnedMember(memberId, ownerId);
  if (!member.linkPendienteUserId) {
    throw new Error('No hay ninguna propuesta pendiente para cancelar');
  }
  return prisma.familyMember.update({
    where: { id: memberId },
    data: { linkPendienteUserId: null, linkPropuestoEn: null },
  });
}

export async function getPendingFamilyLinks(userId: string) {
  const members = await prisma.familyMember.findMany({
    where: { linkPendienteUserId: userId },
    include: { owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  });

  return Promise.all(members.map(async (m) => ({
    memberId: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    owner: {
      ...m.owner,
      avatarUrl: m.owner.avatarUrl ? await getSignedFileUrl(m.owner.avatarUrl) : null,
    },
  })));
}

export async function unlinkFamilyMember(memberId: string, ownerId: string) {
  await assertOwnedMember(memberId, ownerId);
  return prisma.familyMember.update({
    where: { id: memberId },
    data: { linkedUserId: null },
  });
}

// determina si `nodeId` ocupa un lugar estructural reconocible (madre,
// padre, hermano/a) respecto de `referenceId`, dentro de la misma lista
// de miembros — se usa para detectar candidatos a fusionar entre dos
// árboles sin comparar generaciones completas
function slotRelativo(nodeId: string, referenceId: string, pool: any[]): 'madre' | 'padre' | 'hermano' | null {
  if (nodeId === referenceId) return null;
  const ref = pool.find((n) => n.id === referenceId);
  const node = pool.find((n) => n.id === nodeId);
  if (!ref || !node) return null;
  if (ref.motherId === node.id) return 'madre';
  if (ref.fatherId === node.id) return 'padre';
  const compartePadre = ref.fatherId && node.fatherId === ref.fatherId;
  const carteMadre = ref.motherId && node.motherId === ref.motherId;
  if (compartePadre || carteMadre) return 'hermano';
  return null;
}

function normalizarNombre(nombre: string): string {
  return nombre.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Compara el árbol de origen contra el tuyo: mismo primer nombre + mismo
// lugar estructural (mirado desde "cómo te ve a vos ese árbol") = candidato
// a fusionar. Si hay más de una coincidencia para el mismo nombre+lugar,
// no arriesgamos — se ofrece como nodo nuevo, sin sugerir fusión.
function detectarFusiones(nuevos: any[], sourceMembers: any[], ownMembers: any[], ownerId: string) {
  const selfInSource = sourceMembers.find((m) => m.linkedUserId === ownerId);
  const yoOwner = ownMembers.find((m) => m.linkedUserId === ownerId);
  if (!selfInSource || !yoOwner) return [];

  const candidatos: { sourceId: string; sourceName: string; existingId: string; existingName: string; slot: string }[] = [];

  for (const m of nuevos) {
    const slotFuente = slotRelativo(m.id, selfInSource.id, sourceMembers);
    if (!slotFuente) continue;
    const nombreFuente = normalizarNombre(m.firstName);

    const coincidencias = ownMembers.filter((e) =>
      normalizarNombre(e.firstName) === nombreFuente &&
      slotRelativo(e.id, yoOwner.id, ownMembers) === slotFuente
    );

    if (coincidencias.length === 1) {
      candidatos.push({
        sourceId: m.id,
        sourceName: `${m.firstName} ${m.lastName || ''}`.trim(),
        existingId: coincidencias[0].id,
        existingName: `${coincidencias[0].firstName} ${coincidencias[0].lastName || ''}`.trim(),
        slot: slotFuente,
      });
    }
  }

  return candidatos;
}

// ── Copiar árbol de la persona vinculada ──
// memberId es el nodo de TU árbol que ya está vinculado a la otra cuenta.
// Trae todo lo que ella tiene en el suyo y todavía no tenés vos, sin
// duplicar nada de lo que ya hayas copiado antes.

export async function previewCopyTree(memberId: string, ownerId: string) {
  const anchor = await assertOwnedMember(memberId, ownerId);
  if (!anchor.linkedUserId) {
    throw new Error('Este familiar todavía no está vinculado a una cuenta');
  }
  const sourceOwnerId = anchor.linkedUserId;

  const [sourceMembers, yaCopiados, ownMembers] = await Promise.all([
    prisma.familyMember.findMany({ where: { ownerId: sourceOwnerId } }),
    prisma.familyMember.findMany({ where: { ownerId, copiedFromId: { not: null } }, select: { copiedFromId: true } }),
    prisma.familyMember.findMany({ where: { ownerId } }),
  ]);

  const yaCopiadosIds = new Set(yaCopiados.map((m) => m.copiedFromId));
  const anchorEnOrigen = sourceMembers.find((m) => m.linkedUserId === sourceOwnerId);
  // consistente con copyFamilyTree: tampoco contamos como "nuevo" al nodo
  // que te representa a vos mismo dentro del árbol de la otra persona
  const nuevos = sourceMembers.filter((m) =>
    m.id !== anchorEnOrigen?.id && !yaCopiadosIds.has(m.id) && m.linkedUserId !== ownerId
  );

  const fusionesPosibles = detectarFusiones(nuevos, sourceMembers, ownMembers, ownerId);

  return { total: nuevos.length, primeraVez: yaCopiadosIds.size === 0, fusionesPosibles };
}

export async function copyFamilyTree(memberId: string, ownerId: string, fusiones: { sourceId: string; existingId: string }[] = []) {
  const anchor = await assertOwnedMember(memberId, ownerId);
  if (!anchor.linkedUserId) {
    throw new Error('Este familiar todavía no está vinculado a una cuenta');
  }
  const sourceOwnerId = anchor.linkedUserId;
  if (sourceOwnerId === ownerId) {
    throw new Error('No podés copiar tu propio árbol');
  }

  // el nodo "yo" del otro (mismo patrón que getFullTree) — si nunca entró
  // a su árbol, no existe todavía, así que lo creamos igual que ahí
  let anchorEnOrigen = await prisma.familyMember.findFirst({
    where: { ownerId: sourceOwnerId, linkedUserId: sourceOwnerId },
  });
  if (!anchorEnOrigen) {
    const sourceUser = await prisma.user.findUnique({ where: { id: sourceOwnerId } });
    if (sourceUser) {
      anchorEnOrigen = await prisma.familyMember.create({
        data: {
          ownerId: sourceOwnerId,
          linkedUserId: sourceOwnerId,
          firstName: sourceUser.firstName,
          lastName: sourceUser.lastName,
          photoKey: sourceUser.avatarUrl,
        },
      });
    }
  }

  const [sourceMembers, sourcePartners, yaCopiados, ownMembersActuales] = await Promise.all([
    prisma.familyMember.findMany({ where: { ownerId: sourceOwnerId } }),
    prisma.familyPartner.findMany({ where: { memberA: { ownerId: sourceOwnerId } } }),
    prisma.familyMember.findMany({ where: { ownerId, copiedFromId: { not: null } } }),
    prisma.familyMember.findMany({ where: { ownerId } }),
  ]);

  // id del árbol origen → id en TU árbol. El emparejamiento del ancla es
  // SIEMPRE explícito (el nodo que ya tenés vos = el nodo que representa
  // a la otra persona en su propio árbol) — nunca se adivina por búsqueda,
  // así no hay forma de que termine duplicándose
  const idMap = new Map<string, string>();
  if (anchorEnOrigen) idMap.set(anchorEnOrigen.id, anchor.id);
  for (const yc of yaCopiados) {
    if (yc.copiedFromId) idMap.set(yc.copiedFromId, yc.id);
  }

  // fusiones que VOS confirmaste: en vez de crear un nodo nuevo, reusamos
  // el que ya tenías — y le completamos la foto si le faltaba (acá sí,
  // porque fuiste vos quien confirmó que es la misma persona)
  for (const f of fusiones) {
    const existente = ownMembersActuales.find((e) => e.id === f.existingId);
    const fuente = sourceMembers.find((m) => m.id === f.sourceId);
    if (!existente || existente.ownerId !== ownerId || !fuente) continue;
    idMap.set(f.sourceId, existente.id);
    await prisma.familyMember.update({
      where: { id: existente.id },
      data: {
        copiedFromId: f.sourceId,
        ...(!existente.photoKey && fuente.photoKey ? { photoKey: fuente.photoKey } : {}),
      },
    });
  }

  // nunca nos copiamos a nosotros mismos, aunque el otro árbol tenga
  // un nodo que nos representa (por ejemplo, por la reciprocidad)
  const aCrear = sourceMembers.filter((m) => !idMap.has(m.id) && m.linkedUserId !== ownerId);

  // 1ª pasada: crear las filas nuevas, sin vínculos de padre/madre todavía
  for (const m of aCrear) {
    const nuevo = await prisma.familyMember.create({
      data: {
        ownerId,
        firstName: m.firstName,
        lastName: m.lastName,
        gender: m.gender,
        birthDate: m.birthDate,
        deathDate: m.deathDate,
        bio: m.bio,
        relacionManual: m.relacionManual,
        linkedUserId: m.linkedUserId,
        photoKey: m.linkedUserId ? m.photoKey : null,
        copiedFromId: m.id,
      },
    });
    idMap.set(m.id, nuevo.id);
  }

  // 2ª pasada: reconstruimos motherId/fatherId con los ids ya mapeados
  for (const m of aCrear) {
    const nuevoId = idMap.get(m.id) as string;
    const newMotherId = m.motherId ? idMap.get(m.motherId) : undefined;
    const newFatherId = m.fatherId ? idMap.get(m.fatherId) : undefined;
    if (newMotherId || newFatherId) {
      await prisma.familyMember.update({
        where: { id: nuevoId },
        data: { motherId: newMotherId, fatherId: newFatherId },
      });
    }
  }

  // el propio nodo ancla (el que ya tenías vos, representando a la otra
  // persona) también puede tener madre/padre asignados en SU árbol de
  // origen — sin este paso, esos vínculos nunca llegaban a tu copia, y
  // por eso nadie calculaba bien el parentesco relativo a ella.
  // Nunca pisamos algo que ya hayas cargado vos mismo en ese nodo.
  if (anchorEnOrigen) {
    const newAnchorMotherId = anchorEnOrigen.motherId ? idMap.get(anchorEnOrigen.motherId) : undefined;
    const newAnchorFatherId = anchorEnOrigen.fatherId ? idMap.get(anchorEnOrigen.fatherId) : undefined;
    const patchAnchor: Record<string, string> = {};
    if (newAnchorMotherId && !anchor.motherId) patchAnchor.motherId = newAnchorMotherId;
    if (newAnchorFatherId && !anchor.fatherId) patchAnchor.fatherId = newAnchorFatherId;
    if (Object.keys(patchAnchor).length > 0) {
      await prisma.familyMember.update({ where: { id: anchor.id }, data: patchAnchor });
    }
  }

  // los nodos FUSIONADOS (ya existían en tu árbol, no se crearon de cero)
  // también pueden tener madre/padre del lado de origen que todavía no
  // reflejabas — mismo criterio que con el ancla, nunca pisamos algo que
  // ya hayas cargado vos mismo en ese nodo
  for (const f of fusiones) {
    const fuente = sourceMembers.find((m) => m.id === f.sourceId);
    const existente = ownMembersActuales.find((e) => e.id === f.existingId);
    if (!fuente || !existente) continue;
    const newMotherId = fuente.motherId ? idMap.get(fuente.motherId) : undefined;
    const newFatherId = fuente.fatherId ? idMap.get(fuente.fatherId) : undefined;
    const patchFusion: Record<string, string> = {};
    if (newMotherId && !existente.motherId) patchFusion.motherId = newMotherId;
    if (newFatherId && !existente.fatherId) patchFusion.fatherId = newFatherId;
    if (Object.keys(patchFusion).length > 0) {
      await prisma.familyMember.update({ where: { id: f.existingId }, data: patchFusion });
    }
  }

  // tu propio nodo también puede tener madre/padre del lado de origen: si
  // quien te etiquetó te representa como hija/o de alguien en su árbol,
  // y todavía no tenés esa madre/padre cargada en el tuyo, se conecta acá
  // mismo — sin esto, copiar un árbol al que ni siquiera quedás conectado
  // vos mismo no tenía sentido. Nunca pisa algo que ya hayas cargado vos.
  const meEnOrigen = sourceMembers.find((m) => m.linkedUserId === ownerId);
  const yoPropio = ownMembersActuales.find((m) => m.linkedUserId === ownerId);
  if (meEnOrigen && yoPropio) {
    const newYoMotherId = meEnOrigen.motherId ? idMap.get(meEnOrigen.motherId) : undefined;
    const newYoFatherId = meEnOrigen.fatherId ? idMap.get(meEnOrigen.fatherId) : undefined;
    const patchYo: Record<string, string> = {};
    if (newYoMotherId && !yoPropio.motherId) patchYo.motherId = newYoMotherId;
    if (newYoFatherId && !yoPropio.fatherId) patchYo.fatherId = newYoFatherId;
    if (Object.keys(patchYo).length > 0) {
      await prisma.familyMember.update({ where: { id: yoPropio.id }, data: patchYo });
    }
  }

  // parejas — evitamos duplicar si por algún motivo ya existía ese vínculo
  for (const p of sourcePartners) {
    const a = idMap.get(p.memberAId);
    const b = idMap.get(p.memberBId);
    if (!a || !b) continue;
    const existente = await prisma.familyPartner.findFirst({
      where: { OR: [{ memberAId: a, memberBId: b }, { memberAId: b, memberBId: a }] },
    });
    if (!existente) {
      await prisma.familyPartner.create({ data: { memberAId: a, memberBId: b } });
    }
  }

  return { creados: aCrear.length };
}

export async function updateMemberPosition(memberId: string, ownerId: string, posX: number, posY: number) {
  await assertOwnedMember(memberId, ownerId);
  return prisma.familyMember.update({
    where: { id: memberId },
    data: { posX, posY },
  });
}

export async function getMyPlacements(userId: string) {
  const members = await prisma.familyMember.findMany({
    where: { linkedUserId: userId },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true } },
      mother: true,
      father: true,
      partnersA: { include: { memberB: true } },
      partnersB: { include: { memberA: true } },
    },
  });

  return members.map((m) => ({
    ownerId: m.owner.id,
    ownerName: `${m.owner.firstName} ${m.owner.lastName}`,
    myNode: { id: m.id, firstName: m.firstName, lastName: m.lastName, gender: m.gender },
    mother: m.mother ? { id: m.mother.id, firstName: m.mother.firstName, lastName: m.mother.lastName } : null,
    father: m.father ? { id: m.father.id, firstName: m.father.firstName, lastName: m.father.lastName } : null,
    partners: [
      ...m.partnersA.map((p) => p.memberB),
      ...m.partnersB.map((p) => p.memberA),
    ].map((p) => ({ id: p.id, firstName: p.firstName, lastName: p.lastName })),
  }));
}