import User from '../models/User.js';
import crypto from 'crypto';
import transporter from '../config/mail.js';

class UserService {
    async createUser(data) {
        const { nome, email, password, role } = data;

        // Validação básica
        if (!nome || !email || !password) {
            throw { status: 400, errors: ['Todos os campos são obrigatórios.'] };
        }

        // Regras específicas para Reis (Registro inicial)
        if (role === 'KING') {
            const verificationCode = crypto.randomInt(100000, 999999).toString();
            const user = await User.create({
                nome,
                email,
                password,
                role: 'KING',
                verification_code: verificationCode,
                verification_code_expires_at: new Date(Date.now() + 5 * 60 * 1000),
            });

            await this.sendKingWelcomeEmail(user, verificationCode);
            return user;
        }

        // Para outros usuários, usamos o fluxo de recrutamento (store)
        // Mas se for um registro comum (se existir no futuro):
        const user = await User.create(data);
        return user;
    }

    async recruitUser(requesterRole, data) {
        const isKing = requesterRole === 'KING';
        const isMaster = requesterRole === 'MASTER';

        if (!isMaster && !isKing) {
            throw { status: 401, errors: ['Apenas o Mestre da Guilda (Admin) pode recrutar novos aventureiros.'] };
        }

        if (!isKing && data.role === 'KING') {
            throw { status: 401, errors: ['Apenas o Rei pode recrutar um novo Rei.'] };
        }

        if (isMaster && data.role === 'MASTER') {
            throw { status: 401, errors: ['Apenas o Rei pode recrutar um novo Mestre.'] };
        }

        const totalUsers = await User.count();
        if (totalUsers >= 9) {
            throw { status: 401, errors: ['O reino já atingiu seu limite de aventureiros.'] };
        }

        const newUser = await User.create(data);
        await this.sendRecruitmentEmail(newUser, data.password, data.role);

        return newUser;
    }

    async sendKingWelcomeEmail(user, code) {
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
              ${code}
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
    }

    async sendKingResendCodeEmail(user, code) {
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
              ${code}
            </div>
            <p style="color: #ff6b6b; margin: 15px 0 0 0; font-size: 12px;">⏰ Este código expira em 5 minutos</p>
          </div>

          <hr style="border: 1px solid #333; margin: 20px 0;" />
          
          <p style="text-align: center; color: #666; font-size: 12px; margin: 0;">
            🎲 SudoGestor RPG System<br>
            <em>"O retorno do Rei."</em>
          </p>
        </div>
        `,
        });
    }

    async sendRecruitmentEmail(user, password, role) {
        let tituloEmail = '';
        let mensagemEmail = '';
        let corTema = '';
        let emoji = '';

        if (role === 'MASTER') {
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
            to: user.email,
            subject: tituloEmail,
            html: `
        <div style="font-family: 'Courier New', monospace; background: #1a1a2e; color: #eee; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #8257e5; margin: 0;">${emoji} SudoGestor</h1>
            <p style="color: #a8a8b3; margin: 5px 0;">Sistema de Gestão de RPG</p>
          </div>
          
          <div style="background: rgba(${role === 'MASTER' ? '155, 89, 182' : '4, 211, 97'}, 0.1); border: 1px solid ${corTema}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: ${corTema}; margin-top: 0; text-align: center;">${tituloEmail}</h2>
            <p style="color: #c4c4cc; line-height: 1.6; text-align: center;">
              ${mensagemEmail}
            </p>
          </div>

          <div style="background: #16213e; border: 2px dashed ${corTema}; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
            <p style="color: #a8a8b3; margin: 0 0 15px 0; font-size: 14px; text-align: center;">📜 Suas credenciais de acesso ao reino:</p>
            <div style="background: #1a1a2e; border-radius: 8px; padding: 15px;">
              <p style="color: #c4c4cc; margin: 8px 0;">📧 <strong>Login:</strong> <span style="color: ${corTema};">${user.email}</span></p>
              <p style="color: #c4c4cc; margin: 8px 0;">🔑 <strong>Senha:</strong> <span style="color: #ff6b6b; font-family: monospace;">${password}</span></p>
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
    }
    async verifyKing(data) {
        const { email, verification_code } = data;

        if (!email || !verification_code) {
            throw { status: 401, errors: ['Email e código de verificação são obrigatórios.'] };
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw { status: 404, errors: ['Usuário não encontrado.'] };
        }

        if (user.verification_code !== verification_code) {
            throw { status: 401, errors: ['Código de verificação inválido.'] };
        }

        if (user.verification_code_expires_at < new Date()) {
            throw { status: 401, errors: ['Código de verificação expirado. Crie uma nova conta.'] };
        }

        user.verification_code = null;
        user.verification_code_expires_at = null;
        await user.save();

        return user;
    }

    async resendCode(email) {
        if (!email) {
            throw { status: 401, errors: ['O email é obrigatório.'] };
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw { status: 404, errors: ['Usuário não encontrado.'] };
        }

        if (user.role !== 'KING') {
            throw { status: 400, errors: ['Apenas Reis podem reenviar o código de verificação aqui.'] };
        }

        const verificationCode = crypto.randomInt(100000, 999999).toString();

        user.verification_code = verificationCode;
        user.verification_code_expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

        await user.save();

        await this.sendKingResendCodeEmail(user, verificationCode);
        return user;
    }

    async updateUser(requesterRole, requesterId, targetId, data) {
        const isKing = requesterRole === 'KING';
        const isMaster = requesterRole === 'MASTER';
        const userId = requesterId;

        const user = await User.findByPk(targetId);

        if (!user) {
            throw { status: 404, errors: ['Esta alma não consta nos registros do reino.'] };
        }

        const targetIsKing = user.role === 'KING';
        const targetIsMaster = user.role === 'MASTER';
        const isSelf = Number(targetId) === userId;

        if ((isKing && targetIsKing) && !isSelf) {
            throw { status: 401, errors: ['O Rei não pode alterar os registros de outro Rei.'] };
        }

        if (targetIsKing && !isSelf) {
            throw { status: 401, errors: ['A Coroa é intocável! Meros mortais não podem alterar os registros do Rei.'] };
        }

        if (isMaster && targetIsMaster && !isSelf) {
            throw { status: 401, errors: ['Um Mestre não pode interferir nos assuntos de outro Mestre.'] };
        }

        if (!isMaster && !isKing && !isSelf) {
            throw { status: 401, errors: ['Você não tem permissão para alterar os registros de outros aventureiros.'] };
        }

        if (targetIsKing && data.role && data.role !== 'KING') {
            throw { status: 401, errors: ['O Trono é eterno. O Rei não pode abdicar ou ser rebaixado.'] };
        }

        if (data.role === 'KING' && !isKing) {
            throw { status: 401, errors: ['Apenas o destino divino pode coroar um novo Rei.'] };
        }

        if (!isKing) {
            delete data.role;
        }

        const currentRole = user.role;
        const novoDados = await user.update(data);

        // Envia emails (lógica movida do controller)
        if (data.password) {
            await this.sendPasswordChangeEmail(user, isSelf);
        }

        if (novoDados.role !== currentRole) {
            await this.sendRoleChangeEmail(user, novoDados.role);
        }

        return novoDados;
    }

    async deleteUser(requesterRole, requesterId, targetId) {
        const isKing = requesterRole === 'KING';
        const isMaster = requesterRole === 'MASTER';
        const userId = requesterId;

        const user = await User.findByPk(targetId);

        if (!user) {
            throw { status: 404, errors: ['Esta alma não consta nos registros do reino.'] };
        }

        const targetIsKing = user.role === 'KING';
        const targetIsMaster = user.role === 'MASTER';
        const isSelf = Number(targetId) === userId;

        if ((isKing && targetIsKing) && (isSelf || !isSelf)) {
            throw { status: 401, errors: ['A coroa é eterna. O Rei não pode ser apagado.'] };
        }

        if (targetIsKing) {
            throw { status: 401, errors: ['TOLO! Você não pode apagar a existência daquele que criou o Universo. O Rei é Imortal.'] };
        }

        if (!isMaster && !isKing) {
            throw { status: 401, errors: ['Aventureiros não têm poder para exilar almas do reino. Procure um Mestre.'] };
        }

        if (isMaster && targetIsMaster) {
            const errorMsg = isSelf
                ? 'Você não pode apagar a si mesmo, somente o Rei pode fazer isso.'
                : 'Sua autoridade não funciona contra um igual (Outro Mestre).';
            throw { status: 401, errors: [errorMsg] };
        }

        await user.destroy();
        return user;
    }

    async sendPasswordChangeEmail(user, isSelf) {
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

    async sendRoleChangeEmail(user, newRole) {
        let subject = '';
        let title = '';
        let message = '';
        let color = '';
        let icon = '';

        if (newRole === 'KING') {
            subject = '👑 Ascensão Divina - SudoGestor';
            title = '👑 Longa Vida ao Rei!';
            message = 'Os céus se abriram e o destino o escolheu. Você foi coroado como REI. Governe com sabedoria e justiça.';
            color = '#f7d354';
            icon = '👑';
        } else if (newRole === 'MASTER') {
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

    async updateUserSkill(requesterRole, requesterId, targetUserId, skillId, newLevel) {
        const isKing = requesterRole === 'KING';

        if (!isKing) {
            throw { status: 401, errors: ['Somente o Rei pode modificar as habilidades dos aventureiros.'] };
        }

        const userId = await User.findByPk(targetUserId);

        if (!userId) {
            throw { status: 404, errors: ['Esta alma não consta nos registros do reino.'] };
        }

        if (userId.role === 'KING' && userId.id !== requesterId) {
            throw { status: 401, errors: ['Um Rei não pode alterar o nível das habilidades de outro Rei.'] };
        }

        const skill = await Skill.findByPk(skillId);

        if (!skill) {
            throw { status: 404, errors: ['Esta habilidade não consta nos registros do reino.'] };
        }

        const userSkill = await UserSkill.findOne({
            where: {
                user_id: userId.id,
                skill_id: skill.id
            }
        });

        if (!userSkill) {
            throw { status: 404, errors: ['Usuário ou habilidade não encontrados no reino.'] };
        }

        if (newLevel < 0) {
            throw { status: 401, errors: ['Não é possível diminuir o nível de uma habilidade abaixo de 0.'] };
        }

        const updatedUserSkill = await userSkill.update({
            nivel: newLevel
        });

        return { user: userId, updatedUserSkill };
    }

    async recoverPassword(email) {
        if (!email) {
            throw { status: 401, errors: ['O email é obrigatório.'] };
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw { status: 401, errors: ['Não fui possivel encontrar alguem com este email.'] };
        }

        const verificationCode = crypto.randomInt(100000, 999999).toString();

        await user.update({
            verification_code: verificationCode,
            verification_code_expires_at: new Date(Date.now() + 5 * 60 * 1000)
        });

        await this.sendPasswordRecoveryEmail(user, verificationCode);
        return { email: user.email };
    }

    async resetPassword(email, verificationCode, newPassword) {
        if (!email || !verificationCode || !newPassword) {
            throw { status: 401, errors: ['Todos os campos são obrigatórios.'] };
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw { status: 401, errors: ['Não foi possível encontrar alguém com este email.'] };
        }

        if (user.verification_code !== verificationCode) {
            throw { status: 400, errors: ['Código de verificação inválido.'] };
        }

        if (user.verification_code_expires_at < new Date()) {
            throw { status: 401, errors: ['Código de verificação expirado. Solicite um novo código.'] };
        }

        user.password = newPassword;
        user.verification_code = null;
        user.verification_code_expires_at = null;

        await user.save();

        await this.sendPasswordResetSuccessEmail(user);
        return { email: user.email };
    }

    async sendPasswordRecoveryEmail(user, code) {
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
                  ${code}
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
    }

    async sendPasswordResetSuccessEmail(user) {
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
    }
}

export default new UserService();
