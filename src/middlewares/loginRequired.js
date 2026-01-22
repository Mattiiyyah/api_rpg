import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async (req, res, next) => {
    const { authorization } = req.headers;
    
    if (!authorization) {
        return res.status(401).json({ errors: ['Identifique-se, viajante! (Login necessário)'] });
    }

    const [, token ] = authorization.split(' ');

    try {
        const dados = jwt.verify(token, process.env.TOKEN_SECRET);
        const { id, email } = dados;

        const user = await User.findOne({ where: { id, email } });

        if(!user) {
            return res.status(401).json({ errors: ['Aventureiro não encontrado.'] });
        }

        req.userId = id;
        req.userEmail = email;
        req.userRole = user.role;

        return next();
    } 
    catch(e) {
       return res.status(401).json({ errors: ['Token expirado ou inválido, viajante!'] }); 
    }
}