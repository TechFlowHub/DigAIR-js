const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// Estado global para rastrear estágios de interação e histórico
const userState = {};
const conversationHistory = {};

// Menu de opções
const menuOptions = `
📢 Escolha uma opção! Digite um número de *1 a 9* para sua dúvida ou *0 para encerrar* o atendimento.

*1* - 💰 Quem deve declarar o Imposto de Renda em 2025
*2* - 🛑 Quem NÃO precisa declarar o Imposto de Renda em 2025?
*3* - 📌 Para que serve o Imposto de Renda e por que ele é cobrado?
*4* - 📉 O que é IRRF?
*5* - 📊 Tabela do Imposto de Renda 2025
*6* - 🏡 Declarar meu patrimônio vai aumentar meu imposto?
*7* - 📝 Como declarar o Imposto de Renda?
*8* - 🏠 Tenho mais de uma casa, preciso declarar todas?
*9* - *🚀 USE NOSSA IA! 🤖✨*
*0* - 👋 Para finalizar atendimento
`;

// Respostas predefinidas
const predefinedResponses = {
    1: "💰 Quem deve declarar o Imposto de Renda em 2025:\n\n- Quem recebeu rendimentos tributáveis acima de R$ 28.559,70 em 2024.\n- Consulte um especialista para mais detalhes! 😊",
    2: "🛑 Quem NÃO precisa declarar o Imposto de Renda em 2025:\n\n- Quem recebeu rendimentos abaixo do limite de R$ 28.559,70 em 2024.\n- Consulte um especialista para garantir! ✨",
    3: "📌 Para que serve o Imposto de Renda:\n\n- O IR é usado para financiar serviços públicos como saúde, educação e segurança. 🏥📚👮‍♂️",
    4: "📉 O que é IRRF:\n\n- O IRRF (Imposto de Renda Retido na Fonte) é uma antecipação do imposto devido no ano seguinte. 💡",
    5: "📊 Tabela do Imposto de Renda 2025:\n\n- Até R$ 1.903,98: isento\n- R$ 1.903,99 a R$ 2.826,65: 7,5%\n- Consulte a tabela completa para mais detalhes. 🔢",
    6: "🏡 Declarar patrimônio aumenta meu imposto?\n\n- Não necessariamente. O patrimônio deve ser declarado, mas não resulta automaticamente em aumento do imposto. ✅",
    7: "📝 Como declarar o Imposto de Renda:\n\n- Utilize o programa da Receita Federal e siga as instruções para preencher corretamente sua declaração. 🖥️",
    8: "🏠 Tenho mais de uma casa, preciso declarar todas?\n\n- Sim, todos os bens devem ser declarados no IR. Isso inclui imóveis, veículos, e outros patrimônios. 🏘️",
    0: "👋 Atendimento encerrado. Até mais!"
};

// Função para processar mensagens do menu e IA
const processMessage = async (message, userId) => {
    if (!userState[userId]) userState[userId] = { stage: "menu" };

    const { stage } = userState[userId];
    const option = parseInt(message.body, 10);

    if (stage === "menu") {
        if (option >= 1 && option <= 9) {
            if (option === 9) {
                userState[userId].stage = "ai";
                return "🤖 Você escolheu usar nossa Inteligência Artificial! Digite sua pergunta.";
            } else {
                return predefinedResponses[option] || "Opção inválida.";
            }
        } else if (option === 0) {
            delete userState[userId];
            return predefinedResponses[0];
        } else {
            return menuOptions;
        }
    } else if (stage === "ai") {
        const response = await processAIMessage(message.body, userId);
        return response;
    }

    return "Não entendi sua mensagem. Por favor, escolha uma opção do menu.";
};

// Função para processar mensagens com a IA
const processAIMessage = async (text, userId) => {
    const url = "https://api.groq.com/openai/v1/chat/completions";
    const headers = {
        Authorization: "Bearer SUA_API_KEY",
        "Content-Type": "application/json",
    };

    if (!conversationHistory[userId]) conversationHistory[userId] = [];
    conversationHistory[userId].push({ role: "user", content: text });

    if (conversationHistory[userId].length > 10) conversationHistory[userId].shift();

    const prompts = [
        { role: "system", content: "Você é um bot especializado em contabilidade no Brasil." },
        ...conversationHistory[userId],
    ];

    try {
        const { data } = await axios.post(url, { model: "gpt-4", messages: prompts }, { headers });
        const reply = data.choices[0].message.content.trim();
        conversationHistory[userId].push({ role: "assistant", content: reply });
        return reply;
    } catch (error) {
        console.error("Erro ao consultar a IA:", error.message);
        return "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.";
    }
};

// Inicializa o cliente do WhatsApp
const client = new Client({ authStrategy: new LocalAuth() });

client.on('qr', (qr) => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('Bot pronto!'));
client.on('message', async (message) => {
    const reply = await processMessage(message, message.from);
    message.reply(reply);
});

client.initialize();