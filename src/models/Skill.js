import Sequelize, { Model } from "sequelize";

export default class Skill extends Model {
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
        dano: {
          type: Sequelize.FLOAT,
          defaultValue: 0,
          validate: {
            isFloat: {
              msg: 'O dano deve ser um número',
            },
            max: {
              args: [99999],
              msg: 'O dano máximo permitido é 99.999'
            },
            min: {
              args: [0],
              msg: 'O dano não pode ser negativo'
            }
          }
        },
        custo_mana: {
          type: Sequelize.FLOAT,
          defaultValue: 0,
          validate: {
            isFloat: {
              msg: 'O custo de mana deve ser um número',
            },
            max: {
              args: [99999],
              msg: 'O custo de mana máximo permitido é 99.999'
            },
            min: {
              args: [0],
              msg: 'O custo de mana não pode ser negativo'
            }
          }
        },
        descricao: {
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
    this.belongsToMany(models.User, {
      foreignKey: 'skill_id',
      through: models.UserSkill,
      as: 'usuarios'
    });
  }
}