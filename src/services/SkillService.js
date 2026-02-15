import Skill from '../models/Skill.js';
import UserSkill from '../models/UserSkill.js';

class SkillService {
    async createSkill(userRole, data) {
        const isMaster = userRole === 'MASTER';
        const isKing = userRole === 'KING';

        if (!isMaster && !isKing) {
            throw { status: 401, errors: ['Você tenta criar uma habilidade, mas lhe falta conhecimento arcano. Apenas Mestres da Guilda possuem tal habilidade.'] };
        }

        const totalSkills = await Skill.count();

        if (totalSkills >= 10) {
            throw { status: 401, errors: ['O mundo já está sobrecarregado com habilidades. Não é possível criar mais.'] };
        }

        const novaSkill = await Skill.create(data);
        return novaSkill;
    }

    async updateSkill(userRole, id, data) {
        const isMaster = userRole === 'MASTER';
        const isKing = userRole === 'KING';

        const skill = await Skill.findByPk(id);

        if (!skill) {
            throw { status: 404, errors: ['Esta habilidade se perdeu nas névoas do tempo (Não encontrada).'] };
        }

        if (!isMaster && !isKing) {
            throw { status: 401, errors: ['Um golem de pedra bloqueia seu caminho. Apenas o Rei pode alterar a essência de uma habilidade.'] };
        }

        if (!isKing) {
            throw { status: 401, errors: ['BLASFÊMIA! Seu poder é ineficiente para alterar a essência de uma habilidade te falta mais poder ou conhecimento arcano.'] };
        }

        const skillAtualizada = await skill.update(data);
        return skillAtualizada;
    }

    async deleteSkill(userRole, id) {
        const isMaster = userRole === 'MASTER';
        const isKing = userRole === 'KING';

        const skill = await Skill.findByPk(id);

        if (!skill) {
            throw { status: 404, errors: ['Esta habilidade se perdeu nas névoas do tempo (Não encontrada).'] };
        }

        if (!isMaster && !isKing) {
            throw { status: 401, errors: ['Um golem de pedra bloqueia seu caminho. Apenas o Rei pode excluir uma habilidade.'] };
        }

        if (!isKing) {
            throw { status: 401, errors: ['BLASFÊMIA! Seu poder é ineficiente para excluir uma habilidade te falta mais poder ou conhecimento arcano.'] };
        }

        await skill.destroy();
        return true;
    }

    async learnSkill(userId, skillId) {
        const skill = await Skill.findByPk(skillId);

        if (!skill) {
            throw { status: 404, errors: ['Esta habilidade se perdeu nas névoas do tempo (Não encontrada).'] };
        }

        const userSkill = await UserSkill.findOne({
            where: {
                user_id: userId,
                skill_id: skill.id,
            },
        });

        if (userSkill) {
            throw { status: 400, errors: ['Esta habilidade já foi aprendida por você.'] };
        }

        const novaUserSkill = await UserSkill.create({
            user_id: userId,
            skill_id: skill.id,
        });

        return novaUserSkill;
    }

}

export default new SkillService();
