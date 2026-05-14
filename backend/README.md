# LoL Pro Stats - Backend

Backend API para estatísticas de jogadores profissionais de League of Legends.

## Tecnologias

- Node.js + Express
- PostgreSQL
- Cache em memória
- node-cron para tarefas agendadas
- Riot Games API para dados do jogo
- DDragon para imagens de campeões e itens

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Edite o arquivo `.env` com suas configurações:
- `RIOT_API_KEY`: Sua chave da Riot API
- Configurações do banco de dados PostgreSQL

4. Inicie o servidor:
```bash
# Produção
npm start

# Desenvolvimento (com hot reload)
npm run dev
```

## Endpoints da API

### Players
- `GET /api/players/search?q=name` - Buscar jogadores por nome
- `GET /api/players/:id` - Obter jogador por ID
- `GET /api/players/name/:name` - Obter jogador por nome
- `GET /api/players/top` - Top jogadores por LP
- `GET /api/players/region/:region` - Jogadores por região
- `GET /api/players/:id/stats` - Estatísticas do jogador
- `GET /api/players/:id/champions` - Campeões mais jogados
- `GET /api/players/:id/matches` - Histórico de partidas

### News
- `GET /api/news` - Últimas notícias
- `GET /api/news/:id` - Notícia por ID
- `GET /api/news/search?q=query` - Buscar notícias
- `GET /api/news/recent` - Notícias recentes

### Leagues
- `GET /api/leagues/:region/rankings` - Rankings da liga
- `GET /api/leagues/regions` - Regiões disponíveis

### Teams
- `GET /api/teams` - Todos os times
- `GET /api/teams/:id` - Time por ID
- `GET /api/teams/:id/players` - Jogadores do time

### Sync (Admin)
- `POST /api/sync/player` - Sincronizar jogador
- `POST /api/sync/matches` - Sincronizar partidas
- `POST /api/sync/bulk-players` - Sincronizar múltiplos jogadores
- `POST /api/sync/rankings` - Atualizar rankings manualmente
- `GET /api/sync/cache/stats` - Estatísticas do cache
- `DELETE /api/sync/cache/clear` - Limpar cache

## Cron Jobs

O sistema executa automaticamente:

- **Rankings**: Atualização a cada hora
- **Partidas**: Atualização a cada 30 minutos
- **Notícias**: Atualização a cada 30 minutos
- **Cache**: Limpeza automática a cada 5 minutos

## Estrutura de Pastas

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js    # Conexão PostgreSQL
│   │   └── schema.js      # Criação das tabelas
│   ├── controllers/       # Controladores (opcional)
│   ├── routes/
│   │   ├── players.js     # Rotas de jogadores
│   │   ├── news.js        # Rotas de notícias
│   │   ├── leagues.js     # Rotas de ligas
│   │   ├── teams.js       # Rotas de times
│   │   └── sync.js        # Rotas de sincronização
│   ├── services/
│   │   ├── riotApiService.js    # Integração Riot API
│   │   ├── playerService.js     # Lógica de jogadores
│   │   ├── matchService.js      # Lógica de partidas
│   │   ├── newsService.js       # Lógica de notícias
│   │   ├── teamService.js       # Lógica de times
│   │   └── dataSyncService.js   # Sincronização de dados
│   ├── cron/
│   │   └── jobs.js        # Tarefas agendadas
│   ├── middleware/
│   │   └── cache.js       # Cache em memória
│   └── index.js           # Entry point
├── .env                   # Variáveis de ambiente
├── .env.example           # Exemplo de variáveis
└── package.json
```

## Banco de Dados

Tabelas principais:

- **players**: Dados dos jogadores
- **matches**: Histórico de partidas
- **teams**: Times profissionais
- **news**: Notícias do cenário
- **leagues**: Rankings das ligas

## Cache

O sistema utiliza cache em memória com TTL configurável:

- Rankings: 1 hora
- Estatísticas de jogador: 10-30 minutos
- Notícias: 30 minutos

## Próximos Passos

1. Configurar uma API key válida da Riot Games
2. Configurar banco de dados PostgreSQL
3. Popular o banco com jogadores profissionais iniciais
4. Implementar RSS feeder para notícias
5. Adicionar autenticação para endpoints admin
