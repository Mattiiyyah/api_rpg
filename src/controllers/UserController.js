import User from '../models/User.js';
import Artefato from '../models/Artefato.js';
import Skill from '../models/Skill.js';
import UserService from '../services/UserService.js';

class UserController {

  async registerKing(req, res) {
    try {
      const user = await UserService.createUser({ ...req.body, role: 'KING' });

      return res.json({
        msg: 'Rei cadastrado com sucesso! Verifique seu e-mail.',
        email: user.email
      });

    } catch (e) {
      console.log(e);
      return res.status(e.status || 400).json({
        errors: e.errors || ['Erro ao criar usuário'],
      });
    }
  }

  async verifyKing(req, res) {
    try {
      const user = await UserService.verifyKing(req.body);

      return res.json({
        msg: 'Rei verificado com sucesso!',
        user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
      });

    } catch (e) {
      console.log(e);
      return res.status(e.status || 400).json({
        errors: e.errors || ['Erro ao verificar usuário'],
      });
    }
  }

  async resendCode(req, res) {
    try {
      const user = await UserService.resendCode(req.body.email);

      return res.json({
        msg: 'Novo código enviado com sucesso! Verifique seu e-mail.',
        email: user.email
      });

    } catch (e) {
      console.log(e);
      return res.status(e.status || 400).json({
        errors: e.errors || ['Erro ao reenviar código'],
      });
    }
  }

  async store(req, res) {
    try {
      const user = await UserService.recruitUser(req.userRole, req.userId, req.body);

      let mensagemFinal = "";
      if (user.role === 'KING') {
        mensagemFinal = `Um novo Rei ${user.nome} ascendeu ao trono.`;
      } else if (user.role === 'MASTER') {
        mensagemFinal = `Novo Mestre ${user.nome} foi recrutado na Guilda.`;
      } else {
        mensagemFinal = `Novo aventureiro ${user.nome} foi recrutado na Guilda.`;
      }

      return res.json({
        msg: mensagemFinal,
        adventurer: { id: user.id, nome: user.nome, email: user.email, role: user.role }
      });

    } catch (e) {
      return res.status(e.status || 400).json({
        errors: e.errors || ['Erro ao recrutar usuário'],
      });
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

  async update(req, res) {
    try {
      const novoDados = await UserService.updateUser(req.userRole, req.userId, req.params.id, req.body);
      const { id, nome, email, role } = novoDados;

      let mensagemFinal = "";

      if (novoDados.role === 'KING') {
        mensagemFinal = `Os decretos reais de ${novoDados.nome} foram atualizados.`;
      } else if (novoDados.role === 'MASTER') {
        mensagemFinal = `Os registros do Mestre ${novoDados.nome} foram modificados com sucesso.`;
      } else {
        mensagemFinal = `A ficha do aventureiro ${novoDados.nome} foi atualizada.`;
      }

      return res.json({
        msg: mensagemFinal,
        dados: { id, nome, email, role },
      });

    } catch (e) {
      return res.status(e.status || 400).json({
        errors: e.errors || ['Ocorreu um erro inesperado.'],
      });
    }
  }

  async delete(req, res) {
    try {
      const user = await UserService.deleteUser(req.userRole, req.userId, req.params.id);

      return res.json({ msg: `O nome de ${user.nome} foi riscado do Livro da Vida. Que sua alma encontre paz no Vazio Digital.` });

    } catch (e) {
      return res.status(e.status || 400).json({
        errors: e.errors || ['Ocorreu um erro inesperado.'],
      });
    }
  }

  async updateSkill(req, res) {
    try {
      const { user, updatedUserSkill } = await UserService.updateUserSkill(req.userRole, req.userId, req.params.user_id, req.params.skill_id, req.body.nivel);

      return res.json({
        msg: `O nivel da habilidade do ${user.role}, ${user.nome} foi atualizado para ${updatedUserSkill.nivel}.`,
        dados: updatedUserSkill
      });

    } catch (e) {
      return res.status(e.status || 400).json({
        errors: e.errors || ['Ocorreu um erro inesperado.'],
      });
    }
  }

  async passwordRecovery(req, res) {
    try {
      const result = await UserService.recoverPassword(req.body.email);

      return res.json({
        msg: 'Código de recuperação enviado com sucesso.',
        dados: result
      });

    } catch (e) {
      return res.status(e.status || 400).json({
        errors: e.errors || ['Ocorreu um erro inesperado.'],
      });
    }
  }

  async passwordReset(req, res) {
    try {
      const { email, verification_code, newPassword } = req.body;
      const result = await UserService.resetPassword(email, verification_code, newPassword);

      return res.json({
        msg: 'Senha redefinida com sucesso.',
        dados: result
      });

    } catch (e) {
      return res.status(e.status || 400).json({
        errors: e.errors || ['Ocorreu um erro inesperado.'],
      });
    }
  }
}

export default new UserController();
