const Phone = require('../models/Phone');
const Evaluation = require('../models/Evaluation');
const RepeatOffenderPhone = require('../models/RepeatOffenderPhone');

// Salvar número de telefone no banco
async function savePhoneNumber(phone) {
    try {
        const [user, created] = await Phone.findOrCreate({
            where: { phone }
        });

        if (created) {
            console.log(`Novo usuário cadastrado: ${phone}`);
        } else {
            console.log(`Usuário já existente: ${phone}`);
        }

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

        console.log(phone)

        const repeat_offender_phone = await RepeatOffenderPhone.create({ fk_phone: user.id });
        console.log(`Número de telefone ${phone} salvo como reincidente`);
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
        console.log(`Avaliação ${rating} salva para ${phone}`);
        return evaluation;
    } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
    }
}

module.exports = { savePhoneNumber, saveEvaluation, existingPhone, saveRepeatOffenderPhone };
