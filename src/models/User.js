import Sequelize, { Model } from "sequelize";
import bcrypt from 'bcryptjs';

export default class User extends Model {
    static init(sequelize) {
        super.init(
            {
                nome: {
                    type: Sequelize.STRING,
                    defaultValue: '',
                    validate: {
                        len: {
                            args: [3, 255],
                            msg: 'Campo nome deve ter entre 3 e 255 caracteres'
                        }
                    }
                },

                email: {
                    type: Sequelize.STRING,
                    defaultValue: '',
                    validate: {
                        isEmail: {
                            msg: 'Email inválido'
                        }
                    }
                },

                role: {
                    type: Sequelize.STRING,
                    defaultValue: 'ADVENTURER',
                },

                password_hash: {
                    type: Sequelize.STRING,
                    defaultValue: '',
                },

                password: {
                    type: Sequelize.VIRTUAL,
                    defaultValue: '',
                    validate: {
                        len: {
                            args: [6, 255],
                            msg: 'Campo senha deve ter entre 6 e 255 caracteres'
                        }
                    }
                },

            },

            {
                sequelize,
            }
        );

        this.addHook('beforeSave', async (user) => {
            if (user.password) {
                user.password_hash = await bcrypt.hash(user.password, 8);
            }
        });

        return this;
    }

    passwordIsValid(password) {
        return bcrypt.compare(password, this.password_hash);
    }

    static associate(models) {
        this.hasMany(models.Artefato, { foreignKey: 'user_id' });

        this.belongsToMany(models.Skill, {
            foreignKey: 'user_id',    
            through: models.UserSkill, 
            as: 'skills'
        });
    }
}