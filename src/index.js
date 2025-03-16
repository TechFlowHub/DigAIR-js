const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { ia } = require('./groqIA/groq');

const { QUESTION, RESP_QUESTION_1, RESP_QUESTION_2, RESP_QUESTION_3, RESP_QUESTION_4, RESP_QUESTION_5, RESP_QUESTION_6, RESP_QUESTION_7, RESP_QUESTION_8, RESP_QUESTION_9, RESP_QUESTION_0 } = require('./messages/Questions');
const { OPTION_CONTINUE_ERROR, CONTINUE_MESSAGE, INVALID_MESSAGE, FIRST_MESSAGE, EVALUATION_MESSAGE, EVALUATION_ERROR, EVALUATION_THANKS } = require('./messages/Menus');
const { savePhoneNumber, saveEvaluation, existingPhone } = require('./services/databaseService');

const client = new Client({ authStrategy: new LocalAuth() });
let userStates = {}; 

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    io.emit('qr', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
    io.emit('ready');
});

client.initialize();

client.on('disconnected', (reason) => {
    console.log('Cliente desconectado');
    io.emit('disconnected');

    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
        io.emit('qr', qr);
    });

    client.initialize();
});

onlyNumbers = (string) => {
    return string.replace(/[^0-9]/g, "");
};

const switchMessage = (message, text) => {
    switch (text) {
        case '1': message.reply(RESP_QUESTION_1); break;
        case '2': message.reply(RESP_QUESTION_2); break;
        case '3': message.reply(RESP_QUESTION_3); break;
        case '4': message.reply(RESP_QUESTION_4); break;
        case '5': message.reply(RESP_QUESTION_5); break;
        case '6': message.reply(RESP_QUESTION_6); break;
        case '7': message.reply(RESP_QUESTION_7); break;
        case '8': message.reply(RESP_QUESTION_8); break;
        case '0': message.reply(RESP_QUESTION_0); break;
        default: message.reply(INVALID_MESSAGE);
    }
};

client.on('message', async (message) => {
    let numberPhone = onlyNumbers(message.from);

    if (!userStates[numberPhone]) {
        userStates[numberPhone] = { awaitingResponse: true, awaitingConfirmation: false};

        const phoneExist = await existingPhone(numberPhone);

        if (!phoneExist) {
            await savePhoneNumber(numberPhone);
            console.log(`Novo usuário cadastrado: ${message.notifyName}`);
        }

        message.reply(FIRST_MESSAGE);
        setTimeout(() => {
            message.reply(QUESTION);
        }, 500);
        userStates[numberPhone].awaitingResponse = false;
        return;
    }

    if (userStates[numberPhone].awaitingConfirmation) {
        if (message.body.toLowerCase() === 'sim') {
            userStates[numberPhone].awaitingConfirmation = false;
            setTimeout(() => {
                message.reply(QUESTION);
            }, 1000);
        } else if (message.body.toLowerCase() === 'finalizar' || message.body.toLowerCase() === 'f') {
            userStates[numberPhone].awaitingConfirmation = false;
            message.reply(RESP_QUESTION_0);
            delete userStates[numberPhone];
        } else if (/^[0-8]$/.test(message.body)) {
            switchMessage(message, message.body);
            setTimeout(() => {
                message.reply(CONTINUE_MESSAGE);
            }, 1000);
            return;
        } else {
            message.reply(OPTION_CONTINUE_ERROR);
        }
        return;
    }

    if (message.body.toLowerCase().startsWith('/ia')) {
        console.log("Entrou na IA");
    
        const userMessage = message.body.slice(3).trim();
    
        console.log(userMessage);
        try {
            const reply = await ia(userMessage);
            console.log(reply);
            message.reply(reply);
        } catch (error) {
            console.error("Erro ao processar a IA:", error);
            message.reply("Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.");
        }
    }
    if (/^[0-8]$/.test(message.body)) {
        switchMessage(message, message.body);
        
        if (message.body === '0') {
            delete userStates[numberPhone];
            console.log(message.body);
        }
    } 

    if (message.body.toLowerCase().startsWith === '/ia'){
        message.reply(INVALID_MESSAGE);
    }
    
    userStates[numberPhone].awaitingConfirmation = true;

    setTimeout(() => {
        message.reply(CONTINUE_MESSAGE);
    }, 1000);
    
});
