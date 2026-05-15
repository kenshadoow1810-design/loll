# ProStats LoL - Backend

Backend da API de estatísticas de League of Legends profissionais, integrado com a **Cito API**.

## Funcionalidades

- **Sincronização Automática**: Times e jogadores das 5 principais ligas (LCK, LPL, LCS, LEC, CBLOL)
- **Cron Jobs**: Atualização horária de dados via Cito API
- **Cache em Memória**: Reduz chamadas ao banco de dados
- **Endpoints REST**: API completa para consumo do frontend

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Chave de API da Cito (https://citoapi.com/)

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prostats_lol
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=development
CITO_API_KEY=sua_chave_aqui
```

### 3. Criar banco de dados

```sql
CREATE DATABASE prostats_lol;
```

### 4. Inicializar schema

```bash
npm run db:init
```

### 5. Sincronização inicial

```bash
npm run sync:init
```

## Rodando o projeto

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Endpoints Principais

- `GET /api/players` - Lista de jogadores
- `GET /api/teams` - Lista de times
- `GET /api/schedule` - Calendário de partidas
- `GET /api/stats/compare?player1=id&player2=id` - Comparar jogadores

## Cron Jobs

- Times/Jogadores: Atualização horária
- Calendário: A cada 30 minutos
- Cache Cleanup: A cada 1 minuto
