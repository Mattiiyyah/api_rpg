import Sequelize, { Model } from "sequelize";

export default class UserSkill extends Model {
    static init(sequelize) {
      super.init(
        {
            nivel: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
                validate: {
                    isInt: {
                        msg: 'O nível deve ser um número'
                    },
                    min: {
                        args: [1],
                        msg: 'O nível deve ser pelo menos 1'
                    },
                    max: {
                        args: [100],
                        msg: 'O nível máximo permitido é 100'
                    }
                }
            },
        }, 
        {
            sequelize,
        }
      );

      return this;
    }

    static associate(models) {
        this.belongsTo(models.Skill, { foreignKey: 'skill_id' });
        this.belongsTo(models.User, { foreignKey: 'user_id' });
    }
}