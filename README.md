# Império - Hambúrgueria e Pizzaria

Sistema completo de e-commerce e gestão de delivery, construído com Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma (MySQL) e NextAuth.js.

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Estilização**: Tailwind CSS (tema dark + vermelho/laranja "Império")
- **Banco de dados**: PostgreSQL (Neon) via Prisma ORM
- **Autenticação**: NextAuth.js (Credentials Provider)
- **Estado do carrinho**: Zustand
- **Validação**: Zod
- **Hospedagem**: Vercel

## Como rodar localmente

### 1. Pré-requisitos

- Node.js 18+
- Uma conta na [Neon](https://neon.tech) (tem plano free)

### 2. Criar o banco na Neon

1. Crie um projeto na Neon.
2. No painel do projeto, vá em **Connection Details**.
3. A Neon te dá duas strings de conexão importantes:
   - **Pooled connection** (com `-pooler` no host) → vai em `DATABASE_URL`
   - **Direct connection** (sem `-pooler`) → vai em `DIRECT_URL`

   Isso é necessário porque o Prisma Migrate não funciona bem através do pooler (PgBouncer) da Neon — ele precisa da conexão direta para rodar migrations, mas a aplicação em runtime deve usar a conexão com pooling (evita esgotar conexões em ambiente serverless).

### 3. Instalar dependências

```bash
npm install
```

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@ep-xxxx-pooler.sa-east-1.aws.neon.tech/imperio_db?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxxx.sa-east-1.aws.neon.tech/imperio_db?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere com: openssl rand -base64 32"
SEED_ADMIN_EMAIL="admin@imperio.com"
SEED_ADMIN_PASSWORD="escolha uma senha forte"
```

### 5. Rodar as migrations e o seed

```bash
npx prisma migrate dev --name init
npm run db:seed
```

Isso cria as tabelas no Postgres (Neon) e popula:
- Um usuário ADMIN (email/senha definidos no `.env`)
- 3 categorias (Pizzas, Hambúrgueres, Combos)
- 4 produtos de exemplo (2 pizzas elegíveis a 2 sabores, 1 burger, 1 combo)

### 6. Rodar o projeto

```bash
npm run dev
```

- Loja pública: http://localhost:3000
- Painel admin: http://localhost:3000/admin/login

### 6. Imagens dos produtos

O seed referencia imagens em `/public/images/*.jpg` que **não estão incluídas** neste pacote (para manter o download leve). Duas opções:

1. Adicione suas próprias fotos em `public/images/` com os mesmos nomes de arquivo usados no seed (`prisma/seed.ts`), ou
2. Edite o campo `imageUrl` de cada produto (no seed ou direto no admin) para apontar para URLs externas (ex: um bucket S3/Cloudinary).

## Estrutura do projeto

Veja a árvore de diretórios completa e a explicação da Clean Architecture adaptada ao Next.js na conversa anterior. Resumo rápido:

```
src/
├── app/              → rotas (App Router): (public), admin, api
├── modules/          → domain + application + infrastructure por contexto (product, order, auth)
├── actions/          → Server Actions (ponte UI -> use-cases)
├── components/       → componentes React (ui, public, admin)
├── lib/              → prisma client singleton, utils
├── hooks/            → hooks customizados (ex: polling do Kanban)
└── store/            → estado global (carrinho, via Zustand)
```

## Deploy na Vercel (com Neon)

1. Suba este repositório no GitHub/GitLab/Bitbucket.
2. Importe o projeto na Vercel ([vercel.com/new](https://vercel.com/new)).
3. Em **Settings > Environment Variables**, adicione (em Production e Preview):
   - `DATABASE_URL` → a *pooled connection* da Neon
   - `DIRECT_URL` → a *direct connection* da Neon
   - `NEXTAUTH_URL` → a URL final do seu domínio na Vercel, ex: `https://imperio.vercel.app`
   - `NEXTAUTH_SECRET` → gere com `openssl rand -base64 32`
4. Ajuste o **Build Command** em Settings > General para rodar as migrations antes do build:
   ```
   npx prisma migrate deploy && next build
   ```
   (o `postinstall` do `package.json` já roda `prisma generate` automaticamente a cada deploy)
5. Faça o deploy. Depois do primeiro deploy bem-sucedido, rode o seed **uma vez** apontando para o banco de produção:
   ```bash
   DATABASE_URL="<sua-pooled-url-de-producao>" DIRECT_URL="<sua-direct-url-de-producao>" npm run db:seed
   ```
   (rode isso localmente, na sua máquina — não precisa expor isso como rota pública)

### Observações importantes sobre Neon em produção

- A Neon "hiberna" o banco em planos free após um período sem uso — a primeira requisição depois disso pode demorar alguns segundos (cold start do compute). Isso é esperado e normal.
- Sempre use a **pooled connection** (`DATABASE_URL`) na aplicação — funções serverless da Vercel abrem/fecham conexões o tempo todo, e sem o pooler da Neon (PgBouncer) você estoura o limite de conexões simultâneas rapidamente.
- Se você trocar de região na Neon, lembre de atualizar as duas URLs (o host muda).

## Próximos passos sugeridos

- Trocar o polling do Kanban (`src/hooks/useOrderRealtime.ts`) por WebSocket/Pusher para latência menor.
- Adicionar upload de imagem direto no `ProductForm` (hoje aceita apenas URL).
- Adicionar testes automatizados nos use-cases (`src/modules/*/application/use-cases`), que já estão isolados de HTTP/Prisma justamente para facilitar isso.
- Implementar gateway de pagamento (Pix/cartão) no checkout — atualmente o pedido é criado com status `PENDING` e a confirmação de pagamento é manual pelo admin.
