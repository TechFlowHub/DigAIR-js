# DigAIR

**DigAIR** é um assistente virtual de código aberto desenvolvido para auxiliar usuários com dúvidas relacionadas ao **Imposto de Renda no Brasil**, por meio de mensagens via **WhatsApp**. Ele combina **inteligência artificial** com funcionalidades práticas de atendimento automatizado, oferecendo suporte rápido, educativo e acessível.

---

## ✨ Funcionalidades

- 📲 **Interação via WhatsApp**  
  Responde automaticamente mensagens enviadas pelos usuários, com orientações confiáveis sobre o Imposto de Renda.

- 🧠 **Inteligência Artificial**  
  Integração com a **API Groq** para interpretar e responder dúvidas complexas da área contábil.

- 💾 **Persistência de Dados**  
  Utiliza **MySQL** para armazenar informações como números de telefone, reincidências e avaliações dos atendimentos.

- 💬 **Respostas Rápidas**  
  Mensagens pré-definidas para perguntas frequentes, oferecendo respostas instantâneas.

- ⭐ **Avaliação de Atendimento**  
  Usuários podem avaliar o atendimento com notas de 1 a 5, ajudando na melhoria contínua do serviço.

---

## 📁 Estrutura do Projeto

```
.env
.env_example
.gitignore
docker-compose.yml
Dockerfile
package.json
README.md
nginx/
  └── nginx.conf
src/
  ├── casoqueiravoltar.txt
  ├── index.js
  ├── config/
  │   └── database.js
  ├── groqIA/
  │   └── groq.js
  ├── messages/
  │   ├── Menus.js
  │   └── Questions.js
  ├── models/
  │   ├── Evaluation.js
  │   ├── Phone.js
  │   └── RepeatOffenderPhone.js
  ├── pdf/
  │   └── teste.pdf
  ├── services/
  │   └── databaseService.js
  └── utils/
      └── sync.js
```

### Principais diretórios

- **`src/config/`** – Configuração do banco de dados.  
- **`src/groqIA/`** – Integração com a API de IA (Groq).  
- **`src/messages/`** – Mensagens automáticas e menus de interação.  
- **`src/models/`** – Modelos Sequelize para estruturação de dados.  
- **`src/services/`** – Camada de serviços para operações com o banco de dados.  
- **`src/utils/`** – Utilitários diversos, como scripts de sincronização.

---

## ⚙️ Pré-requisitos

- [Node.js](https://nodejs.org/) (versão mais recente recomendada)  
- [Docker](https://www.docker.com/) e Docker Compose  
- [MySQL](https://www.mysql.com/)

---

## 🚀 Como usar

### Executando localmente

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd DigAIR-js
   ```

2. **Configure o ambiente:**
   ```bash
   cp .env_example .env
   # Edite o .env com suas credenciais do MySQL
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Sincronize o banco de dados:**
   ```bash
   npm run syncDatabase
   ```

5. **Inicie o projeto:**
   ```bash
   npm start
   ```

### Executando com Docker

1. **Build e inicialização:**
   ```bash
   docker-compose up --build
   ```

2. **Conecte-se via WhatsApp:**  
   Escaneie o QR Code exibido no terminal para ativar o bot.

---

## 🧰 Tecnologias Utilizadas

- **Node.js** – Plataforma principal de desenvolvimento  
- **whatsapp-web.js** – Integração com o WhatsApp  
- **Sequelize** – ORM para o banco de dados  
- **MySQL** – Banco de dados relacional  
- **Docker** – Contêineres para desenvolvimento e produção  
- **Nginx** – Proxy reverso e gerenciamento de requisições  

---

## 🤝 Contribuindo

Contribuições são bem-vindas!  
Se você deseja melhorar o projeto, sinta-se à vontade para:

- Criar uma **issue** com sugestões ou problemas encontrados  
- Abrir um **pull request** com melhorias no código

---

## 📄 Licença

Este projeto está licenciado sob a **GNU General Public License v3.0**.  
Veja o arquivo [`LICENSE`](https://github.com/TechFlowHub/DigAIR-js/blob/main/LICENSE) para mais detalhes.

---

## 📬 Contato

Para dúvidas, sugestões ou parcerias, entre em contato com o desenvolvedor através das [issues do GitHub](https://github.com/TechFlowHub/DigAIR-js/issues) ou diretamente por e-mail.
