exports.ia = async (promptIa, userId) => {
    const url = "https://api.groq.com/openai/v1/chat/completions";
    const headers = {
        Authorization: "Bearer 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",
        "Content-Type": "application/json",
    };
    if (!conversationHistory[userId]) conversationHistory[userId] = [];
    conversationHistory[userId].push({ role: "user", content: promptIa });
    if (conversationHistory[userId].length > 10) conversationHistory[userId].shift();

    const prompts = [
        { role: "system", content: "Você é um bot especializado em contabilidade no Brasil." },
    ];

    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({ model: "gpt-4", messages: prompts }),
        });
        const data = await response.json();

        if (data.choices && data.choices[0].message) {
            const reply = data.choices[0].message.content.trim();
            conversationHistory[userId].push({ role: "assistant", content: reply });
            return reply;
        } else {
            throw new Error("Resposta inesperada da API");
        }
    } catch (error) {
        console.error("Erro ao consultar a IA:", error.message);
        return "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.";
    }
};
