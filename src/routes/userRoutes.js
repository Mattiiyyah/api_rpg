import { Router } from 'express';
import userController from '../controllers/UserController.js';
import loginRequired from '../middlewares/loginRequired.js';

const router = new Router();

router.post('/register', userController.registerKing);
router.post('/verify', userController.verifyKing);

router.get('/', userController.index); // visualizar todos os usuários
router.post('/', loginRequired, userController.store); //criar novo usuário
router.get('/:id', loginRequired, userController.show); // visualizar usuário
router.put('/:id', loginRequired, userController.update); // atualizar usuário
router.delete('/:id', loginRequired, userController.delete); // deletar usuário

router.patch('/:user_id/skills/:skill_id', loginRequired, userController.updateSkill); //upar a skill do usuário 

export default router;
