import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import { createFamilyMemberSchema, updateFamilyMemberSchema, createPartnerSchema, linkMemberSchema, positionSchema } from '../validators/family.validator';
import * as familyService from '../services/family.service';

export async function createMember(req: AuthRequest, res: Response) {
  try {
    const parsed = createFamilyMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }

    const member = await familyService.createFamilyMember({
      ownerId: req.userId as string,
      ...parsed.data,
      file: req.file,
    });

    res.status(201).json({ success: true, data: member });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al crear el familiar' });
  }
}

export async function listMembers(req: AuthRequest, res: Response) {
  try {
    const members = await familyService.listFamilyMembers(req.userId as string);
    res.json({ success: true, data: members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener el árbol' });
  }
}

export async function getMember(req: AuthRequest, res: Response) {
  try {
    const member = await familyService.getFamilyMember(req.params.id, req.userId as string);
    res.json({ success: true, data: member });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message || 'Familiar no encontrado' });
  }
}

export async function updateMember(req: AuthRequest, res: Response) {
  try {
    const parsed = updateFamilyMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }

    const member = await familyService.updateFamilyMember(req.params.id, req.userId as string, {
      ...parsed.data,
      file: req.file,
    });

    res.json({ success: true, data: member });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al editar el familiar' });
  }
}

export async function removeMember(req: AuthRequest, res: Response) {
  try {
    await familyService.deleteFamilyMember(req.params.id, req.userId as string);
    res.json({ success: true, message: 'Familiar eliminado' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al eliminar el familiar' });
  }
}

export async function addPartner(req: AuthRequest, res: Response) {
  try {
    const parsed = createPartnerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }

    const partner = await familyService.createPartner(
      req.userId as string,
      parsed.data.memberAId,
      parsed.data.memberBId
    );
    res.status(201).json({ success: true, data: partner });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al vincular la pareja' });
  }
}

export async function removePartner(req: AuthRequest, res: Response) {
  try {
    await familyService.deletePartner(req.params.id, req.userId as string);
    res.json({ success: true, message: 'Vínculo eliminado' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al eliminar el vínculo' });
  }
}

export async function getTree(req: AuthRequest, res: Response) {
  try {
    const tree = await familyService.getFullTree(req.userId as string);
    res.json({ success: true, data: tree });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener el árbol' });
  }
}

export async function linkMember(req: AuthRequest, res: Response) {
  try {
    const parsed = linkMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const member = await familyService.linkFamilyMemberToUser(
      req.params.id,
      req.userId as string,
      parsed.data.userId
    );
    res.json({ success: true, data: member });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al vincular' });
  }
}

export async function unlinkMember(req: AuthRequest, res: Response) {
  try {
    const member = await familyService.unlinkFamilyMember(req.params.id, req.userId as string);
    res.json({ success: true, data: member });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al desvincular' });
  }
}

export async function updatePosition(req: AuthRequest, res: Response) {
  try {
    const parsed = positionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const member = await familyService.updateMemberPosition(req.params.id, req.userId as string, parsed.data.posX, parsed.data.posY);
    res.json({ success: true, data: member });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Error al guardar la posición' });
  }
}

export async function getMyPlacements(req: AuthRequest, res: Response) {
  try {
    const placements = await familyService.getMyPlacements(req.userId as string);
    res.json({ success: true, data: placements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener tus ubicaciones' });
  }
}