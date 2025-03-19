const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { ia } = require('./groqIA/groq');

const { QUESTION, RESP_QUESTION_1, RESP_QUESTION_2, RESP_QUESTION_3, RESP_QUESTION_4, RESP_QUESTION_5, RESP_QUESTION_6, RESP_QUESTION_7, RESP_QUESTION_8 } = require('./messages/Questions');
const { CONTINUE_MESSAGE, INVALID_MESSAGE, FIRST_MESSAGE, FIRST_MESSAGE_REPEAT, EVALUATION_MESSAGE, EVALUATION_ERROR, EVALUATION_THANKS } = require('./messages/Menus');
const { savePhoneNumber, saveEvaluation, existingPhone, saveRepeatOffenderPhone } = require('./services/databaseService');

const client = new Client({ 
    authStrategy: new LocalAuth(), 
    puppeteer: { 
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let userStates = {}; 
let sendFirstMessage = {};

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    io.emit('qr', qr);
});

client.on('ready', () => {
    console.log('✅ Client is ready!');
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
        message.reply("⚠️ Opa! Não recebemos sua resposta há um tempo... O atendimento foi finalizado por inatividade. ⏳ Caso precise de algo, é só chamar! 😊");

        delete userStates[numberPhone];
        delete sendFirstMessage[numberPhone]; 
    }, 480000);
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
        userStates[numberPhone] = { awaitingResponse: true, awaitingConfirmation: false, awaitingEndService: false, timeoutId: null };

        const phoneExist = await existingPhone(numberPhone);

        if (!phoneExist) {
            await savePhoneNumber(numberPhone);
            await message.reply(FIRST_MESSAGE);
            sendFirstMessage[numberPhone] = true;
        } else {
            await saveRepeatOffenderPhone(numberPhone);
            await message.reply(FIRST_MESSAGE_REPEAT);
            sendFirstMessage[numberPhone] = false;
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        await message.reply(QUESTION);

        userStates[numberPhone].awaitingResponse = false;
        
        resetTimeout(numberPhone, message);
        
        return;  
    }

    resetTimeout(numberPhone, message);

    if (userStates[numberPhone].awaitingConfirmation ) {
        if (message.body.toLowerCase() === 'sim' || message.body.toLowerCase() === 's') {
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
                setTimeout(async () => {
                    await message.reply(CONTINUE_MESSAGE);
                }, 1000);
            } catch (error) {
                setTimeout(() => {
                    message.reply("Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.");
                }, 1000);
            }
        } else if (message.body.toLowerCase() === 'finalizar' || message.body.toLowerCase() === 'f' || message.body === '0') {
            userStates[numberPhone].awaitingConfirmation = false;
            userStates[numberPhone].awaitingEndService = true;

            setTimeout(() => {
                message.reply(EVALUATION_MESSAGE);
            }, 1000);

            return;
        } else if (/^[0-8]$/.test(message.body)) {
            sendFirstMessage[numberPhone] = false;
            setTimeout(() => {
                switchMessage(message, message.body);
            }, 1000);
            
            setTimeout(() => {
                message.reply(CONTINUE_MESSAGE);
            }, 1000);
            
            return;
        } else if (!message.body.toLowerCase().trim().startsWith('digair') && sendFirstMessage[numberPhone] === false) {
            setTimeout(() => {
                message.reply(INVALID_MESSAGE);
            }, 1000);
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
            setTimeout(() => {
                message.reply("Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.");
            }, 1000);
        }
    }
    if (/^[0-8]$/.test(message.body) && userStates[numberPhone].awaitingEndService === false) {
        if (!(message.body === '0')) {
            sendFirstMessage[numberPhone] = false;
            setTimeout(() => {
                switchMessage(message, message.body);
            }, 1000);    
        }
        if (message.body === '0') {
            userStates[numberPhone].awaitingConfirmation = false;
            userStates[numberPhone].awaitingEndService = true;
            
            setTimeout(() => {
                message.reply(EVALUATION_MESSAGE);
            }, 1000);

            return;
        }
    } 
    if (
        !message.body.toLowerCase().startsWith('digair') && 
        !(/^[0-8]$/.test(message.body)) &&
        sendFirstMessage[numberPhone] === false && 
        userStates[numberPhone].awaitingEndService === false)
        
    {
        setTimeout(() => {
            message.reply(INVALID_MESSAGE);
        }, 1000);
    }

    if (userStates[numberPhone].awaitingEndService === true) {
        if (/^[1-5]$/.test(message.body)) {
            await saveEvaluation(numberPhone, message.body);

            if (userStates[numberPhone]?.timeoutId) {
                clearTimeout(userStates[numberPhone].timeoutId);
            }
            setTimeout(() => {
                message.reply(EVALUATION_THANKS);
            }, 1000);
            delete userStates[numberPhone];
            delete sendFirstMessage[numberPhone];
            return;
        } else {
            setTimeout(() => {
                message.reply(EVALUATION_ERROR);
            }, 1000);
            return;
        }
    }

    userStates[numberPhone].awaitingConfirmation = true;

    if(sendFirstMessage[numberPhone] === false)
    setTimeout(() => {
        message.reply(CONTINUE_MESSAGE);
    }, 1000);
});