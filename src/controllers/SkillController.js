import Skill from '../models/Skill.js';
import UserSkill from '../models/UserSkill.js';

class SkillController {
    //store
    async store(req, res) {

        const isMaster = req.userRole === 'MASTER';
        const isKing = req.userRole === 'KING';

        try {

            if (!isMaster && !isKing) {
                return res.status(401).json({
                    errors: ['Você tenta criar uma habilidade, mas lhe falta conhecimento arcano. Apenas Mestres da Guilda possuem tal habilidade.'],
                });
            }

            const totalSkills = await Skill.count();

            if (totalSkills >= 10) {
                return res.status(401).json({
                    errors: ['O mundo já está sobrecarregado com habilidades. Não é possível criar mais.'],
                });
            }

            const novaSkill = await Skill.create(req.body);
            const { id, nome, tipo, dano, custo_mana, descricao } = novaSkill;

            return res.json({
                msg: "As energias mágicas se agitam e uma nova habilidade surge no mundo!",
                skill: { id, nome, tipo, dano, custo_mana, descricao },
            })

        } catch (e) {
            return res.status(400).json({
                errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.']
            })
        }
    }

    //index 
    async index(req, res) {
        try {
            const skills = await Skill.findAll({
                attributes: ['id', 'nome', 'tipo', 'dano', 'custo_mana', 'descricao'],
            });

            return res.json(skills);
        } catch (e) {
            return res.status(400).json({
                errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.'],
            })
        }
    }

    //show
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
                errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.'],
            });
        }
    }

    //update
    async update(req, res) {

        const isMaster = req.userRole === 'MASTER';
        const isKing = req.userRole === 'KING';

        try {
            const skill = await Skill.findByPk(req.params.id);

            if (!skill) {
                return res.status(404).json({
                    errors: ['Esta habilidade se perdeu nas névoas do tempo (Não encontrada).'],
                });
            }

            if (!isMaster && !isKing) {
                return res.status(401).json({
                    errors: ['Um golem de pedra bloqueia seu caminho. Apenas o Rei pode alterar a essência de uma habilidade.'],
                });
            }

            if (!isKing) {
                return res.status(401).json({
                    errors: ['BLASFÊMIA! Seu poder é ineficiente para alterar a essência de uma habilidade te falta mais poder ou conhecimento arcano.'],
                });
            }

            const skillAtualizada = await skill.update(req.body);
            const { id, nome, tipo, dano, custo_mana, descricao } = skillAtualizada;

            return res.json({
                msg: "Uma luz dourada emana da habilidade, confirmando a alteração.",
                skill: { id, nome, tipo, dano, custo_mana, descricao },
            });

        } catch (e) {
            return res.status(400).json({
                errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.'],
            });
        }
    }

    //delete
    async delete(req, res) {

        const isMaster = req.userRole === 'MASTER';
        const isKing = req.userRole === 'KING';
        try {
            const skill = await Skill.findByPk(req.params.id);

            if (!skill) {
                return res.status(404).json({
                    errors: ['Esta habilidade se perdeu nas névoas do tempo (Não encontrada).'],
                });
            }

            if (!isMaster && !isKing) {
                return res.status(401).json({
                    errors: ['Um golem de pedra bloqueia seu caminho. Apenas o Rei pode excluir uma habilidade.'],
                });
            }

            if (!isKing) {
                return res.status(401).json({
                    errors: ['BLASFÊMIA! Seu poder é ineficiente para excluir uma habilidade te falta mais poder ou conhecimento arcano.'],
                });
            }

            await skill.destroy();

            return res.json({
                msg: "A habilidade se desfaz em poeira estelar, seu conhecimento perdido para sempre.",
            });

        } catch (e) {
            return res.status(400).json({
                errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.'],
            });
        }
    }

    async learn(req, res) {
        try {
            const user = req.userId;
            const skill = await Skill.findByPk(req.params.id);

            if (!skill) {
                return res.status(404).json({
                    errors: ['Esta habilidade se perdeu nas névoas do tempo (Não encontrada).'],
                });
            }

            const userSkill = await UserSkill.findOne({
                where: {
                    user_id: user,
                    skill_id: skill.id,
                },
            });

            if (userSkill) {
                return res.status(400).json({
                    errors: ['Esta habilidade já foi aprendida por você.'],
                });
            }

            const novaUserSkill = await UserSkill.create({
                user_id: user,
                skill_id: skill.id,
            });

            return res.json({
                msg: "A habilidade se fixa no seu coração, sua mente se abriu para o conhecimento.",
                userSkill: novaUserSkill,
            });


        } catch (e) {
            return res.status(400).json({
                errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.'],
            });
        }
    }
}

export default new SkillController();