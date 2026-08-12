#!/bin/bash

echo "🚀 SUBMITA - Setup Automático"
echo "================================"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas"

# Configurar shadcn/ui
echo "🎨 Configurando shadcn/ui..."
npx shadcn-ui@latest init --yes --typescript --tailwind --src-dir --import-alias "@/*"

if [ $? -ne 0 ]; then
    echo "❌ Erro ao configurar shadcn/ui"
    exit 1
fi

echo "✅ shadcn/ui configurado"

# Instalar componentes shadcn/ui
echo "📚 Instalando componentes shadcn/ui..."
npx shadcn-ui@latest add button input label card form select textarea dialog alert badge table tabs dropdown-menu navigation-menu toast progress switch checkbox separator avatar skeleton --yes

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar componentes shadcn/ui"
    exit 1
fi

echo "✅ Componentes shadcn/ui instalados"

# Configurar arquivo de ambiente
if [ ! -f .env.local ]; then
    echo "⚙️ Criando arquivo de ambiente..."
    cp .env.example .env.local
    echo "✅ Arquivo .env.local criado"
    echo "📝 Por favor, edite o arquivo .env.local com suas configurações"
else
    echo "✅ Arquivo .env.local já existe"
fi

# Verificar tipos TypeScript
echo "🔍 Verificando tipos TypeScript..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️ Alguns erros de tipo encontrados, mas continuando..."
fi

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Edite o arquivo .env.local com suas configurações"
echo "2. Execute 'npm run dev' para iniciar o servidor de desenvolvimento"
echo "3. Acesse http://localhost:3000"
echo ""
echo "📚 Documentação completa disponível no README.md"