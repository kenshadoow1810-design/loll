#!/bin/bash

echo "🚀 Setup do LoL Pro Stats"
echo "========================="
echo ""

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale em https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node -v) instalado"

# Verificar npm
echo "📦 Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado"
    exit 1
fi
echo "✅ npm $(npm -v) instalado"

# Instalar dependências do backend
echo ""
echo "📦 Instalando dependências do backend..."
cd backend
npm install
echo "✅ Dependências do backend instaladas"

# Instalar dependências do frontend
echo ""
echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm install
echo "✅ Dependências do frontend instaladas"

# Verificar PostgreSQL
echo ""
echo "🗄️  Verificando PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL instalado"
    echo ""
    echo "⚠️  ATENÇÃO: Você precisa criar o banco de dados manualmente:"
    echo ""
    echo "   sudo -u postgres psql"
    echo "   CREATE DATABASE lol_stats;"
    echo "   \\q"
    echo ""
else
    echo "❌ PostgreSQL NÃO instalado!"
    echo ""
    echo "📋 Para instalar, execute:"
    echo ""
    echo "   # Debian/Ubuntu:"
    echo "   sudo apt-get update"
    echo "   sudo apt-get install postgresql postgresql-contrib"
    echo ""
    echo "   # Depois inicie o serviço:"
    echo "   sudo service postgresql start"
    echo ""
    echo "   # Crie o banco:"
    echo "   sudo -u postgres psql"
    echo "   CREATE DATABASE lol_stats;"
    echo "   \\q"
fi

# Verificar API Key
echo ""
echo "🔑 Verificando API Key da Riot..."
cd ../backend
if [ -f .env ]; then
    if grep -q "YOUR_RIOT_API_KEY_HERE" .env; then
        echo "⚠️  API Key da Riot NÃO configurada!"
        echo ""
        echo "📋 Para obter sua API Key:"
        echo "   1. Acesse https://developer.riotgames.com/"
        echo "   2. Faça login com sua conta Riot"
        echo "   3. Vá em 'Dashboard'"
        echo "   4. Clique em 'Generate API Key'"
        echo "   5. Edite o arquivo backend/.env e substitua YOUR_RIOT_API_KEY_HERE"
        echo ""
    else
        echo "✅ API Key da Riot configurada"
    fi
else
    echo "⚠️  Arquivo .env não encontrado"
fi

echo ""
echo "==================================="
echo "✅ Setup concluído!"
echo "==================================="
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Configure o PostgreSQL (se necessário)"
echo "2. Adicione sua API Key da Riot no arquivo backend/.env"
echo "3. Inicie o backend:"
echo "   cd backend && npm run dev"
echo ""
echo "4. Em outro terminal, inicie o frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "5. Acesse http://localhost:3000"
echo ""
