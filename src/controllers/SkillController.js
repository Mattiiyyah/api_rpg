import Skill from '../models/Skill.js';
import UserSkill from '../models/UserSkill.js';
import SkillService from '../services/SkillService.js';

class SkillController {
    async store(req, res) {
        try {
            const novaSkill = await SkillService.createSkill(req.userRole, req.body);
            const { id, nome, tipo, dano, custo_mana, descricao } = novaSkill;

            return res.json({
                msg: "As energias mágicas se agitam e uma nova habilidade surge no mundo!",
                skill: { id, nome, tipo, dano, custo_mana, descricao },
            })

        } catch (e) {
            return res.status(e.status || 400).json({
                errors: e.errors?.map(err => typeof err === 'string' ? err : err.message) || ['Ocorreu um erro inesperado.']
            })
        }
    }

    async index(req, res) {
        try {
            const skills = await Skill.findAll({
                attributes: ['id', 'nome', 'tipo', 'dano', 'custo_mana', 'descricao'],
            });

            return res.json(skills);
        } catch (e) {
            return res.status(400).json({
                errors: e.errors?.map(err => typeof err === 'string' ? err : err.message) || ['Ocorreu um erro inesperado.'],
            })
        }
    }

    async show(req, res) {
        try {
            const skill = await Skill.findByPk(req.params.id);

            if (!skill) {
                return res.status(404).json({
                    errors: ['Esta habilidade se perdeu nas névoas do tempo (Não encontrada).'],
                });
            }

            const { id, nome, tipo, dano, custo_mana, descricao } = skill;
            return res.json({ id, nome, tipo, dano, custo_mana, descricao });
        } catch (e) {
            return res.status(400).json({
                errors: e.errors?.map(err => typeof err === 'string' ? err : err.message) || ['Ocorreu um erro inesperado.'],
            });
        }
    }

    async update(req, res) {
        try {
            const skillAtualizada = await SkillService.updateSkill(req.userRole, req.params.id, req.body);
            const { id, nome, tipo, dano, custo_mana, descricao } = skillAtualizada;

            return res.json({
                msg: "Uma luz dourada emana da habilidade, confirmando a alteração.",
                skill: { id, nome, tipo, dano, custo_mana, descricao },
            });

        } catch (e) {
            return res.status(e.status || 400).json({
                errors: e.errors?.map(err => typeof err === 'string' ? err : err.message) || ['Ocorreu um erro inesperado.'],
            });
        }
    }

    async delete(req, res) {
        try {
            await SkillService.deleteSkill(req.userRole, req.params.id);

            return res.json({
                msg: "A habilidade se desfaz em poeira estelar, seu conhecimento perdido para sempre.",
            });

        } catch (e) {
            return res.status(e.status || 400).json({
                errors: e.errors?.map(err => typeof err === 'string' ? err : err.message) || ['Ocorreu um erro inesperado.'],
            });
        }
    }

    async learn(req, res) {
        try {
            const novaUserSkill = await SkillService.learnSkill(req.userId, req.params.id);

            return res.json({
                msg: "A habilidade se fixa no seu coração, sua mente se abriu para o conhecimento.",
                userSkill: novaUserSkill,
            });

        } catch (e) {
            return res.status(e.status || 400).json({
                errors: e.errors?.map(err => typeof err === 'string' ? err : err.message) || ['Ocorreu um erro inesperado.'],
            });
        }
    }

}

export default new SkillController();