FROM node:latest

WORKDIR /usr/src/app

# Instalar dependências para o Puppeteer funcionar corretamente
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    libnss3 \
    libatk-bridge2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    --no-install-recommends

# Baixar e instalar o Google Chrome
RUN wget -qO- https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb > chrome.deb \
    && apt-get install -y ./chrome.deb \
    && rm chrome.deb

# Definir o caminho correto do Chrome
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"

# Copiar os arquivos do projeto
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm install

COPY . .

EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "src/index.js"]
