# Backend - Deploy no Render com GitHub Actions

## 📋 Visão Geral

Esta aplicação foi configurada para rodar inteiramente no **Render**, com:
- Backend Node.js + Express servindo a API
- Frontend React buildado e servido estaticamente pelo backend
- **GitHub Actions** substituindo o node-cron para tarefas agendadas

## 🚀 Passos para Deploy

### 1. Preparar o Repositório

```bash
git add .
git commit -m "Configurar deploy no Render sem node-cron"
git push origin main
```

### 2. Criar Serviço no Render

1. Acesse [render.com](https://render.com) e faça login
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Configure o serviço:

| Campo | Valor |
|-------|-------|
| **Name** | `lol-stats-app` (ou seu nome preferido) |
| **Region** | Escolha a região mais próxima dos seus usuários |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build:frontend` |
| **Start Command** | `npm start` |
| **Instance Type** | **Starter ($7/mês)** ⚠️ |

### 3. Configurar Variáveis de Ambiente

No Render, adicione as seguintes variáveis:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `DATABASE_URL` | `postgresql://...` | URL do banco PostgreSQL |
| `CITO_API_TOKEN` | `seu-token` | Token da API Cito |

> A porta é definida automaticamente pelo Render via variável `PORT`

### 4. Banco de Dados PostgreSQL

**Opção A: Usar PostgreSQL do Render (Recomendado)**
1. No dashboard, clique em **"New +"** → **"PostgreSQL"**
2. Escolha o plano gratuito ou pago
3. Copie a **Internal Database URL**
4. Cole na variável `DATABASE_URL` do Web Service

**Opção B: Usar PostgreSQL Externo**
- Configure a URL do seu banco externo na variável `DATABASE_URL`

### 5. Configurar GitHub Actions Secrets

Para os workflows funcionarem, você precisa adicionar secrets no GitHub:

1. Vá em seu repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Adicione o secret:

| Nome | Valor |
|------|-------|
| `API_BASE_URL` | `https://lol-stats-app.onrender.com` |

⚠️ **Importante:** Substitua pela URL real do seu serviço no Render após o deploy.

## ⚠️ Importante Sobre Planos

### Plano Gratuito vs Starter

| Recurso | Free ($0) | Starter ($7/mês) |
|---------|-----------|------------------|
| Servidor 24/7 | ❌ (dorme após 15min inatividade) | ✅ |
| GitHub Actions funciona | ⚠️ (pode falhar se servidor dormir) | ✅ |
| Tempo de resposta | Lento (primeira requisição ~30-50s) | Rápido |
| Ideal para | Desenvolvimento/Testes | Produção |

**Para produção com GitHub Actions funcionando corretamente, use o plano Starter.**

No plano gratuito:
- O servidor "dorme" após 15 minutos de inatividade
- O GitHub Actions pode falhar se o servidor estiver dormindo
- A primeira requisição após inatividade leva ~30-50 segundos para acordar

## 🔄 Como Funciona o Agendamento

### Antes (node-cron - Removido)
- Tasks rodavam dentro do processo do servidor
- Exigia servidor 24/7 (plano pago)
- Não tinha logs separados por execução

### Agora (GitHub Actions)
- Tasks são disparadas externamente via webhooks
- Cada execução tem logs separados no GitHub Actions
- Mais confiável e fácil de monitorar
- Funciona mesmo no plano free (com limitações)

### Endpoints Disponíveis para GitHub Actions

| Endpoint | Método | Descrição | Cron Original |
|----------|--------|-----------|---------------|
| `/api/extract` | POST | Extrai dados de estatísticas | `0 * * * *` (hora em hora) |
| `/api/schedule/sync` | POST | Sincroniza partidas | `*/30 * * * *` (30 em 30 min) |
| `/api/update-images` | POST | Atualiza imagens e nomes | `0 3 * * *` (diário 3 AM UTC) |

## 🧪 Testando o Deploy

Após o deploy, teste os endpoints:

```bash
# Health check
curl https://seu-app.onrender.com/health

# Testar extração (manual)
curl -X POST https://seu-app.onrender.com/api/extract

# Testar sincronização
curl -X POST https://seu-app.onrender.com/api/schedule/sync

# Testar atualização de imagens
curl -X POST https://seu-app.onrender.com/api/update-images
```

## 🔧 Troubleshooting

### Build falhando
- Verifique se o frontend builda localmente: `npm run build:frontend`
- Confira se todas as dependências estão no package.json

### Servidor não inicia
- Verifique os logs no dashboard do Render
- Confirme que `DATABASE_URL` está configurada corretamente
- Teste localmente com `NODE_ENV=production npm start`

### GitHub Actions falhando
- Verifique se `API_BASE_URL` está correto nos secrets
- No plano free, o servidor pode estar dormindo
- Adicione retry logic no workflow ou use plano Starter

### Puppeteer com erros
- O Render já inclui dependências do Chromium
- Se necessário, adicione build hooks para instalar deps do sistema

## 📊 Monitoramento

- **Logs do Servidor:** Dashboard do Render → Seu serviço → Logs
- **Logs do GitHub Actions:** Repositório → Aba Actions → Workflow específico
- **Métricas:** CPU, Memória, Requests no dashboard do Render
- **Health Check:** `https://seu-app.onrender.com/health`

## 🔄 Atualizações

Após o deploy inicial, qualquer push na branch `main` dispara:
1. Build e deploy automático no Render
2. Atualização do frontend e backend

```bash
git push origin main
```

## 📁 Estrutura do Projeto

```
/backend
├── src/
│   ├── index.js              # Servidor Express + serve frontend
│   ├── config/               # Configuração do banco
│   ├── routes/               # Rotas da API
│   ├── controllers/          # Controladores
│   ├── services/             # Lógica de negócio
│   └── scripts/              # Scripts utilitários (sem cron)
├── package.json              # Dependências (sem node-cron)
└── README_RENDER.md          # Este arquivo

/.github/workflows/
└── data-pipeline.yml         # GitHub Actions para agendamento

/frontend/
└── dist/                     # Gerado após build (servido pelo backend)
```

---

**Dúvidas?** Consulte a [documentação do Render](https://render.com/docs)
