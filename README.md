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

## Estrutura do projeto e decisões técnicas

```
src/
  main.ts               # bootstrap + ValidationPipe global
  app.module.ts          # conexão TypeORM + registro dos módulos de feature
  noticia/
    entities/              # entidades TypeORM (schema do banco)
    dto/                    # contrato de entrada da API (create/update)
    noticia.controller.ts    # rotas HTTP
    noticia.service.ts       # regras de negócio + acesso ao Repository
    noticia.module.ts        # liga controller/service/repository
```

### Camadas e padrão de módulo

Cada feature (hoje só `noticia`) é um módulo autocontido: `controller` (HTTP) → `service` (regra de
negócio) → `Repository` do TypeORM (persistência), com `entities/` e `dto/` isolando,
respectivamente, o schema do banco e o contrato da API. O controller nunca fala direto com o
`Repository` — sempre passa pelo service. Isso mantém cada camada substituível de forma isolada: dá
pra trocar a origem dos dados (outro banco, outro ORM, uma API externa) reimplementando só o
`service`/`Repository`, sem tocar no `controller` nem no contrato HTTP.

### Por que DTOs + `ValidationPipe` global

DTOs (`CreateNoticiaDto`/`UpdateNoticiaDto`) descrevem exatamente o que a API aceita, com validação
via `class-validator` diretamente nas propriedades. Como o `ValidationPipe` é global
(`src/main.ts`), toda rota nova ganha validação de payload automaticamente, sem precisar repetir
lógica de validação em cada controller — reduz boilerplate e evita inconsistência conforme a API
cresce.

### Preparação para escalar

- **Novos módulos seguem o mesmo padrão**: adicionar uma nova entidade de domínio é criar uma pasta
  `src/<feature>/` com a mesma forma (`entities/`, `dto/`, `*.controller.ts`, `*.service.ts`,
  `*.module.ts`) e registrar o módulo em `app.module.ts` — sem precisar mexer nos módulos existentes.
- **Camadas testáveis isoladamente**: os testes e2e (`test/noticia.e2e-spec.ts`) mockam o
  `Repository` do TypeORM (`getRepositoryToken`), testando o `controller`+`service`+validação sem
  precisar de banco real — o que mantém a suíte rápida e determinística à medida que mais endpoints
  forem adicionados.
- **Configuração via ambiente**: toda credencial/host de banco vem de variáveis de ambiente
  (`DB_*`), então o mesmo build (imagem Docker) roda em ambientes diferentes (dev, CI, produção)
  sem alterar código, só variando as env vars — inclusive trocando de instância/servidor de banco.

### Banco de dados: `synchronize` vs. migrations

`synchronize: true` foi usado na configuração do TypeORM (`src/app.module.ts`) por este ser um
ambiente de teste/desenvolvimento. Em produção, a abordagem correta é desativar essa opção e usar
migrations do TypeORM para versionar e aplicar alterações de schema de forma controlada.

### Variáveis de ambiente e segredos

`.env.example` documenta as variáveis de ambiente necessárias para conectar ao PostgreSQL
(`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`). O arquivo `.env` real está no
`.gitignore` por conter credenciais e não deve ser commitado.
