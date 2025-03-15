const { on } = require('events');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { QUESTION, RESP_QUESTION_1, RESP_QUESTION_2, RESP_QUESTION_3, RESP_QUESTION_4, RESP_QUESTION_5, RESP_QUESTION_6, RESP_QUESTION_7, RESP_QUESTION_8, RESP_QUESTION_9, RESP_QUESTION_0 } = require('./messages/Questions');

const client = new Client({ authStrategy: new LocalAuth() });
let isConnected = false;

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
}

let phones= []; 
let currentService = [];

client.on('message', async (message) => {
    setTimeout(() => {
        let numberPhone = onlyNumbers(message.from);

        if (numberPhone) {
            if (phones.includes(numberPhone)) {
                console.log("Phone existing");
                message.reply(`Você já está cadastrado *${message.notifyName}*! Seja bem-vindo! de volta`);
            } else {
                phones.push(numberPhone);
                console.log("Phone added");
                message.reply(`Você foi cadastrado *${message.notifyName}*! Seja bem-vindo!`);
            } 
        }
        
        message.reply(QUESTION);  
        currentService.push(numberPhone);

        switch (message.body) {
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
                message.reply('Opção inválida! Tente novamente!');
                break;
        }




        console.log(phones);
    }, 1000);
});
