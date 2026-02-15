import AuthService from '../services/AuthService.js';

class TokenController {
    async store(req, res) {
        const { email = '', password = '' } = req.body;

        try {
            const data = await AuthService.login(email, password);
            return res.json(data);
        } catch (e) {
            return res.status(e.status || 401).json({
                errors: e.errors?.map(err => typeof err === 'string' ? err : err.message) || ['Credenciais inválidas'],
            });
        }
    }
}

export default new TokenController();