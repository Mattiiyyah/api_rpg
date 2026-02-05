import User from '../models/User.js';
import Artefato from '../models/Artefato.js';
import Skill from '../models/Skill.js';
import UserSkill from '../models/UserSkill.js';
import crypto from 'crypto';
import transporter from '../config/mail.js';

class UserController {

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
        verification_code_expires_at: new Date(Date.now() + 5 * 60 * 1000),
      });

      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: '👑 Bem-vindo ao Reino, Majestade! - Código de Verificação',
        html: `
        <div style="font-family: 'Courier New', monospace; background: #1a1a2e; color: #eee; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #f7d354; margin: 0;">👑 SudoGestor</h1>
            <p style="color: #a8a8b3; margin: 5px 0;">Sistema de Gestão de RPG</p>
          </div>
          
          <div style="background: rgba(247, 211, 84, 0.1); border: 1px solid rgba(247, 211, 84, 0.3); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #f7d354; margin-top: 0; text-align: center;">🏰 Bem-vindo ao Trono!</h2>
            <p style="color: #c4c4cc; line-height: 1.6;">
              Sua Majestade, o reino aguarda seu comando! 
              Para assumir o trono, insira o código de verificação abaixo:
            </p>
          </div>

          <div style="background: #16213e; border: 2px dashed #f7d354; border-radius: 10px; padding: 25px; text-align: center; margin-bottom: 20px;">
            <p style="color: #a8a8b3; margin: 0 0 10px 0; font-size: 14px;">Seu código real de verificação:</p>
            <div style="font-size: 32px; font-weight: bold; color: #f7d354; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${verificationCode}
            </div>
            <p style="color: #ff6b6b; margin: 15px 0 0 0; font-size: 12px;">⏰ Este código expira em 5 minutos</p>
          </div>

          <div style="background: rgba(130, 87, 229, 0.1); border: 1px solid rgba(130, 87, 229, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="color: #8257e5; margin: 0; font-size: 13px; text-align: center;">
              ⚔️ <strong>Próximos passos:</strong> Após verificar sua conta, você poderá 
              recrutar Mestres e Aventureiros para sua guilda!
            </p>
          </div>

          <hr style="border: 1px solid #333; margin: 20px 0;" />
          
          <p style="text-align: center; color: #666; font-size: 12px; margin: 0;">
            🎲 SudoGestor RPG System<br>
            <em>"Todo grande reino começa com um único comando."</em>
          </p>
        </div>
        `,
      });

      return res.json({
        msg: 'Rei cadastrado com sucesso! Verifique seu e-mail.',
        email: user.email
      });

    } catch (e) {
      console.log(e);
      return res.status(400).json({
        errors: e.errors ? e.errors.map((err) => err.message) : ['Erro ao criar usuário'],
      });
    }
  }

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

      if (user.verification_code_expires_at < new Date()) {
        return res.status(401).json({
          errors: ['Código de verificação expirado. Crie uma nova conta.'],
        });
      }

      user.verification_code = null;
      user.verification_code_expires_at = null;
      await user.save();

      return res.json({
        msg: 'Rei verificado com sucesso!',
        user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
      });

    } catch (e) {
      console.log(e);
      return res.status(400).json({
        errors: e.errors ? e.errors.map((err) => err.message) : ['Erro ao verificar usuário'],
      });
    }
  }

  async resendCode(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(401).json({
          errors: ['O email é obrigatório.'],
        });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({
          errors: ['Usuário não encontrado.'],
        });
      }

      if (user.role !== 'KING') {
        return res.status(400).json({
          errors: ['Apenas Reis podem reenviar o código de verificação aqui.'],
        });
      }


      const verificationCode = crypto.randomInt(100000, 999999).toString();

      user.verification_code = verificationCode;
      user.verification_code_expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

      await user.save();

      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: '👑 Seu novo código de verificação - SudoGestor',
        html: `
        <div style="font-family: 'Courier New', monospace; background: #1a1a2e; color: #eee; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #f7d354; margin: 0;">👑 SudoGestor</h1>
            <p style="color: #a8a8b3; margin: 5px 0;">Sistema de Gestão de RPG</p>
          </div>
          
          <div style="background: rgba(247, 211, 84, 0.1); border: 1px solid rgba(247, 211, 84, 0.3); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #f7d354; margin-top: 0; text-align: center;">🔄 Novo Código Solicitado</h2>
            <p style="color: #c4c4cc; line-height: 1.6;">
              Vossa Majestade solicitou um novo código de verificação. 
              Aqui está a chave para acessar o trono:
            </p>
          </div>

          <div style="background: #16213e; border: 2px dashed #f7d354; border-radius: 10px; padding: 25px; text-align: center; margin-bottom: 20px;">
            <p style="color: #a8a8b3; margin: 0 0 10px 0; font-size: 14px;">Seu código real de verificação:</p>
            <div style="font-size: 32px; font-weight: bold; color: #f7d354; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${verificationCode}
            </div>
            <p style="color: #ff6b6b; margin: 15px 0 0 0; font-size: 12px;">⏰ Este código expira em 5 minutos</p>
          </div>

          <p style="text-align: center; color: #666; font-size: 12px; margin: 0;">
            🎲 SudoGestor RPG System<br>
            <em>"O retorno do Rei."</em>
          </p>
        </div>
        `,
      });

      return res.json({
        msg: 'Novo código enviado com sucesso! Verifique seu e-mail.',
        email: user.email
      });

    } catch (e) {
      console.log(e);
      return res.status(400).json({
        errors: e.errors ? e.errors.map((err) => err.message) : ['Erro ao reenviar código'],
      });
    }
  }

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

      if (isMaster && req.body.role === 'MASTER') {
        return res.status(401).json({
          errors: ['Apenas o Rei pode recrutar um novo Mestre.']
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

      let tituloEmail = '';
      let mensagemEmail = '';
      let corTema = '';
      let emoji = '';

      if (req.body.role === 'MASTER') {
        tituloEmail = '🧙 Convocação Real: Você agora é um Mestre!';
        mensagemEmail = 'O Rei reconheceu sua sabedoria e experiência. Você foi nomeado Mestre da Guilda e agora possui poderes para gerenciar aventureiros.';
        corTema = '#9b59b6';
        emoji = '🔮';
      } else {
        tituloEmail = '⚔️ Alistamento Aprovado: Bem-vindo, Aventureiro!';
        mensagemEmail = 'Sua força é necessária nas terras do reino. Pegue sua espada, prepare seus feitiços e junte-se à guilda para grandes aventuras!';
        corTema = '#04d361';
        emoji = '🛡️';
      }

      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: novoUser.email,
        subject: tituloEmail,
        html: `
        <div style="font-family: 'Courier New', monospace; background: #1a1a2e; color: #eee; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #8257e5; margin: 0;">${emoji} SudoGestor</h1>
            <p style="color: #a8a8b3; margin: 5px 0;">Sistema de Gestão de RPG</p>
          </div>
          
          <div style="background: rgba(${req.body.role === 'MASTER' ? '155, 89, 182' : '4, 211, 97'}, 0.1); border: 1px solid ${corTema}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: ${corTema}; margin-top: 0; text-align: center;">${tituloEmail}</h2>
            <p style="color: #c4c4cc; line-height: 1.6; text-align: center;">
              ${mensagemEmail}
            </p>
          </div>

          <div style="background: #16213e; border: 2px dashed ${corTema}; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
            <p style="color: #a8a8b3; margin: 0 0 15px 0; font-size: 14px; text-align: center;">📜 Suas credenciais de acesso ao reino:</p>
            <div style="background: #1a1a2e; border-radius: 8px; padding: 15px;">
              <p style="color: #c4c4cc; margin: 8px 0;">📧 <strong>Login:</strong> <span style="color: ${corTema};">${novoUser.email}</span></p>
              <p style="color: #c4c4cc; margin: 8px 0;">🔑 <strong>Senha:</strong> <span style="color: #ff6b6b; font-family: monospace;">${req.body.password}</span></p>
            </div>
          </div>

          <div style="background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="color: #ff6b6b; margin: 0; font-size: 13px; text-align: center;">
              ⚠️ <strong>Importante:</strong> Altere sua senha através do link de redefinição de senha no login.
            </p>
          </div>

          <hr style="border: 1px solid #333; margin: 20px 0;" />
          
          <p style="text-align: center; color: #666; font-size: 12px; margin: 0;">
            🎲 SudoGestor RPG System<br>
            <em>"Que seus dados sempre rolem 20."</em>
          </p>
        </div>
        `,
      });

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

      if ((isKing && targetIsKing) && !isSelf) {
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

      if (!isMaster && !isKing && !isSelf) {
        return res.status(401).json({
          errors: ['Você não tem permissão para alterar os registros de outros aventureiros.']
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

      const currentRole = user.role;

      const novoDados = await user.update(req.body);

      if (req.body.password) {
        let subject = '🔐 Segurança - Senha Alterada';
        let title = '🔐 Senha Atualizada';
        let message = 'Sua senha de acesso foi modificada recentemente.';
        let footer = 'Se você realizou esta alteração, ignore este aviso.';
        let color = '#f7d354';

        if (!isSelf) {
          subject = '👑 Atualização Real - Senha Modificada';
          title = '👑 Decreto Real: Senha Alterada';
          message = 'Vossa Majestade ou Mestre da Guilda decretou uma nova senha para sua conta.';
          footer = 'Utilize a nova senha fornecida pelo seu superior para acessar o reino.';
          color = '#ff6b6b';
        }

        await transporter.sendMail({
          from: process.env.MAIL_FROM,
          to: user.email,
          subject: subject,
          html: `
            <div style="font-family: 'Courier New', monospace; background: #1a1a2e; color: #eee; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: ${color}; margin: 0;">SudoGestor</h1>
              </div>
              
              <div style="background: rgba(26, 26, 46, 0.5); border: 2px solid ${color}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h2 style="color: ${color}; margin-top: 0; text-align: center; border-bottom: 1px dashed ${color}; padding-bottom: 10px;">${title}</h2>
                <p style="color: #c4c4cc; line-height: 1.6; text-align: center; font-size: 16px;">
                  ${message}
                </p>
              </div>

               <div style="background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <p style="color: #ff6b6b; margin: 0; font-size: 13px; text-align: center;">
                  ⚠️ <strong>Atenção:</strong> ${footer}
                </p>
              </div>

              <p style="text-align: center; color: #666; font-size: 12px; margin: 20px 0 0 0;">
                🎲 SudoGestor RPG System
              </p>
            </div>
            `,
        });
      }

      // Verifica se houve mudança de cargo
      if (novoDados.role !== currentRole) {
        let subject = '';
        let title = '';
        let message = '';
        let color = '';
        let icon = '';

        if (novoDados.role === 'KING') {
          subject = '👑 Ascensão Divina - SudoGestor';
          title = '👑 Longa Vida ao Rei!';
          message = 'Os céus se abriram e o destino o escolheu. Você foi coroado como REI. Governe com sabedoria e justiça.';
          color = '#f7d354';
          icon = '👑';
        } else if (novoDados.role === 'MASTER') {
          subject = '⚔️ Promoção da Guilda - SudoGestor';
          title = '⚔️ Você agora é um Mestre!';
          message = 'Sua habilidade e conhecimento foram reconhecidos. Você foi promovido a Mestre da Guilda. Guie os aventureiros em suas jornadas.';
          color = '#8257e5';
          icon = '⚔️';
        } else {
          subject = '📜 Atualização de Status - SudoGestor';
          title = '🛡️ Retorno às Origens';
          message = 'Seus privilégios especiais foram revogados. Você agora trilha o caminho do Aventureiro novamente.';
          color = '#04d361';
          icon = '🛡️';
        }

        await transporter.sendMail({
          from: process.env.MAIL_FROM,
          to: user.email,
          subject: subject,
          html: `
            <div style="font-family: 'Courier New', monospace; background: #1a1a2e; color: #eee; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: ${color}; margin: 0;">${icon} SudoGestor</h1>
                <p style="color: #a8a8b3; margin: 5px 0;">Sistema de Gestão de RPG</p>
              </div>
              
              <div style="background: rgba(26, 26, 46, 0.5); border: 2px solid ${color}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h2 style="color: ${color}; margin-top: 0; text-align: center; border-bottom: 1px dashed ${color}; padding-bottom: 10px;">${title}</h2>
                <p style="color: #c4c4cc; line-height: 1.6; text-align: center; font-size: 16px;">
                  ${message}
                </p>
              </div>

              <p style="text-align: center; color: #666; font-size: 12px; margin: 20px 0 0 0;">
                🎲 SudoGestor RPG System<br>
                <em>"O destino muda como o rolar dos dados."</em>
              </p>
            </div>
            `,
        });
      }

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

  async passwordRecovery(req, res) {
    try {

      const { email } = req.body;

      if (!email) {
        return res.status(401).json({
          errors: ['O email é obrigatório.']
        })
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          errors: ['Não fui possivel encontrar alguem com este email.']
        })
      }

      const verificationCode = crypto.randomInt(100000, 999999).toString();

      await user.update({
        verification_code: verificationCode,
        verification_code_expires_at: new Date(Date.now() + 5 * 60 * 1000)
      });

      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: '🔑 Recuperação de Senha - SudoGestor',
        html: `
        <div style="font-family: 'Courier New', monospace; background: #1a1a2e; color: #eee; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #8257e5; margin: 0;">🔐 SudoGestor</h1>
            <p style="color: #a8a8b3; margin: 5px 0;">Sistema de Gestão de RPG</p>
          </div>
          
          <div style="background: rgba(130, 87, 229, 0.1); border: 1px solid rgba(130, 87, 229, 0.3); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #8257e5; margin-top: 0; text-align: center;">🗝️ Recuperação de Senha</h2>
            <p style="color: #c4c4cc; line-height: 1.6;">
              Recebemos uma solicitação para redefinir a senha da sua conta. 
              Use o código abaixo para criar uma nova senha:
            </p>
          </div>

          <div style="background: #16213e; border: 2px dashed #8257e5; border-radius: 10px; padding: 25px; text-align: center; margin-bottom: 20px;">
            <p style="color: #a8a8b3; margin: 0 0 10px 0; font-size: 14px;">Seu código mágico de recuperação:</p>
            <div style="font-size: 32px; font-weight: bold; color: #04d361; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${verificationCode}
            </div>
            <p style="color: #ff6b6b; margin: 15px 0 0 0; font-size: 12px;">⏰ Este código expira em 5 minutos</p>
          </div>

          <div style="background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="color: #ff6b6b; margin: 0; font-size: 13px; text-align: center;">
              ⚠️ <strong>Atenção:</strong> Se você não solicitou esta recuperação, ignore este email. 
              Sua conta permanece segura.
            </p>
          </div>

          <hr style="border: 1px solid #333; margin: 20px 0;" />
          
          <p style="text-align: center; color: #666; font-size: 12px; margin: 0;">
            🎲 SudoGestor RPG System<br>
            <em>"Aventuras épicas merecem gestão épica."</em>
          </p>
        </div>
        `,
      });

      return res.json({
        msg: 'Código de recuperação enviado com sucesso.',
        dados: { email: user.email }
      });

    } catch (e) {
      return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || ['Ocorreu um erro inesperado.'],
      });
    }
  }

  async passwordReset(req, res) {
    try {

      const { email, verification_code, newPassword } = req.body;

      if (!email || !verification_code || !newPassword) {
        return res.status(401).json({
          errors: ['Todos os campos são obrigatórios.']
        })
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          errors: ['Não foi possível encontrar alguém com este email.']
        })
      }

      if (user.verification_code !== verification_code) {
        return res.status(400).json({
          errors: ['Código de verificação inválido.']
        })
      }

      if (user.verification_code_expires_at < new Date()) {
        return res.status(401).json({
          errors: ['Código de verificação expirado. Solicite um novo código.']
        })
      }

      user.password = newPassword;
      user.verification_code = null;
      user.verification_code_expires_at = null;

      await user.save();

      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: '🔐 Senha Redefinida com Sucesso - SudoGestor',
        html: `
        <div style="font-family: 'Courier New', monospace; background: #1a1a2e; color: #eee; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #04d361; margin: 0;">🔐 SudoGestor</h1>
          </div>
          
          <div style="background: rgba(4, 211, 97, 0.1); border: 1px solid #04d361; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #04d361; margin-top: 0; text-align: center;">✅ Senha Redefinida</h2>
            <p style="color: #c4c4cc; line-height: 1.6; text-align: center;">
              Sua senha de acesso foi redefinida com sucesso através do processo de recuperação.
            </p>
          </div>

          <p style="text-align: center; color: #666; font-size: 12px; margin: 0;">
            Agora você pode acessar o reino com suas novas credenciais.
          </p>
        </div>
        `,
      });

      return res.json({
        msg: 'Senha redefinida com sucesso.',
        dados: { email: user.email }
      });

    } catch (e) {
      return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || ['Ocorreu um erro inesperado.'],
      });
    }
  }
}

export default new UserController();
