const sequelize = require('../config/database');
const Phone = require('../models/Phone');
const Evaluation = require('../models/Evaluation');
const RepeatOffenderPhone = require('../models/RepeatOffenderPhone');

async function syncDatabase() {
    try {
        await sequelize.sync({ alter: true });
        console.log('Tabelas sincronizadas com sucesso!');
    } catch (error) {
        console.error('Erro ao sincronizar tabelas:', error);
    } finally {
        await sequelize.close();
    }
}

syncDatabase();
