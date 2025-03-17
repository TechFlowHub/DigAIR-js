const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { ia } = require('./groqIA/groq');

const { QUESTION, RESP_QUESTION_1, RESP_QUESTION_2, RESP_QUESTION_3, RESP_QUESTION_4, RESP_QUESTION_5, RESP_QUESTION_6, RESP_QUESTION_7, RESP_QUESTION_8 } = require('./messages/Questions');
const { CONTINUE_MESSAGE, INVALID_MESSAGE, FIRST_MESSAGE, FIRST_MESSAGE_REPEAT, EVALUATION_MESSAGE, EVALUATION_ERROR, EVALUATION_THANKS } = require('./messages/Menus');
const { savePhoneNumber, saveEvaluation, existingPhone, saveRepeatOffenderPhone } = require('./services/databaseService');

const client = new Client({ authStrategy: new LocalAuth() });
let userStates = {}; 
let sendFirstMessage = {};

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

const resetTimeout = (numberPhone, message) => {
    if (userStates[numberPhone]?.timeoutId) {
        clearTimeout(userStates[numberPhone].timeoutId);
    }
    userStates[numberPhone].timeoutId = setTimeout(() => {
        message.reply("Atendimento finalizado por inatividade");
        console.log(`Mensagem enviada para ${numberPhone}: "Você está aí?"`);
        delete userStates[numberPhone];
        delete sendFirstMessage[numberPhone]; 
    }, 42000);
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
        default: console.log("entrou no default");
    }
};

client.on('message', async (message) => {
    let numberPhone = onlyNumbers(message.from);

    if (!userStates[numberPhone]) {
        console.log(`Novo usuário detectado: ${message.notifyName} (${numberPhone})`);
        
        userStates[numberPhone] = { awaitingResponse: true, awaitingConfirmation: false, awaitingEndService: false, timeoutId: null };

        const phoneExist = await existingPhone(numberPhone);

        if (!phoneExist) {
            await savePhoneNumber(numberPhone);
            console.log(`Usuário registrado no banco de dados: ${message.notifyName}`);
            await message.reply(FIRST_MESSAGE);
            sendFirstMessage[numberPhone] = true;
        } else {
            await saveRepeatOffenderPhone(numberPhone);
            console.log(`Usuário já existente salvo no novo bd: ${message.notifyName}`);
            await message.reply(FIRST_MESSAGE_REPEAT);
            sendFirstMessage[numberPhone] = false;
        }
        
        console.log("ANTES de enviar QUESTION");

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log("ENVIANDO QUESTION...");
        await message.reply(QUESTION);

        userStates[numberPhone].awaitingResponse = false;

        console.log("Usuário agora não está mais aguardando resposta inicial.");
        
        resetTimeout(numberPhone, message);
        
        return;  
    }

    resetTimeout(numberPhone, message);

    if (userStates[numberPhone].awaitingConfirmation ) {
        if (message.body.toLowerCase() === 'sim') {
            userStates[numberPhone].awaitingConfirmation = false;
            setTimeout(() => {
                message.reply(QUESTION);
            }, 1000);
        }
        else if (message.body.toLowerCase().trim().startsWith('digair')) {
            const userMessage = message.body.slice(3).trim();
            try {
                sendFirstMessage[numberPhone] = false;
                const reply = await ia(userMessage);
                message.reply(reply);
                setTimeout(() => {
                    message.reply(CONTINUE_MESSAGE);
                    console.log("ta vindo do 1° continue message")
                }, 1000);
            } catch (error) {
                message.reply("Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.");
            }
        } else if (message.body.toLowerCase() === 'finalizar' || message.body.toLowerCase() === 'f' || message.body === '0') {
            userStates[numberPhone].awaitingConfirmation = false;
            userStates[numberPhone].awaitingEndService = true;
            message.reply(EVALUATION_MESSAGE);
            return;
        } else if (/^[0-8]$/.test(message.body)) {
            sendFirstMessage[numberPhone] = false;
            switchMessage(message, message.body);
            setTimeout(() => {
                message.reply(CONTINUE_MESSAGE);
                console.log("ta vindo do 2° continue message")
            }, 1000);
            return;
        } else if (!message.body.toLowerCase().trim().startsWith('digair') && sendFirstMessage[numberPhone] === false) {
            message.reply(INVALID_MESSAGE);
            console.log("entrou no invalid message do digair")
        }
        return;
    }

    if (message.body.toLowerCase().trim().startsWith('digair')) {
        const userMessage = message.body.slice(3).trim();
        try {
            sendFirstMessage[numberPhone] = false;
            const reply = await ia(userMessage);
            message.reply(reply);
        } catch (error) {
            message.reply("Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.");
        }
    }
    if (/^[0-8]$/.test(message.body) && userStates[numberPhone].awaitingEndService === false) {
        if (!(message.body === '0')) {
            sendFirstMessage[numberPhone] = false;
            switchMessage(message, message.body);
        }
        if (message.body === '0') {
            userStates[numberPhone].awaitingConfirmation = false;
            userStates[numberPhone].awaitingEndService = true;
            message.reply(EVALUATION_MESSAGE);
            return;
        }
    } 
    if(
        !message.body.toLowerCase().startsWith('digair') && 
        !(/^[0-8]$/.test(message.body)) &&
        sendFirstMessage[numberPhone] === false)
        
    {
        console.log("entrou no final")
        message.reply(INVALID_MESSAGE);
    }

    if (userStates[numberPhone].awaitingEndService === true) {
        if (/^[1-5]$/.test(message.body)) {
            await saveEvaluation(numberPhone, message.body);
            message.reply(EVALUATION_THANKS);
            delete userStates[numberPhone];
            delete sendFirstMessage[numberPhone];
            return;
        } else {
            message.reply(EVALUATION_ERROR);
            return;
        }
    }

    userStates[numberPhone].awaitingConfirmation = true;

    if(sendFirstMessage[numberPhone] === false)
    setTimeout(() => {
        message.reply(CONTINUE_MESSAGE);
        console.log("ta vindo do terceiro continue message")
    }, 1000);
});