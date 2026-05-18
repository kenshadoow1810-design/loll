# Backend de Notícias - LoL Stats API

Backend Node.js para buscar e agregar notícias de League of Legends de múltiplas fontes RSS.

## 🚀 Funcionalidades

- **Agregação de Notícias**: Busca notícias de várias fontes (Google News)
- **Categorias por Liga**: Filtra por liga (CBLOL, LCK, LPL, LEC, LCS, Mundial)
- **Leitor de Notícias Interno**: Proxy para exibir conteúdo completo sem sair do site
- **API RESTful**: Endpoints simples e fáceis de consumir
- **Tratamento de Erros**: Fallback automático se uma fonte falhar

## 📦 Instalação

```bash
cd backend
npm install
```

## 🔧 Uso

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

O servidor rodará em `http://localhost:3000`

## 🌐 Endpoints da API

### GET `/api/news`
Retorna todas as notícias ou filtra por categoria.

**Parâmetros:**
- `category` (opcional): `all`, `cblol`, `lck`, `lpl`, `lec`, `lcs`, `worlds`

**Exemplos:**
```bash
# Todas as notícias
curl http://localhost:3000/api/news

# Apenas CBLOL
curl http://localhost:3000/api/news?category=cblol

# LCK (Coreia)
curl http://localhost:3000/api/news?category=lck

# LEC (Europa)
curl http://localhost:3000/api/news?category=lec

# LCS (América do Norte)
curl http://localhost:3000/api/news?category=lcs

# LPL (China)
curl http://localhost:3000/api/news?category=lpl

# Mundial
curl http://localhost:3000/api/news?category=worlds
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cblol-0-1747582844000",
      "title": "FURIA Esports vs LOUD - 17/05/2026 – Estatísticas",
      "url": "https://news.google.com/rss/articles/...",
      "source": "Google News",
      "category": "cblol",
      "publishedAt": "Mon, 18 May 2026 02:40:44 GMT",
      "summary": "Confira as estatísticas completas do jogo...",
      "imageUrl": "https://example.com/image.jpg",
      "author": "Mais Esports"
    }
  ],
  "count": 545,
  "timestamp": "2026-05-18T12:37:24.000Z"
}
```

### GET `/api/news/categories`
Retorna a lista de categorias disponíveis.

**Resposta:**
```json
{
  "success": true,
  "data": [
    { "id": "all", "name": "Todas", "description": "Todas as notícias de LoL" },
    { "id": "cblol", "name": "CBLOL", "description": "Notícias do Campeonato Brasileiro" },
    { "id": "lck", "name": "LCK", "description": "Notícias da Liga Coreana" },
    { "id": "lpl", "name": "LPL", "description": "Notícias da Liga Chinesa" },
    { "id": "lec", "name": "LEC", "description": "Notícias da Liga Europeia" },
    { "id": "lcs", "name": "LCS", "description": "Notícias da Liga Norte-Americana" },
    { "id": "worlds", "name": "Mundial", "description": "Notícias sobre o Campeonato Mundial" }
  ]
}
```

### GET `/api/news/content?url=<url>`
Retorna o conteúdo completo de uma notícia para exibição interna (proxy).

**Parâmetros:**
- `url` (obrigatório): URL codificada da notícia original

**Exemplo:**
```bash
curl "http://localhost:3000/api/news/content?url=https%3A%2F%2Fexample.com%2Fnoticia"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/noticia",
    "title": "Título da Notícia",
    "content": "<p>Conteúdo HTML limpo da notícia...</p>",
    "imageUrl": "https://example.com/imagem.jpg",
    "publishedAt": "2026-05-18T12:00:00.000Z",
    "author": "Autor da Notícia",
    "source": "example.com"
  }
}
```

### GET `/health`
Health check da API.

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-18T12:37:24.000Z"
}
```

## 🗂️ Estrutura do Projeto

```
backend/
├── src/
│   ├── server.js              # Servidor Express principal
│   └── routes/
│       └── newsRoutes.js      # Rotas da API de notícias
├── services/
│   ├── newsService.js         # Serviço de busca de RSS
│   └── newsContentService.js  # Serviço de proxy para conteúdo de notícias
├── test-news.js               # Script de teste
├── package.json
└── README.md
```

## 🧪 Testes

Execute o script de teste:
```bash
node test-news.js
```

## 📝 Fontes RSS Atuais

- **Google News Brasil**: Notícias gerais de League of Legends
- **Google News CBLOL**: Focado no campeonato brasileiro
- **Google News LCK**: Liga Coreana
- **Google News LPL**: Liga Chinesa
- **Google News LEC**: Liga Europeia
- **Google News LCS**: Liga Norte-Americana
- **Google News Worlds**: Campeonato Mundial

## ⚙️ Configuração

Para adicionar novas fontes RSS, edite o arquivo `services/newsService.js`:

```javascript
const RSS_FEEDS = {
  all: 'https://news.google.com/rss/search?q=League+of+Legends',
  cblol: 'https://news.google.com/rss/search?q=CBLOL',
  lck: 'https://news.google.com/rss/search?q=LCK+League+of+Legends',
  lpl: 'https://news.google.com/rss/search?q=LPL+League+of+Legends',
  lec: 'https://news.google.com/rss/search?q=LEC+League+of+Legends',
  lcs: 'https://news.google.com/rss/search?q=LCS+League+of+Legends',
  worlds: 'https://news.google.com/rss/search?q=Worlds+LoL',
};
```

## 🛠️ Tecnologias

- **Node.js** (ES Modules)
- **Express** - Framework web
- **rss-parser** - Parser de feeds RSS
- **axios** - Cliente HTTP para proxy de conteúdo
- **cheerio** - Parser HTML para extração de conteúdo
- **cors** - Middleware CORS

## 📄 Licença

MIT
