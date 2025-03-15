const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('digair_db', 'root', 'sua_senha', {
    host: 'localhost',
    dialect: 'mysql'
});

sequelize.authenticate()
    .then(() => console.log('✅ Conectado ao banco de dados!'))
    .catch(err => console.error('❌ Erro ao conectar:', err));

module.exports = sequelize;
