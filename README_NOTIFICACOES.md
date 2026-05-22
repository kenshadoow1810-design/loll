# Sistema de Notificações Push - Guia de Implementação

## Visão Geral

Este sistema utiliza **Web Push Notifications** com **GitHub Actions** para agendamento, permitindo que usuários recebam notificações sobre partidas próximas mesmo com o navegador fechado.

## Arquitetura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  GitHub Actions │────▶│  API na Vercel   │────▶│  Banco PostgreSQL│
│  (a cada 5 min) │     │  /api/notifications/   │  (subscrições)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  Web Push       │
                        │  (notificações) │
                        └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  Navegador do   │
                        │  Usuário        │
                        └─────────────────┘
```

## Configuração Necessária

### 1. Variáveis de Ambiente no Backend

Adicione estas variáveis no seu `.env` ou na plataforma de deploy (Vercel):

```bash
# Chaves VAPID para Web Push (gerar com: npx web-push generate-vapid-keys --json)
VAPID_PUBLIC_KEY=sua_chave_publica_aqui
VAPID_PRIVATE_KEY=sua_chave_privada_aqui

# Token de autenticação para o endpoint de check-matches
NOTIFICATION_API_TOKEN=seu_token_secreto_aqui

# URL base da API (para produção)
API_BASE_URL=https://seu-app.vercel.app
```

### 2. Secrets no GitHub

No repositório do GitHub, vá em **Settings > Secrets and variables > Actions** e adicione:

| Nome | Valor |
|------|-------|
| `API_BASE_URL` | `https://seu-app.vercel.app` |
| `NOTIFICATION_API_TOKEN` | Mesmo token definido no backend |

### 3. Secrets Adicionais para Data Pipeline

| Nome | Valor |
|------|-------|
| `PANDASCORE_API_KEY` | Sua chave da API PandaScore |
| `DATABASE_URL` | URL de conexão com PostgreSQL |

## Workflows do GitHub Actions

### 1. Check Notifications (`check-notifications.yml`)
- **Frequência**: A cada 5 minutos
- **Função**: Chama o endpoint `/api/notifications/check-matches` para verificar partidas próximas e enviar notificações

### 2. Data Pipeline (`data-pipeline.yml`)
- **Extração de dados**: A cada hora (`0 * * * *`)
- **Sincronização de partidas**: A cada 30 minutos (`*/30 * * * *`)
- **Atualização de imagens**: Pode ser adicionado como job separado

## Funcionalidades Implementadas

### Preferências de Usuário
Os usuários podem configurar preferências por:
- **Times favoritos**: Recebe notificações apenas quando esses times jogam
- **Ligas favoritas**: Recebe notificações apenas de ligas específicas
- **Sem preferências**: Recebe todas as notificações (padrão)

### Filtragem Inteligente
O sistema filtra automaticamente:
- Apenas partidas que começam nos próximos 15 minutos (configurável)
- Apenas usuários interessados nas partidas (baseado em preferências)
- Evita notificações duplicadas (não envia novamente dentro de 1 hora)

## Endpoints da API

### POST `/api/notifications/subscribe`
Salva uma nova subscrição de push notification.

**Body:**
```json
{
  "subscription": {
    "endpoint": "...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "preferences": {
    "favoriteTeams": ["T1", "LOUD"],
    "favoriteLeagues": ["CBLOL", "LCK"]
  }
}
```

### POST `/api/notifications/check-matches`
Verifica partidas próximas e envia notificações (protegido por token).

**Headers:**
```
Authorization: Bearer seu_token_aqui
```

**Query Params:**
- `minutes`: Minutos de antecedência (padrão: 15)

### GET `/api/notifications/vapid-public-key`
Retorna a chave pública VAPID para configuração no frontend.

### GET `/api/notifications/stats`
Retorna estatísticas de subscrições e notificações enviadas.

## Testes Manuais

### Executar Workflow Manualmente
1. Vá em **Actions** no GitHub
2. Selecione o workflow desejado
3. Clique em **Run workflow**
4. Aguarde a execução e verifique os logs

### Testar Endpoint de Notificações
```bash
curl -X POST https://seu-app.vercel.app/api/notifications/check-matches \
  -H "Authorization: Bearer seu_token_aqui" \
  -H "Content-Type: application/json"
```

## Troubleshooting

### Notificações não estão chegando
1. Verifique se o Service Worker está registrado corretamente
2. Confirme que a permissão de notificação foi concedida
3. Verifique os logs do GitHub Actions para erros
4. Confira se há subscrições no banco de dados

### Erro 401 no endpoint check-matches
- Verifique se o `NOTIFICATION_API_TOKEN` está configurado corretamente no backend e nos secrets do GitHub

### Erro nas chaves VAPID
- Gere novas chaves com: `npx web-push generate-vapid-keys --json`
- Atualize as variáveis de ambiente no backend

## Próximos Passos Sugeridos

1. **UI de Preferências**: Criar interface para usuário selecionar times e ligas favoritos
2. **Histórico de Notificações**: Mostrar notificações enviadas no dashboard
3. **Controle de Frequência**: Permitir usuário escolher quando receber notificações
4. **Email Fallback**: Enviar email se notificação push falhar
5. **Analytics**: Rastrear taxa de abertura das notificações

## Estrutura de Arquivos

```
backend/
├── src/
│   ├── services/
│   │   ├── notificationService.js    # Serviço principal de notificações
│   │   └── ...
│   ├── routes/
│   │   ├── notificationRoutes.js     # Rotas da API de notificações
│   │   └── ...
│   └── config/
│       └── schema.js                 # Schema do banco (inclui push_subscriptions)
│
.github/
└── workflows/
    ├── check-notifications.yml       # Workflow de notificações (5min)
    └── data-pipeline.yml             # Workflow de extração de dados
│
frontend/
├── public/
│   └── sw.js                         # Service Worker para push
└── src/
    ├── hooks/
    │   └── usePushNotifications.js   # Hook React para gerenciar push
    └── components/
        └── common/
            └── NotificationToggle.jsx # Componente UI de toggle
```
