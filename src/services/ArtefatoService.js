import Artefato from '../models/Artefato.js';

class ArtefatoService {
    async createArtefato(userRole, data) {
        const isMaster = userRole === 'MASTER';
        const isKing = userRole === 'KING';

        if (!isMaster && !isKing) {
            throw { status: 401, errors: ['Você tenta forjar algo, mas lhe falta conhecimento arcano. Apenas Mestres da Guilda possuem tal habilidade.'] };
        }

        const totalArtefatos = await Artefato.count();

        if (totalArtefatos >= 20) {
            throw { status: 401, errors: ['O mundo já está sobrecarregado com artefatos. Não é possível criar mais.'] };
        }

        const novoArtefato = await Artefato.create(data);
        return novoArtefato;
    }

    async updateArtefato(userRole, id, data) {
        const isMaster = userRole === 'MASTER';
        const isKing = userRole === 'KING';

        const artefato = await Artefato.findByPk(id);

        if (!artefato) {
            throw { status: 404, errors: ['Este artefato se perdeu nas névoas do tempo (Não encontrado).'] };
        }

        if (!isMaster && !isKing) {
            throw { status: 401, errors: ['Uma barreira mágica repele suas mãos! Você não tem autoridade para alterar a estrutura deste objeto.'] };
        }

        if (!isKing) {
            throw { status: 401, errors: ['BLASFÊMIA! A Forja do Criador não aceita seu martelo. Apenas a magia do Rei pode alterar a essência de um Artefato existente.'] };
        }

        const novoArtefato = await artefato.update(data);
        return novoArtefato;
    }

    async deleteArtefato(userRole, id) {
        const isMaster = userRole === 'MASTER';
        const isKing = userRole === 'KING';

        const artefato = await Artefato.findByPk(id);

        if (!artefato) {
            throw { status: 404, errors: ['Este artefato se perdeu nas névoas do tempo (Não encontrado).'] };
        }

        if (!isMaster && !isKing) {
            throw { status: 401, errors: ['Uma barreira mágica repele suas mãos! Você não tem autoridade para destruir artefatos.'] };
        }

        if (!isKing) {
            throw { status: 401, errors: ['BLASFÊMIA! A Forja do Criador não aceita seu martelo. Apenas a magia do Rei pode destruir artefatos existentes.'] };
        }

        await artefato.destroy();
        return true;
    }

    async lootArtefato(userId, artefatoId) {
        const artefato = await Artefato.findByPk(artefatoId);

        if (!artefato) {
            throw { status: 404, errors: ['Este artefato se perdeu nas névoas do tempo (Não encontrado).'] };
        }

        if (artefato.user_id) {
            throw { status: 401, errors: ['Este artefato já pertence a alguem.'] };
        }

        const artefatoAtualizado = await artefato.update({ user_id: userId });
        return artefatoAtualizado;
    }
}

export default new ArtefatoService();
