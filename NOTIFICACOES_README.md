# Sistema de Notificações Web Push

## Visão Geral
Sistema de notificações push para alertar usuários sobre partidas próximas (15 minutos antes).

## Arquitetura

### Backend (Node.js + PostgreSQL)
- **novas tabelas no banco:**
  - `user_preferences`: Preferências do usuário
  - `push_subscriptions`: Subscrições de push (endpoint, chaves)
  - `notifications`: Histórico de notificações enviadas

- **Novos endpoints:**
  - `GET /api/notifications/vapid-public-key` - Chave pública VAPID
  - `POST /api/notifications/subscribe` - Salvar subscrição
  - `POST /api/notifications/check-matches` - Trigger do cron (GitHub Actions)
  - `GET /api/notifications/stats` - Estatísticas

- **Serviços:**
  - `notificationService.js`: Lógica de envio de pushes e verificação de partidas

### Frontend (React)
- **Service Worker (`/public/sw.js`)**: Recebe e exibe notificações
- **Hook (`usePushNotifications.js`)**: Gerencia subscrições
- **Componente (`NotificationToggle.jsx`)**: UI para ativar/desativar

### Agendamento (GitHub Actions)
- Workflow roda a cada 5 minutos
- Chama endpoint `/api/notifications/check-matches`
- Backend verifica partidas nos próximos 15 min e envia pushes

## Configuração Necessária

### 1. Gerar Chaves VAPID
```bash
cd backend
npx web-push generate-vapid-keys --json
```

Isso retornará:
```json
{
  "publicKey": "...",
  "privateKey": "..."
}
```

### 2. Variáveis de Ambiente (.env)
```env
# Backend
VAPID_PUBLIC_KEY=sua_chave_publica_aqui
VAPID_PRIVATE_KEY=sua_chave_privada_aqui
DATABASE_URL=...
PORT=3001

# Frontend (.env ou .env.local)
VITE_API_URL=https://seu-app.vercel.app
```

### 3. GitHub Secrets
No repositório do GitHub, configure:
- `API_BASE_URL`: URL da sua API na Vercel (ex: `https://seu-app.vercel.app`)
- `NOTIFICATION_API_TOKEN`: Token opcional para proteger o endpoint (se implementar autenticação)

### 4. HTTPS Obrigatório
Web Push requer HTTPS em produção. A Vercel já fornece HTTPS automaticamente.

## Como Funciona

1. **Usuário ativa notificações:**
   - Clica em "Ativar Notificações" no frontend
   - Navegador pede permissão
   - Service Worker é registrado
   - Subscrição é criada e salva no backend

2. **GitHub Actions agenda:**
   - A cada 5 minutos, workflow chama `/api/notifications/check-matches`

3. **Backend processa:**
   - Busca partidas que começam em 15-20 minutos
   - Para cada partida, cria notificação
   - Envia push para todas as subscrições ativas
   - Salva histórico no banco

4. **Usuário recebe:**
   - Notificação aparece no desktop/mobile
   - Ao clicar, abre página da partida ou stream

## Remoção do node-cron

O arquivo `scheduler.js` com `node-cron` foi removido do `index.js` pois não funciona na Vercel (serverless). As tarefas agendadas agora são:
- **Pipeline de extração**: Pode ser chamada manualmente via `POST /api/extract` ou por outro webhook
- **Sincronização de partidas**: Roda na inicialização e pode ser chamada via `POST /api/schedule/sync`
- **Notificações**: GitHub Actions cuida disso

Se quiser manter as outras tarefas agendadas, crie workflows similares no GitHub Actions.

## Testes Locais

### Backend
```bash
cd backend
npm install
# Configure .env com chaves VAPID
npm start
```

### Frontend
```bash
cd frontend
npm install
# Configure VITE_API_URL se necessário
npm run dev
```

### Testar Notificação
1. Acesse `http://localhost:5173` (ou porta do frontend)
2. Clique em "Ativar Notificações"
3. Aceite a permissão do navegador
4. Use o botão "Testar Notificação"
5. Para testar o fluxo completo, chame manualmente:
   ```bash
   curl -X POST http://localhost:3001/api/notifications/check-matches
   ```

## Próximos Passos Sugeridos

1. **Implementar autenticação** no endpoint `/check-matches` para evitar chamadas não autorizadas
2. **Adicionar preferências** por time/liga para notificar apenas usuários interessados
3. **Criar dashboard** administrativo para ver estatísticas de notificações
4. **Configurar fallback** para email quando push falhar
5. **Adicionar rate limiting** para evitar spam

## Troubleshooting

### Notificações não chegam
- Verifique se o navegador tem permissão
- Confira se as chaves VAPID estão corretas
- Teste em Chrome/Firefox/Edge (Safari tem suporte limitado)
- Verifique console do Service Worker (`chrome://serviceworker-internals`)

### Erro 410 (Gone)
- Subscrição expirou - o serviço remove automaticamente do banco
- Usuário precisa se inscrever novamente

### GitHub Actions não roda
- Verifique secrets configurados
- Teste com `workflow_dispatch` (trigger manual)
- Confira logs no GitHub Actions
