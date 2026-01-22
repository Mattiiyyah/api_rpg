/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.createTable('artefatos', { 
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          nome: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          poder: {
            type: Sequelize.FLOAT,
            allowNull: false
          },
          tipo: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          lore: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          user_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'users',
              key: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
          },
        });
  },

  async down (queryInterface) {
     await queryInterface.dropTable('artefatos');
  }
};