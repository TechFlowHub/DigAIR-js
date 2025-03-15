const { on } = require('events');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { QUESTION, RESP_QUESTION_1, RESP_QUESTION_2, RESP_QUESTION_3, RESP_QUESTION_4, RESP_QUESTION_5, RESP_QUESTION_6, RESP_QUESTION_7, RESP_QUESTION_8, RESP_QUESTION_9, RESP_QUESTION_0 } = require('./messages/Questions');

const client = new Client({ authStrategy: new LocalAuth() });
let isConnected = false;
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

let phones = []; 
let currentService = [];

const switchMessage = (message, text) => {
    switch (text) {
        case '1':
            message.reply(RESP_QUESTION_1);
            break;
        case '2':
            message.reply(RESP_QUESTION_2);
            break;
        case '3':
            message.reply(RESP_QUESTION_3);
            break;
        case '4':
            message.reply(RESP_QUESTION_4);
            break;
        case '5':
            message.reply(RESP_QUESTION_5);
            break;
        case '6':
            message.reply(RESP_QUESTION_6);
            break;
        case '7':
            message.reply(RESP_QUESTION_7);
            break;
        case '8':
            message.reply(RESP_QUESTION_8);
            break;
        case '9':
            message.reply(RESP_QUESTION_9);
            break;
        case '0':
            message.reply(RESP_QUESTION_0);
            break;
        default:
            message.reply('⚠️ *Opção inválida!* Por favor, digite um número de *1 a 9* para escolher uma pergunta ou *0 para encerrar* o atendimento.');
    }
};

client.on('message', async (message) => {
    setTimeout(() => {
        let numberPhone = onlyNumbers(message.from);

        if (!userStates[numberPhone]) {
            userStates[numberPhone] = { awaitingResponse: true, awaitingConfirmation: false };

            console.log(`Novo usuário cadastrado: ${message.notifyName}`);

            message.reply(`Olá *${message.notifyName}*! Seja bem-vindo!`);
            setTimeout(() => {
                message.reply(QUESTION);
            }, 1000);
            userStates[numberPhone].awaitingResponse = false;
            return;
        }

        if (userStates[numberPhone].awaitingConfirmation) {
            if (message.body.toLowerCase() === 'sim') {
                userStates[numberPhone].awaitingConfirmation = false;
                setTimeout(() => {
                    message.reply(QUESTION);
                }, 1000);
            } else if (message.body.toLowerCase() === 'finalizar') {
                userStates[numberPhone].awaitingConfirmation = false;
                message.reply('Obrigado por usar nossos serviços! Se precisar, estamos por aqui.');
            } else if (/^[0-9]$/.test(message.body)) {
                userStates[numberPhone].awaitingConfirmation = false;
                switchMessage(message, message.body);
            } else {
                message.reply('Por favor, responda apenas com "sim" ou "não".');
            }
            return;
        }

        if (/^[0-9]$/.test(message.body)) {
            switchMessage(message, message.body);
        } else {
            message.reply('⚠️ *Opção inválida!* Por favor, digite um número entre *1 e 9* ou *0 para encerrar*.');
        }

        userStates[numberPhone].awaitingConfirmation = true;
        setTimeout(() => {
            message.reply(`🌟 Gostaria de ver o painel de opções novamente?\n
Por favor digite *SIM*, *FINALIZAR* para finalizar o atendimento 👇😊, ou escolha uma nova opção entre *1 e 9*.`);
        }, 1000);
    }, 1000);
});
