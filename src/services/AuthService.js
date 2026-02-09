import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class AuthService {
    async login(email, password) {
        if (!email || !password) {
            throw { status: 401, errors: ['Favor preencher email e senha'] };
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw { status: 401, errors: ['Usuário não encontrado'] };
        }

        if (!await user.passwordIsValid(password)) {
            throw { status: 401, errors: ['Senha inválida'] };
        }

        const { id, nome, role } = user;

        const token = jwt.sign({ id, email }, process.env.TOKEN_SECRET, {
            expiresIn: process.env.TOKEN_EXPIRATION,
        });

        return { token, user: { id, nome, role } };
    }
}

export default new AuthService();
