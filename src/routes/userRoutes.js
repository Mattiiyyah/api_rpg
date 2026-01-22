import { Router } from 'express';
import userController from '../controllers/UserController.js';
import loginRequired from '../middlewares/loginRequired.js';

const router = new Router();


router.get('/', userController.index); // visualizar todos os usuários
router.post('/', loginRequired, userController.store); //criar novo usuário
router.get('/:id', loginRequired, userController.show); // visualizar usuário
router.put('/:id', loginRequired, userController.update); // atualizar usuário
router.delete('/:id', loginRequired, userController.delete); // deletar usuário

export default router;
