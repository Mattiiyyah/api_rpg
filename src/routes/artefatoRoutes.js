import { Router } from 'express';
import ArtefatoController from '../controllers/ArtefatoController.js';
import loginRequired from '../middlewares/loginRequired.js';

const router = Router();

router.get('/', ArtefatoController.index); //listar artefatos
router.post('/', loginRequired, ArtefatoController.store); //criar artefato
router.get('/:id', loginRequired, ArtefatoController.show); //visualizar artefato
router.put('/:id',  loginRequired, ArtefatoController.update); //atualizar artefato
router.delete('/:id', loginRequired, ArtefatoController.delete); //deletar artefato


router.patch('/loot/:id', loginRequired, ArtefatoController.loot);

export default router;
