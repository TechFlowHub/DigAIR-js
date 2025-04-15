#!/bin/bash

set -e

BACKUP_DIR="$HOME/digaair_backup_$(date +%Y%m%d_%H%M%S)"

echo "🔄 Atualizando pacotes do sistema..."
sudo apt update && sudo apt upgrade -y

echo "📁 Criando backup dos arquivos sensíveis..."
mkdir -p "$BACKUP_DIR"

if [ -d "DigaAirJS" ]; then
    cp -v DigaAirJS/.env "$BACKUP_DIR/" 2>/dev/null || echo "⚠️ .env não encontrado"
    cp -v DigaAirJS/docker-compose.yml "$BACKUP_DIR/" 2>/dev/null || echo "⚠️ docker-compose.yml não encontrado"
    cp -v DigaAirJS/src/groqIA/groq.js "$BACKUP_DIR/" 2>/dev/null || echo "⚠️ groq.js não encontrado"
fi

echo "📁 Entrando no diretório DigaAirJS..."
cd DigaAirJS || { echo "❌ Diretório DigaAirJS não encontrado."; exit 1; }

echo "🧨 Parando containers Docker e removendo volumes..."
docker-compose down -v

echo "🧹 Removendo diretório antigo DigaAirJS..."
cd ..
sudo rm -rf DigaAirJS

echo "⬇️ Clonando repositório do GitHub..."
git clone git@github.com:TechFlowHub/DigAIR-js.git

echo "📁 Entrando no novo diretório clonado..."
cd DigAIR-js || { echo "❌ Falha ao entrar no diretório clonado."; exit 1; }

echo "🔁 Restaurando arquivos sensíveis do backup..."
cp -v "$BACKUP_DIR/.env" . 2>/dev/null || echo "⚠️ Nenhum .env restaurado"

echo "🚀 Subindo os containers Docker..."
docker-compose up -d

echo "✅ Processo finalizado com sucesso!"
echo "🗂️ Backup criado em: $BACKUP_DIR"
