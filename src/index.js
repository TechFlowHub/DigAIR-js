const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { ia } = require('./groqIA/groq');

const { QUESTION, RESP_QUESTION_1, RESP_QUESTION_2, RESP_QUESTION_3, RESP_QUESTION_4, RESP_QUESTION_5, RESP_QUESTION_6, RESP_QUESTION_7, RESP_QUESTION_8 } = require('./messages/Questions');
const { CONTINUE_MESSAGE, INVALID_MESSAGE, FIRST_MESSAGE, FIRST_MESSAGE_REPEAT, EVALUATION_MESSAGE, EVALUATION_ERROR, EVALUATION_THANKS } = require('./messages/Menus');
const { savePhoneNumber, saveEvaluation, existingPhone, saveRepeatOffenderPhone } = require('./services/databaseService');

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
        default: message.reply(INVALID_MESSAGE);
    }
};

client.on('message', async (message) => {
    let numberPhone = onlyNumbers(message.from);

    if (!userStates[numberPhone]) {
        console.log(`Novo usuário detectado: ${message.notifyName} (${numberPhone})`);
        
        userStates[numberPhone] = { awaitingResponse: true, awaitingConfirmation: false, awaitingEndService: false };

        const phoneExist = await existingPhone(numberPhone);

        if (!phoneExist) {
            await savePhoneNumber(numberPhone);
            console.log(`Usuário registrado no banco de dados: ${message.notifyName}`);
            await message.reply(FIRST_MESSAGE);  
        } else {
            await saveRepeatOffenderPhone(numberPhone);
            console.log(`Usuário já existente salvo no novo bd: ${message.notifyName}`);
            await message.reply(FIRST_MESSAGE_REPEAT);  
        }
        
        console.log("ANTES de enviar QUESTION");

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log("ENVIANDO QUESTION...");
        await message.reply(QUESTION);

        userStates[numberPhone].awaitingResponse = false;

        console.log("Usuário agora não está mais aguardando resposta inicial.");
        
        return;  
    }

    if (userStates[numberPhone].awaitingConfirmation ) {
        if (message.body.toLowerCase() === 'sim') {
            userStates[numberPhone].awaitingConfirmation = false;
            setTimeout(() => {
                message.reply(QUESTION);
            }, 1000);
        
        }
        else if (message.body.toLowerCase().trim().startsWith('digair')) {
            console.log("Entrou na IA");
        
            const userMessage = message.body.slice(3).trim();
        
            console.log(userMessage);
            try {
                const reply = await ia(userMessage);
                console.log(reply);
                message.reply(reply);
                setTimeout(() => {
                    message.reply(CONTINUE_MESSAGE);
                }, 1000);
            } catch (error) {
                console.error("Erro ao processar a IA:", error);
                message.reply("Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.");
            }
        } else if (message.body.toLowerCase() === 'finalizar' || message.body.toLowerCase() === 'f' || message.body === '0') {
            userStates[numberPhone].awaitingConfirmation = false;
            userStates[numberPhone].awaitingEndService = true;
            message.reply(EVALUATION_MESSAGE)
            return;
        } else if (/^[0-8]$/.test(message.body)) {
            switchMessage(message, message.body);
            setTimeout(() => {
                message.reply(CONTINUE_MESSAGE);
            }, 1000);
            return;
        } else if (!message.body.toLowerCase().trim().startsWith('digair')) {
            message.reply(INVALID_MESSAGE);
            console.log("entrou aqui no continue")
        }
        return;
    }

    if (message.body.toLowerCase().trim().startsWith('digair')) {
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
    if (/^[0-8]$/.test(message.body) && userStates[numberPhone].awaitingEndService ===  false) {
        if (!(message.body === '0')) {
            switchMessage(message, message.body);
        }
        
        if (message.body === '0') {
            userStates[numberPhone].awaitingConfirmation = false;
            userStates[numberPhone].awaitingEndService = true;
            message.reply(EVALUATION_MESSAGE)
            return;
        }
    } 
    if (!userStates[numberPhone]) {
        userStates[numberPhone] = { awaitingResponse: true, awaitingConfirmation: false, awaitingEndService: false };
        return;
    }
    
    if (userStates[numberPhone].awaitingResponse) {
        console.log("Usuário aguardando resposta inicial");
        return;
    } else if (
        !message.body.toLowerCase().startsWith('digair') && 
        !(/^[0-8]$/.test(message.body)) && 
        userStates[numberPhone].awaitingResponse === false && 
        userStates[numberPhone].awaitingEndService ===  false) 
    {
        message.reply(INVALID_MESSAGE);
        console.log("entrou no final");
    }

    if (userStates[numberPhone].awaitingEndService === true) {
        if (/^[1-5]$/.test(message.body)) {
            await saveEvaluation(numberPhone, message.body);
            message.reply(EVALUATION_THANKS);
            delete userStates[numberPhone];
            return;
        } else {
            message.reply(EVALUATION_ERROR);
            return;
        }
    }

    userStates[numberPhone].awaitingConfirmation = true;

    setTimeout(() => {
        message.reply(CONTINUE_MESSAGE);
    }, 1000);
});
