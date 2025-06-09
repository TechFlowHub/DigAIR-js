const Phone = require('../models/Phone');
const Evaluation = require('../models/Evaluation');
const RepeatOffenderPhone = require('../models/RepeatOffenderPhone');
const Frequency = require('../models/Frequency');
const { Op } = require('sequelize');

// Salvar número de telefone no banco
async function savePhoneNumber(phone) {
    try {
        const [user, created] = await Phone.findOrCreate({
            where: { phone }
        });

        return user;
    } catch (error) {
        console.error('Erro ao salvar número:', error);
    }
}

// Verificar se o número já existe no banco
async function existingPhone(phone) {
    try {
        return !!(await Phone.findOne({ where: { phone } }));
    } catch (error) {
        console.error('Erro ao buscar número:', error);
        return false;
    }
}

// Salvar número de telefone reincidente
async function saveRepeatOffenderPhone(phone) {
    try {
        const user = await Phone.findOne({ where: { phone } });

        if (!user) {
            console.error('Número não encontrado');
            return null;
        }

        const repeat_offender_phone = await RepeatOffenderPhone.create({ fk_phone: user.id });

        return repeat_offender_phone;
    } catch (error) {
        console.error('Erro ao salvar número:', error);
    }
}

// Salvar avaliação
async function saveEvaluation(phone, rating) {
    try {
        const user = await Phone.findOne({ where: { phone } });

        if (!user) {
            console.error('Número não encontrado');
            return null;
        }

        const evaluation = await Evaluation.create({ fk_phone: user.id, rating });

        return evaluation;
    } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
    }
}

// Salvar frequência de interações
async function saveFrequency(phone) {
    try {
        const user = await Phone.findOne({ where: { phone } });

        if (!user) {
            console.error('Número não encontrado para rastrear frequência');
            return null;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        const existingFrequency = await Frequency.findOne({ 
            where: { 
                fk_phone: user.id,
                created_at: {
                    [Op.gte]: today 
                }
            } 
        });

        if (existingFrequency) {
            existingFrequency.interations += 1;
            await existingFrequency.save();
            console.log(`Frequência atualizada para ${phone}: ${existingFrequency.interations} interações hoje`);
            return existingFrequency;
        } else {
            const newFrequency = await Frequency.create({ 
                fk_phone: user.id,
                interations: 1,
                created_at: new Date() 
            });
            console.log(`Nova entrada de frequência criada para ${phone}`);
            return newFrequency;
        }
    } catch (error) {
        console.error('Erro ao atualizar frequência:', error);
    }
}

module.exports = { savePhoneNumber, saveEvaluation, existingPhone, saveRepeatOffenderPhone, saveFrequency };