const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('chatbot_favip', 'root', '', {
    host: 'localhost', // Se der erro utiliza o ip do banco de dados
    dialect: 'mysql',
    logging: false, // Remove logs do console (opcional)
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
    }
}

testConnection();

module.exports = sequelize;
