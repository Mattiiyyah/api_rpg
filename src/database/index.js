import Sequelize from "sequelize";
import databaseConfig from "../config/database.cjs";
import User from "../models/User.js";
import Artefato from "../models/Artefato.js"; 
import Skill from "../models/Skill.js";
import UserSkill from "../models/UserSkill.js";

const models = [User, Artefato, Skill, UserSkill]; 

const connection = new Sequelize(databaseConfig);

models.forEach(model => model.init(connection));
models.forEach(model =>
    model.associate && model.associate(connection.models)
);