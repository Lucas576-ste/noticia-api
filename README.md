# noticia-api

API RESTful para gerenciamento de notícias, construída com **NestJS** + **TypeScript**,
persistência via **TypeORM** em **PostgreSQL**, e execução local via **Docker**/**Docker Compose**.

## Stack

- [NestJS](https://nestjs.com/) (TypeScript)
- [TypeORM](https://typeorm.io/) + PostgreSQL
- `class-validator` / `class-transformer` para validação de payload
- Jest + `jest-cucumber` (testes e2e/BDD) + Supertest
- Docker / Docker Compose

## Configuração local

1. Instalar dependências:
   ```bash
   npm install
   ```
2. Criar o arquivo de variáveis de ambiente a partir do exemplo:
   ```bash
   cp .env.example .env
   ```
   Variáveis esperadas (ver `.env.example` e `src/app.module.ts`):

   | Variável       | Padrão (se ausente) |
   |----------------|----------------------|
   | `DB_HOST`      | `localhost`          |
   | `DB_PORT`      | `5432`               |
   | `DB_USERNAME`  | `postgres`           |
   | `DB_PASSWORD`  | `postgres`           |
   | `DB_DATABASE`  | `noticia_api`        |

3. Banco de dados: não há migrations neste projeto. O TypeORM está configurado com
   `synchronize: true` (`src/app.module.ts`), então o schema (tabela `noticias`) é criado/atualizado
   automaticamente ao subir a aplicação, a partir da entidade `Noticia`. Só é preciso ter um
   PostgreSQL acessível nas variáveis acima antes de iniciar a API — local ou via Docker Compose
   (próxima seção).

## Executando a aplicação

### Sem Docker

Requer um PostgreSQL rodando localmente (ou acessível) com as credenciais do `.env`.

```bash
npm run start:dev
```

A API sobe em `http://localhost:3000` (ou na porta definida em `PORT`).

### Com Docker Compose

Sobe a API e o PostgreSQL juntos, sem precisar de nada instalado além do Docker:

```bash
docker compose up --build
```

- Serviço `db`: PostgreSQL 15, com healthcheck — a `api` só inicia depois que o banco responde.
- Serviço `api`: build do `Dockerfile` (multi-stage), publicado em `http://localhost:3000`.
- O banco não expõe porta ao host (só a `api` acessa via rede interna do Compose, hostname `db`) —
  evita conflito com outros PostgreSQL que você já tenha rodando localmente.

Para derrubar:
```bash
docker compose down
```

## Rodando os testes

```bash
# testes unitários
npm run test

# testes e2e / BDD (jest-cucumber)
npm run test:e2e
```

- `npm run test` roda os specs unitários (`src/**/*.spec.ts`).
- `npm run test:e2e` roda `test/app.e2e-spec.ts` e `test/noticia.e2e-spec.ts` — este último são os
  cenários BDD de criação de notícia, escritos em Gherkin (`test/features/criacao-noticia.feature`)
  e ligados via `jest-cucumber`. Nenhum dos dois precisa de um PostgreSQL real: o `Repository` do
  TypeORM é mockado nos testes de `noticia.e2e-spec.ts`.

**Dentro do container**: a imagem de produção gerada pelo `Dockerfile` não inclui `devDependencies`
nem a pasta `test/` (removidos de propósito para manter a imagem enxuta) — os testes não rodam
dentro dela. Rode os testes no host, como acima, antes ou depois de usar o Docker Compose.

## Endpoints

Base: `/noticias`

| Método   | Rota             | Descrição                                              |
|----------|------------------|----------------------------------------------------------|
| `POST`   | `/noticias`      | Cria uma notícia (`{ titulo, descricao }`)               |
| `GET`    | `/noticias`      | Lista notícias, paginado e filtrável (ver query params)  |
| `GET`    | `/noticias/:id`  | Busca uma notícia por id (`404` se não existir)          |
| `PATCH`  | `/noticias/:id`  | Atualiza `titulo` e/ou `descricao` de uma notícia         |
| `DELETE` | `/noticias/:id`  | Remove uma notícia (`204 No Content`)                     |

### Query params de `GET /noticias`

| Param    | Obrigatório | Padrão | Descrição                                              |
|----------|-------------|--------|----------------------------------------------------------|
| `page`   | não         | `1`    | Página atual                                              |
| `limit`  | não         | `10`   | Itens por página                                          |
| `search` | não         | —      | Filtra por `titulo` OU `descricao` (case-insensitive, `ILIKE`) |

Resposta:
```json
{ "data": [ { "id": 1, "titulo": "...", "descricao": "..." } ], "total": 1, "page": 1, "limit": 10 }
```

### Validação de payload

`POST`/`PATCH` validam o corpo via `class-validator` (DTOs em `src/noticia/dto/`). O `ValidationPipe`
global (`src/main.ts`) usa `whitelist` + `forbidNonWhitelisted`: campos fora do DTO (ex: `autor`,
`conteudo`) são rejeitados com `400`, não apenas ignorados.
