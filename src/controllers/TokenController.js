import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class TokenController {
    async store(req, res) {
        const { email = '', password = '' } = req.body;

        if (!email || !password) {
            return res.status(401).json({
                errors: ['Favor preencher email e senha'],
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({
                errors: ['Usuário não encontrado'],
            });
        }

        if (!await user.passwordIsValid(password)) {
            return res.status(401).json({
                errors: ['Senha inválida'],
            });
        }

        const { id, nome, role } = user;

        const token = jwt.sign({ id, email }, process.env.TOKEN_SECRET, {
            expiresIn: process.env.TOKEN_EXPIRATION,
        });

        return res.json({ token, user: { id, nome, role } });

    }
}

export default new TokenController();