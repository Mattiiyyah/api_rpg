import User from '../models/User.js';
import Artefato from '../models/Artefato.js';
import Skill from '../models/Skill.js';

class UserController {
   //store
   async store(req, res) {
     
     const isKing = req.userRole === 'KING';
     const isMaster = req.userRole === 'MASTER';
     
     try {

        if (!isMaster && !isKing) {
            return res.status(401).json({
                errors: ['Apenas o Mestre da Guilda (Admin) pode recrutar novos aventureiros.']
            });
        }

        if (!isKing && req.body.role === 'KING') {
            return res.status(401).json({
                errors: ['Apenas o Rei pode recrutar um novo Rei.']
            });
        }

        const totalUsers = await User.count();

        if (totalUsers >= 9) {
            return res.status(401).json({
                errors: ['O reino já atingiu seu limite de aventureiros.']
            });
        }

        const novoUser = await User.create(req.body);
        const { id, nome, email, role } = novoUser; 

        let mensagemFinal = "";

        if(novoUser.role === 'KING') {
            mensagemFinal = `Um novo Rei ${nome} ascendeu ao trono.`;
        } else if(novoUser.role === 'MASTER') {
            mensagemFinal = `Novo Mestre ${nome} foi recrutado na Guilda.`;
        } else {
            mensagemFinal = `Novo aventureiro ${nome} foi recrutado na Guilda.`;
        }

        return res.json({ 
            msg: mensagemFinal,
            adventurer: { id, nome, email, role }
        });

     }catch(e) {
        return res.status(400).json({
            errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.'],
        })
     }
   }

   //index
   async index(req, res) {
     try {
        const users = await User.findAll({
            attributes: ['id', 'nome', 'email', 'role'],
            include: [
                { 
                    model: Artefato, 
                    attributes: ['nome', 'tipo', 'poder', 'lore'] 
                },
                { 
                    model: Skill, 
                    as: 'skills', 
                    attributes: ['nome', 'dano', 'descricao'],
                    through: { 
                        attributes: ['nivel'] 
                    }
                }
            ]
        });
        return res.json(users);
     }catch(e) {
        return res.status(400).json({
            errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.'],
        })
     }
   }

   //show
   async show(req, res) {
      try {
         const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'nome', 'email', 'role'],
            include: [
                { 
                    model: Artefato, 
                    attributes: ['nome', 'tipo', 'poder', 'lore'] 
                },
                { 
                    model: Skill, 
                    as: 'skills', 
                    attributes: ['nome', 'dano', 'descricao'],
                    through: { 
                        attributes: ['nivel'] 
                    }
                }
            ]
         });
         
         if(!user) {
            return res.status(404).json({ errors: ['Esta alma não consta nos registros do reino.'] });
         }

         const isMaster = req.userRole === 'MASTER';
         const isKing = req.userRole === 'KING';
         const isSelf = req.userId === user.id; 

         if (isMaster || isKing || isSelf) {
             return res.json(user);
         }

         return res.json({
             id: user.id,
             nome: user.nome,
             role: user.role,
             Artefatos: user.Artefatos, 
             skills: user.skills        
         });

      } catch(e) {
         return res.status(400).json({
            errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.']
         });
      }
   }

   //update
   async update(req, res) {

     const isKing = req.userRole === 'KING';
     const isMaster = req.userRole === 'MASTER';
     const userId = req.userId;

     try{
       const user = await User.findByPk(req.params.id);
       
       if(!user) {
         return res.status(404).json({ 
           errors: ['Esta alma não consta nos registros do reino.'] 
         });
       }
       
       const targetIsKing = user.role === 'KING';
       const targetIsMaster = user.role === 'MASTER';
       const isSelf = Number(req.params.id) === userId;

       if (targetIsKing && !isSelf) {
         return res.status(401).json({
           errors: ['A Coroa é intocável! Meros mortais não podem alterar os registros do Rei.']
         });
       }

       if(isMaster && targetIsMaster && !isSelf) {
         return res.status(401).json({
           errors: ['Um Mestre não pode interferir nos assuntos de outro Mestre.'] 
         });
       }

       if(!isMaster && !isKing && !isSelf) {
         return res.status(401).json({
           errors: ['Você não tem autoridade para mexer na ficha de outro aventureiro.']
         });
       }
       
       if(targetIsKing && req.body.role && req.body.role !== 'KING') {
         return res.status(401).json({
           errors:['O Trono é eterno. O Rei não pode abdicar ou ser rebaixado.']
         })
       }

       if (req.body.role === 'KING' && !isKing) {
         return res.status(401).json({
            errors: ['Apenas o destino divino pode coroar um novo Rei.']
         });
       }

       if (!isKing) {
         delete req.body.role; 
       }
       
       const novoDados = await user.update(req.body);
       
       let mensagemFinal = "";

       if(isKing) {
         mensagemFinal = `Os decretos reais de ${user.nome} foram atualizados. Vida longa ao Rei.`;
       } else if (novoDados.role === 'MASTER') { 
         mensagemFinal = `Os registros do Mestre ${user.nome} foram modificados com sucesso.`;
       } else {
         mensagemFinal = `A ficha do aventureiro ${user.nome} foi atualizada.`;
       }

       const { id, nome, email, role } = novoDados;
       
       return res.json({ 
          msg: mensagemFinal,
          dados: { id, nome, email, role },
       });

     } catch (e) {
        return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || ['Ocorreu um erro inesperado.'],
       });
     }
   }

   async delete(req, res) {

     const isKing = req.userRole === 'KING';
     const isMaster = req.userRole === 'MASTER';
     const userId = req.userId;

     try {
       const user = await User.findByPk(req.params.id);

      if(!user) {
         return res.status(404).json({ 
           errors: ['Esta alma não consta nos registros do reino.'] 
         });
       }

       const targetIsKing = user.role === 'KING';
       const targetIsMaster = user.role === 'MASTER';
       const isSelf = Number(req.params.id) === userId;

       if( (isKing && targetIsKing) && (isSelf || !isSelf) ) {
         return res.status(401).json({
           errors: ['A coroa é eterna. O Rei não pode ser apagado.']
         })
       }
       
       if (targetIsKing) {
         return res.status(401).json({ 
           errors: ['TOLO! Você não pode apagar a existência daquele que criou o Universo. O Rei é Imortal.']
         });
       }

       if (!isMaster && !isKing && !isSelf) {
         return res.status(401).json({
           errors: ['Seu nível de poder é insuficiente para exilar alguém do reino.']
         });
       }

       if (isMaster && targetIsMaster && !isSelf) {
            return res.status(401).json({
                errors: ['Sua autoridade não funciona contra um igual (Outro Mestre).']
            });
       }
       
       await user.destroy();
              
       return res.json({ msg: `O nome de ${user.nome} foi riscado do Livro da Vida. Que sua alma encontre paz no Vazio Digital.` });
    
     } catch (e) {
       return res.status(400).json({
         errors: e.errors?.map((err) => err.message) || ['Ocorreu um erro inesperado.'],
       });
     }
   }
}

export default new UserController();
