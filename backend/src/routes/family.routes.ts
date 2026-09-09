import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import * as familyController from '../controllers/family.controller';

const router = Router();

router.use(authMiddleware);

router.get('/tree', familyController.getTree);

router.post('/members', upload.single('file'), familyController.createMember);
router.get('/members', familyController.listMembers);
router.get('/members/:id', familyController.getMember);
router.patch('/members/:id', upload.single('file'), familyController.updateMember);
router.delete('/members/:id', familyController.removeMember);

router.post('/partners', familyController.addPartner);
router.delete('/partners/:id', familyController.removePartner);

router.get('/my-placements', familyController.getMyPlacements);
router.patch('/members/:id/link', familyController.linkMember);
router.delete('/members/:id/link', familyController.unlinkMember);
router.patch('/members/:id/position', familyController.updatePosition);

export default router;