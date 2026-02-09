import Artefato from '../models/Artefato.js';
import User from '../models/User.js';

class ArtefatoController {
    async store(req, res) {
        try {
            const novoArtefato = await ArtefatoService.createArtefato(req.userRole, req.body);
            const { id, nome, tipo, poder, lore } = novoArtefato;

            return res.json({
                msg: "O martelo bate na bigorna e um novo artefato lendário surge no mundo!",
                artefato: { id, nome, tipo, poder, lore },
            });

        } catch (e) {
            return res.status(e.status || 400).json({
                errors: e.errors || ['Ocorreu um erro inesperado.'],
            });
        }
    }

    async index(req, res) {
        try {
            const artefatos = await Artefato.findAll({
                attributes: ['id', 'nome', 'tipo', 'poder', 'lore'],
                include: {
                    model: User,
                    attributes: ['id', 'nome', 'role'],
                    required: false,
                }
            });
            return res.json(artefatos);
        } catch (e) {
            return res.status(400).json({
                errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.'],
            });
        }
    }

    async show(req, res) {
        try {
            const artefato = await Artefato.findByPk(req.params.id, {
                attributes: ['id', 'nome', 'tipo', 'poder', 'lore', 'user_id'],
                include: {
                    model: User,
                    attributes: ['id', 'nome', 'email', 'role'],
                    required: false
                }
            });

            if (!artefato) {
                return res.status(404).json({
                    errors: ['Este artefato se perdeu nas névoas do tempo (Não encontrado).']
                });
            }
            const { id, nome, tipo, poder, lore } = artefato;
            return res.json({ id, nome, tipo, poder, lore });
        } catch (e) {
            return res.status(400).json({
                errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.'],
            });
        }
    }

    async update(req, res) {
        try {
            const novoArtefato = await ArtefatoService.updateArtefato(req.userRole, req.params.id, req.body);
            const { id, nome, tipo, poder, lore } = novoArtefato;

            return res.json({
                msg: "Com um estalar de dedos, a realidade do artefato foi reescrita pelo Rei.",
                artefato: { id, nome, tipo, poder, lore },
            });
        } catch (e) {
            return res.status(e.status || 400).json({
                errors: e.errors || ['Ocorreu um erro inesperado.'],
            });
        }
    }

    async delete(req, res) {
        try {
            await ArtefatoService.deleteArtefato(req.userRole, req.params.id);

            return res.json({
                msg: "Com um estalar de dedos, o artefato foi destruído pelo Rei.",
            });

        } catch (e) {
            return res.status(e.status || 400).json({
                errors: e.errors || ['Ocorreu um erro inesperado.'],
            });
        }
    }

    async loot(req, res) {
        try {
            const artefatoAtualizado = await ArtefatoService.lootArtefato(req.userId, req.params.id);

            return res.json({
                msg: `Você saqueou o item ${artefatoAtualizado.nome} com sucesso! Ele agora está no seu inventário.`,
                artefato: artefatoAtualizado
            });

        } catch (e) {
            return res.status(e.status || 400).json({
                errors: e.errors || ['Ocorreu um erro inesperado.']
            });
        }
    }
}

export default new ArtefatoController();
