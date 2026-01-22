import { Router } from 'express';
import SkillController from '../controllers/SkillController.js';
import loginRequired from '../middlewares/loginRequired.js';

const router = new Router();

router.get('/', SkillController.index);
router.post('/', loginRequired, SkillController.store);
router.get('/:id', loginRequired, SkillController.show);
router.put('/:id', loginRequired, SkillController.update);
router.delete('/:id', loginRequired, SkillController.delete);

router.post('/:id/aprender', loginRequired, SkillController.learn);

export default router;