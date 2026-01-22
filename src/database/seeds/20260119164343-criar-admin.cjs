const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    await queryInterface.bulkInsert('users', 
        [
          {
            nome: 'Admin-Matheus',
            email: 'matheus@gmail.com',
            password_hash: await bcrypt.hash('123456', 8),
            role: 'KING',
            created_at: new Date(),
            updated_at: new Date(),
          }
        ], 
       
       {},
      );
    
  },

  async down (queryInterface) {},
};