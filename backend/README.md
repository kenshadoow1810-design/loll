# ProStats LoL - Backend

API REST para estatísticas de jogadores profissionais de League of Legends.

## Tecnologias
- Node.js + Express
- PostgreSQL
- Cache em memória
- Cron jobs para atualizações periódicas

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure o arquivo `.env`:
```bash
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL e Riot API
```

3. Inicialize o banco de dados:
```bash
npm run db:init
```

4. Inicie o servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Endpoints

### Players
- `GET /api/players` - Lista todos os jogadores
- `GET /api/players/:id` - Detalhes de um jogador
- `GET /api/players/top` - Top jogadores por KDA
- `GET /api/players?league=CBLOL` - Jogadores de uma liga
- `GET /api/players?search=faker` - Busca por nome

### Teams
- `GET /api/teams` - Lista todos os times
- `GET /api/teams?league=LCK` - Times de uma liga

### Leagues/Rankings
- `GET /api/leagues/:leagueId/rankings` - Rankings da liga

### Schedule
- `GET /api/schedule` - Próximas partidas competitivas
- `GET /api/schedule?league=LEC` - Partidas de uma liga específica

### News
- `GET /api/news` - Últimas notícias

### Stats
- `GET /api/stats/champions` - Campeões mais jogados
- `GET /api/stats/kda/top` - Top KDA dos jogadores
- `GET /api/stats/compare?player1=1&player2=2` - Comparar dois jogadores

## Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # Configuração do PostgreSQL
│   ├── controllers/          # Controladores (lógica de negócio)
│   ├── routes/
│   │   └── api.js            # Rotas da API
│   ├── services/
│   │   └── databaseService.js # Queries e cache
│   ├── utils/
│   │   └── initDb.js         # Script de inicialização do DB
│   └── server.js             # Ponto de entrada
├── data/
│   ├── schema.sql            # Schema do banco
│   ├── seed_teams.sql        # Seed de times
│   └── seed_players.sql      # Seed de jogadores
├── .env                      # Variáveis de ambiente
├── .env.example              # Exemplo de variáveis
└── package.json
```

## Cron Jobs

| Tarefa | Frequência | Descrição |
|--------|------------|-----------|
| Cache cleanup | 10 min | Limpa itens expirados do cache |
| Rankings update | 1 hora | Atualiza rankings das ligas |
| News update | 30 min | Atualiza notícias |
| Matches update | 15 min | Atualiza partidas de jogadores top |

## Cache

O sistema utiliza cache em memória com TTL de 5 minutos para:
- Listas de jogadores
- Estatísticas
- Rankings
- Calendário de partidas
- Notícias

## Próximos Passos

- [ ] Integração com Riot API para dados reais
- [ ] Scraping de notícias de sites de eSports
- [ ] Seed de partidas históricas
- [ ] Seed de calendário de partidas futuras
- [ ] Endpoint de matches históricos por jogador
