import prisma from '../config/prisma';
import { uploadFile, deleteFile, validateFile, getSignedFileUrl } from './storage.service';
import { areConnected } from './connection.service';

interface MemberInput {
  ownerId: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  deathDate?: string;
  bio?: string;
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
  const { ownerId, firstName, lastName, gender, birthDate, deathDate, bio, motherId, fatherId, file } = input;

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

  if (data.motherId) await assertOwnedMember(data.motherId, ownerId);
  if (data.fatherId) await assertOwnedMember(data.fatherId, ownerId);

  // nadie puede ser su propio padre o madre
  if (data.motherId === id || data.fatherId === id) {
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
      motherId: data.motherId,
      fatherId: data.fatherId,
      ...(photoKey ? { photoKey } : {}),
    },
  });

  return attachPhotoUrl(updated);
}

export async function deleteFamilyMember(id: string, ownerId: string) {
  const member = await assertOwnedMember(id, ownerId);
  if (member.photoKey) {
    await deleteFile(member.photoKey);
  }
  await prisma.familyMember.delete({ where: { id } });
  // ojo: los hijos de este familiar NO se borran, solo pierden la referencia
  // a este padre/madre (así lo definimos con onDelete: SetNull en el schema)
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
  const [members, partners] = await Promise.all([
    prisma.familyMember.findMany({ where: { ownerId } }),
    prisma.familyPartner.findMany({ where: { memberA: { ownerId } } }),
  ]);

  const membersWithUrls = await Promise.all(members.map(attachPhotoUrl));
  return { members: membersWithUrls, partners };
}

async function attachPhotoUrl(member: any) {
  if (!member.photoKey) return { ...member, photoUrl: null };
  const photoUrl = await getSignedFileUrl(member.photoKey);
  return { ...member, photoUrl };
}

export async function linkFamilyMemberToUser(memberId: string, ownerId: string, targetUserId: string) {
  await assertOwnedMember(memberId, ownerId);

  if (targetUserId === ownerId) {
    throw new Error('No hace falta vincularte a vos mismo, el árbol ya es tuyo');
  }

  // solo se puede etiquetar a alguien que ya aceptó estar conectado con vos
  const connected = await areConnected(ownerId, targetUserId);
  if (!connected) {
    throw new Error('Solo podés vincular a personas con las que ya estás conectado');
  }

  return prisma.familyMember.update({
    where: { id: memberId },
    data: { linkedUserId: targetUserId },
  });
}

export async function unlinkFamilyMember(memberId: string, ownerId: string) {
  await assertOwnedMember(memberId, ownerId);
  return prisma.familyMember.update({
    where: { id: memberId },
    data: { linkedUserId: null },
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