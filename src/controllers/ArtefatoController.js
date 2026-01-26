import Artefato from '../models/Artefato.js';
import User from '../models/User.js';

class ArtefatoController {
   async store(req, res) {

      const isMaster = req.userRole === 'MASTER';
      const isKing = req.userRole === 'KING';

      try {
        if(!isMaster && !isKing) {
            return res.status(401).json({
                errors: ['Você tenta forjar algo, mas lhe falta conhecimento arcano. Apenas Mestres da Guilda possuem tal habilidade.']
            });
        }

        const totalArtefatos = await Artefato.count();

        if(totalArtefatos >= 20) {
            return res.status(401).json({
                errors: ['O mundo já está sobrecarregado com artefatos. Não é possível criar mais.'],
            });
        }

        const novoArtefato = await Artefato.create(req.body);
        const { id, nome, tipo, poder, lore } = novoArtefato;

        return res.json({
            msg: "O martelo bate na bigorna e um novo artefato lendário surge no mundo!",
            artefato: { id, nome, tipo, poder, lore },
        });

      } catch (e) {
         return res.status(400).json({
            errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.'],
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

           if(!artefato) {
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

       const isMaster = req.userRole === 'MASTER';
       const isKing = req.userRole === 'KING';

        try {
            const artefato = await Artefato.findByPk(req.params.id);

            if(!artefato) {
              return res.status(404).json({
                errors: ['Este artefato se perdeu nas névoas do tempo (Não encontrado).']
              });
            }

            if (!isMaster && !isKing) {
                return res.status(401).json({
                    errors: ['Uma barreira mágica repele suas mãos! Você não tem autoridade para alterar a estrutura deste objeto.']
                });
            }
            
            if (!isKing) {
                return res.status(401).json({
                    errors: ['BLASFÊMIA! A Forja do Criador não aceita seu martelo. Apenas a magia do Rei pode alterar a essência de um Artefato existente.']
                });
            }
        
            const novoArtefato = await artefato.update(req.body);
            const { id, nome, tipo, poder, lore } = novoArtefato;

            return res.json({
                msg: "Com um estalar de dedos, a realidade do artefato foi reescrita pelo Rei.",
                artefato: { id, nome, tipo, poder, lore },
            });
        } catch (e) {
            return res.status(400).json({
                errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.'],
            });
        }
      
   }

   async delete(req, res) {

     const isMaster = req.userRole === 'MASTER';
     const isKing = req.userRole === 'KING';

     try {
        const artefato = await Artefato.findByPk(req.params.id);

            if(!artefato) {
              return res.status(404).json({
                errors: ['Este artefato se perdeu nas névoas do tempo (Não encontrado).']
              });
            }

            if(!isMaster && !isKing) {
                return res.status(401).json({
                    errors: ['Uma barreira mágica repele suas mãos! Você não tem autoridade para destruir artefatos.'],
                });
            }

            if(!isKing) {  
                return res.status(401).json({
                    errors: ['BLASFÊMIA! A Forja do Criador não aceita seu martelo. Apenas a magia do Rei pode destruir artefatos existentes.'],
                });
            }

            await artefato.destroy();

            return res.json({
                msg: "Com um estalar de dedos, o artefato foi destruído pelo Rei.",
            });

     } catch (e) {
        return res.status(400).json({
            errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.'],
        });
     }
   }

   async loot(req, res) {
      try{

        const artefato = await Artefato.findByPk(req.params.id);

        if(!artefato) {
           return res.status(404).json({
              errors: ['Este artefato se perdeu nas névoas do tempo (Não encontrado).']
           });
        }

        const userArtefato = artefato.user_id;

        if(userArtefato) {
            return res.status(401).json({
                errors: ['Este artefato já pertence a alguem.'],
            });
        }

        const artefatoAtualizado = await artefato.update({ user_id: req.userId });

        return res.json({
            msg: `Você saqueou o item ${artefato.nome} com sucesso! Ele agora está no seu inventário.`,
            artefato: artefatoAtualizado
        });

      } catch(e) {
         return res.status(400).json({
           errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.']
         });
      }
   }
}

export default new ArtefatoController();
