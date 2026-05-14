# LoL Pro Stats - Estatísticas de Jogadores Profissionais de League of Legends

Aplicação fullstack para acompanhamento de estatísticas de jogadores profissionais de LoL, com notícias do cenário competitivo.

## 🏗️ Arquitetura

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL
- **Cache**: Memória (em produção usar Redis)
- **APIs**: Riot Games API, DDragon

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- API Key da Riot Games

## ⚙️ Configuração

### 1. Banco de Dados

```bash
# Instalar PostgreSQL (se necessário)
sudo apt-get install postgresql postgresql-contrib

# Iniciar serviço
sudo service postgresql start

# Criar banco de dados
sudo -u postgres psql
CREATE DATABASE lol_stats;
\q
```

### 2. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env e coloque sua RIOT_API_KEY

# Rodar em desenvolvimento
npm run dev
```

O backend estará disponível em `http://localhost:3001`

### 3. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

## 🔑 Obter API Key da Riot

1. Acesse https://developer.riotgames.com/
2. Faça login com sua conta Riot
3. Vá em "Dashboard"
4. Clique em "Generate API Key"
5. Copie a key e cole no arquivo `backend/.env`

## 🎮 Sincronizar Dados

Com o backend rodando, use a API para sincronizar jogadores:

### Via cURL:

```bash
# Sincronizar um jogador específico
curl -X POST http://localhost:3001/api/sync/player \
  -H "Content-Type: application/json" \
  -d '{"summonerName": "NomeDoJogador", "region": "br1"}'

# Sincronizar múltiplos jogadores
curl -X POST http://localhost:3001/api/sync/bulk-players \
  -H "Content-Type: application/json" \
  -d '{
    "players": [
      {"name": "Jogador1", "region": "br1", "team": "Time A"},
      {"name": "Jogador2", "region": "na1", "team": "Time B"}
    ]
  }'

# Atualizar rankings manualmente
curl -X POST http://localhost:3001/api/sync/rankings
```

## 📡 Endpoints da API

### Players
- `GET /api/players/search?q=name` - Buscar jogadores por nome
- `GET /api/players/:id` - Detalhes do jogador
- `GET /api/players/:id/stats` - Estatísticas do jogador
- `GET /api/players/:id/matches` - Histórico de partidas
- `GET /api/players/:id/champions` - Campeões mais jogados
- `GET /api/players/top` - Top jogadores por LP

### Rankings
- `GET /api/leagues/:region/rankings` - Rankings da liga
- `GET /api/leagues/regions` - Regiões disponíveis

### News
- `GET /api/news` - Últimas notícias
- `GET /api/news/:id` - Notícia específica
- `GET /api/news/search?q=query` - Buscar notícias

### Teams
- `GET /api/teams` - Todos os times
- `GET /api/teams/:id` - Detalhes do time
- `GET /api/teams/:id/players` - Jogadores do time

### Sync (Admin)
- `POST /api/sync/player` - Sincronizar jogador
- `POST /api/sync/bulk-players` - Sincronizar múltiplos jogadores
- `POST /api/sync/rankings` - Atualizar rankings
- `GET /api/sync/cache/stats` - Estatísticas do cache
- `DELETE /api/sync/cache/clear` - Limpar cache

## ⏰ Cron Jobs Automáticos

O sistema atualiza automaticamente:

- **Rankings**: A cada hora (minuto 0)
- **Partidas dos top players**: A cada 30 minutos (minutos 0 e 30)
- **Notícias**: A cada 30 minutos (minutos 15 e 45)
- **Limpeza de cache**: A cada 5 minutos

## 🎨 Funcionalidades do Frontend

- ✅ Home com top jogadores e últimas notícias
- ✅ Busca de jogadores por nome
- ✅ Página de detalhes do jogador com:
  - Estatísticas gerais (winrate, KDA, CS médio, etc)
  - Histórico de partidas recentes
  - Campeões mais jogados
- ✅ Rankings por região (CBLOL, LCS, LEC, LCK, LPL, etc)
- ✅ Página de notícias filtradas por liga

## 🛠️ Desenvolvimento

### Estrutura de Diretórios

```
/workspace
├── backend/
│   ├── src/
│   │   ├── config/       # Configuração do banco
│   │   ├── controllers/  # Controladores (opcional)
│   │   ├── cron/         # Jobs agendados
│   │   ├── middleware/   # Middlewares (cache, etc)
│   │   ├── routes/       # Rotas da API
│   │   ├── services/     # Serviços e lógica de negócio
│   │   └── index.js      # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/   # Componentes React
    │   ├── pages/        # Páginas da aplicação
    │   ├── services/     # Serviços de API
    │   ├── hooks/        # Hooks customizados
    │   ├── App.jsx       # Componente principal
    │   ├── main.jsx      # Entry point
    │   └── index.css     # Estilos globais
    └── package.json
```

## 📝 Notas

- As imagens dos jogadores usam ícones da Riot (DDragon) como placeholder
- No futuro, será implementado scraping de fotos reais via Liquipedia
- O cache é feito em memória (Map). Em produção, usar Redis
- Para regiões fora das Américas, pode ser necessário ajustar os endpoints da Riot API

## 🚀 Próximos Passos

- [ ] Implementar scraping de fotos dos jogadores
- [ ] Adicionar gráficos com Chart.js/ApexCharts
- [ ] Integrar RSS feeds de notícias
- [ ] Sistema de autenticação para admin
- [ ] Deploy em produção

## 📄 Licença

MIT

---

Desenvolvido com ❤️ para a comunidade de League of Legends
