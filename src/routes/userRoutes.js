import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import userController from '../controllers/UserController.js';
import loginRequired from '../middlewares/loginRequired.js';

const router = new Router();

const passwordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas por IP
    message: { errors: ['⏳ Muitas tentativas. Aguarde 15 minutos e tente novamente.'] },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', userController.registerKing); //registrar novo usuário (KING)
router.post('/verify', userController.verifyKing); //verificar usuário (KING)
router.post('/resend_code', passwordLimiter, userController.resendCode); //reenviar código (KING)

router.get('/', userController.index); // visualizar todos os usuários
router.post('/', loginRequired, userController.store); //criar novo usuário
router.get('/:id', loginRequired, userController.show); // visualizar usuário
router.put('/:id', loginRequired, userController.update); // atualizar usuário
router.delete('/:id', loginRequired, userController.delete); // deletar usuário

router.post('/password_recovery', passwordLimiter, userController.passwordRecovery); //solicitar recuperação de senha
router.post('/password_reset', passwordLimiter, userController.passwordReset); //resetar senha

router.patch('/:user_id/skills/:skill_id', loginRequired, userController.updateSkill); //upar a skill do usuário 

export default router;
