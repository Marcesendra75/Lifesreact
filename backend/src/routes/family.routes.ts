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
router.get('/pending-links', familyController.getPendingLinks);
router.delete('/tree', familyController.deleteTree);
router.patch('/members/:id/link', familyController.proposeLink);
router.patch('/members/:id/accept-link', familyController.acceptLink);
router.patch('/members/:id/reject-link', familyController.rejectLink);
router.patch('/members/:id/cancel-link', familyController.cancelLink);
router.delete('/members/:id/link', familyController.unlinkMember);
router.get('/members/:id/copy-preview', familyController.previewCopy);
router.post('/members/:id/copy', familyController.copyTree);
router.patch('/members/:id/position', familyController.updatePosition);

export default router;