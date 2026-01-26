import dotenv from 'dotenv';
dotenv.config();

import './database/index.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import homeRoutes from './routes/homeRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import userRoutes from './routes/userRoutes.js';
import artefatoRoutes from './routes/artefatoRoutes.js';
import skillRoutes from './routes/skillRoutes.js';

class App {
    constructor() {
        this.app = express();
        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.app.use(cors()); 
        this.app.use(helmet());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
    }

    routes() {
        this.app.use('/', homeRoutes);
        this.app.use('/tokens/', tokenRoutes);
        this.app.use('/users/', userRoutes);
        this.app.use('/artefatos/', artefatoRoutes);
        this.app.use('/skills/', skillRoutes);
    }
}

export default new App().app;