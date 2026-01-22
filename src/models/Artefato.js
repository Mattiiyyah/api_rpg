import Sequelize, { Model } from "sequelize";

export default class Artefato extends Model {
    static init(sequelize) {
        super.init(
          {
            nome: {
              type: Sequelize.STRING,
              defaultValue: '',
              validate: {
                len: {
                  args: [3, 255],
                  msg: 'O nome do artefato deve ter entre 3 e 255 caracteres'
                }
              }
            },
            poder: { 
                type: Sequelize.FLOAT,
                defaultValue: 0,
                validate: {
                    isFloat: {
                        msg: 'O poder deve ser um número'
                    },
                    max: {
                        args: [99999],
                        msg: 'O poder máximo permitido é 99.999'
                    }
                }
            },
            tipo: { 
                type: Sequelize.STRING,
                defaultValue: '',
                validate: {
                    len: {
                        args: [3, 255],
                        msg: 'O tipo deve ter entre 3 e 255 caracteres'
                    }
                }
            },
            lore: { 
                type: Sequelize.TEXT,
                defaultValue: '',
            },
          }, 
          {
            sequelize,
          }
        );
        return this;
    }

    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id' });
    }
}