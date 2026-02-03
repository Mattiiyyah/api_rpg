import User from '../models/User.js';
import Artefato from '../models/Artefato.js';
import Skill from '../models/Skill.js';
import UserSkill from '../models/UserSkill.js';
import crypto from 'crypto';
import transporter from '../config/mail.js';

class UserController {

  //registerKing
  async registerKing(req, res) {
    try {
      // Gera código de 6 dígitos
      const verificationCode = crypto.randomInt(100000, 999999).toString();

      const { nome, email, password } = req.body;

      if (!nome || !email || !password) {
        return res.status(401).json({
          errors: ['Todos os campos são obrigatórios.'],
        });
      }

      const user = await User.create({
        nome,
        email,
        password,
        role: 'KING',
        verification_code: verificationCode,
      });

      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: 'Sua Aventura Começa! ⚔️ - Código de Verificação',
        text: `Olá Rei! Seu código de verificação é: ${verificationCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Bem-vindo ao SudoGestor! 🐧👑</h2>
            <p>Para assumir seu trono, insira o código abaixo no sistema:</p>
            <h1 style="color: #8257e5; letter-spacing: 5px;">${verificationCode}</h1>
            <p>Se você não criou esta conta, ignore este e-mail.</p>
          </div>
        `,
      });

      return res.json({
        message: 'Rei cadastrado com sucesso! Verifique seu e-mail.',
        email: user.email
      });

    } catch (e) {
      console.log(e);
      return res.status(400).json({
        errors: e.errors ? e.errors.map((err) => err.message) : ['Erro ao criar usuário'],
      });
    }
  }

  //verifyKing
  async verifyKing(req, res) {
    try {
      const { email, verification_code } = req.body;

      if (!email || !verification_code) {
        return res.status(401).json({
          errors: ['Email e código de verificação são obrigatórios.'],
        });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({
          errors: ['Usuário não encontrado.'],
        });
      }

      if (user.verification_code !== verification_code) {
        return res.status(401).json({
          errors: ['Código de verificação inválido.'],
        });
      }

      user.verification_code = null;
      await user.save();

      return res.json({
        message: 'Rei verificado com sucesso!',
        user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
      });

    } catch (e) {
      console.log(e);
      return res.status(400).json({
        errors: e.errors ? e.errors.map((err) => err.message) : ['Erro ao verificar usuário'],
      });
    }
  }

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

      if (novoUser.role === 'KING') {
        mensagemFinal = `Um novo Rei ${nome} ascendeu ao trono.`;
      } else if (novoUser.role === 'MASTER') {
        mensagemFinal = `Novo Mestre ${nome} foi recrutado na Guilda.`;
      } else {
        mensagemFinal = `Novo aventureiro ${nome} foi recrutado na Guilda.`;
      }

      return res.json({
        msg: mensagemFinal,
        adventurer: { id, nome, email, role }
      });

    } catch (e) {
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
            attributes: ['id', 'nome', 'tipo', 'dano', 'descricao'],
            through: {
              attributes: ['nivel']
            }
          }
        ]
      });
      return res.json(users);
    } catch (e) {
      return res.status(400).json({
        errors: e.errors?.map(err => err.message) || ['Ocorreu um erro inesperado.'],
      })
    }
  }

  //show
  async show(req, res) {
    try {
      const isMaster = req.userRole === 'MASTER';
      const isKing = req.userRole === 'KING';
      const isOwnProfile = req.userId === parseInt(req.params.id, 10);

      // Permite se for KING/MASTER ou se for o próprio usuário vendo seu perfil
      if (!isMaster && !isKing && !isOwnProfile) {
        return res.status(401).json({
          errors: ['Apenas o Rei ou o Mestre da Guilda podem consultar os registros de outros aventureiros.']
        });
      }

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
            attributes: ['id', 'nome', 'tipo', 'dano', 'descricao'],
            through: {
              attributes: ['nivel']
            }
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ errors: ['Esta alma não consta nos registros do reino.'] });
      }

      return res.json(user);

    } catch (e) {
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

    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          errors: ['Esta alma não consta nos registros do reino.']
        });
      }

      const targetIsKing = user.role === 'KING';
      const targetIsMaster = user.role === 'MASTER';
      const isSelf = Number(req.params.id) === userId;

      if((isKing && targetIsKing) && !isSelf) {
        return res.status(401).json({
          errors: ['O Rei não pode alterar os registros de outro Rei.']
        });
      }

      if (targetIsKing && !isSelf) {
        return res.status(401).json({
          errors: ['A Coroa é intocável! Meros mortais não podem alterar os registros do Rei.']
        });
      }

      if (isMaster && targetIsMaster && !isSelf) {
        return res.status(401).json({
          errors: ['Um Mestre não pode interferir nos assuntos de outro Mestre.']
        });
      }

      if (!isMaster && !isKing) {
        return res.status(401).json({
          errors: ['Aventureiros não possuem autoridade para alterar registros. Procure um Mestre.']
        });
      }

      if (targetIsKing && req.body.role && req.body.role !== 'KING') {
        return res.status(401).json({
          errors: ['O Trono é eterno. O Rei não pode abdicar ou ser rebaixado.']
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

      if (isKing) {
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

      if (!user) {
        return res.status(404).json({
          errors: ['Esta alma não consta nos registros do reino.']
        });
      }

      const targetIsKing = user.role === 'KING';
      const targetIsMaster = user.role === 'MASTER';
      const isSelf = Number(req.params.id) === userId;

      if ((isKing && targetIsKing) && (isSelf || !isSelf)) {
        return res.status(401).json({
          errors: ['A coroa é eterna. O Rei não pode ser apagado.']
        })
      }

      if (targetIsKing) {
        return res.status(401).json({
          errors: ['TOLO! Você não pode apagar a existência daquele que criou o Universo. O Rei é Imortal.']
        });
      }

      if (!isMaster && !isKing) {
        return res.status(401).json({
          errors: ['Aventureiros não têm poder para exilar almas do reino. Procure um Mestre.']
        });
      }

      if (isMaster && targetIsMaster) {
        return res.status(401).json({
          errors: [isSelf
            ? 'Você não pode apagar a si mesmo, somente o Rei pode fazer isso.'
            : 'Sua autoridade não funciona contra um igual (Outro Mestre).']
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

  async updateSkill(req, res) {
    const isKing = req.userRole === 'KING';

    try {
      if (!isKing) {
        return res.status(401).json({
          errors: ['Somente o Rei pode modificar as habilidades dos aventureiros.']
        })
      }

      const userId = await User.findByPk(req.params.user_id);

      if (!userId) {
        return res.status(404).json({
          errors: ['Esta alma não consta nos registros do reino.']
        });
      }

      const skillId = await Skill.findByPk(req.params.skill_id);

      if (!skillId) {
        return res.status(404).json({
          errors: ['Esta habilidade não consta nos registros do reino.']
        });
      }

      const userSkill = await UserSkill.findOne({
        where: {
          user_id: userId.id,
          skill_id: skillId.id
        }
      });

      if (!userSkill) {
        return res.status(404).json({
          errors: ['Usuário ou habilidade não encontrados no reino.']
        });
      }

      const nivelUserSkill = req.body.nivel;

      if (nivelUserSkill < 0) {
        return res.status(401).json({
          errors: ['Não é possível diminuir o nível de uma habilidade abaixo de 0.']
        })
      }

      const updatedUserSkill = await userSkill.update({
        nivel: req.body.nivel
      });

      return res.json({
        msg: `O nivel da habilidade do ${userId.role}, ${userId.nome} foi atualizado para ${updatedUserSkill.nivel}.`,
        dados: updatedUserSkill
      });


    } catch (e) {
      return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || ['Ocorreu um erro inesperado.'],
      });
    }
  }
}

export default new UserController();
