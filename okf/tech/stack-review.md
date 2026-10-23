---
type: Research Notes
title: Revisão da stack e do deploy
description: Pesquisa de 2026-10-23 comparando a stack da BOSUN com o mercado, com recomendações para Coolify, configuração pela UI e integrações.
tags: [bosun, stack, coolify, pesquisa, deploy]
status: draft
stale_after: 2027-04-23
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
sources:
  - id: authjs-better-auth
    resource: https://www.better-auth.com/blog/authjs-joins-better-auth
    title: Auth.js is now part of Better Auth
  - id: drizzle-prisma
    resource: https://makerkit.dev/blog/tutorials/drizzle-vs-prisma
    title: Drizzle vs Prisma ORM in 2026
  - id: pgboss
    resource: https://www.pkgpulse.com/guides/bullmq-vs-bee-queue-vs-pg-boss-job-queues-nodejs-2026
    title: BullMQ vs Bee-Queue vs pg-boss (2026)
  - id: chatwoot
    resource: https://developers.chatwoot.com/self-hosted/deployment/requirements
    title: Chatwoot self-hosted requirements
  - id: postiz
    resource: https://postiz.com/hiring
    title: Postiz hiring (stack)
  - id: mixpost
    resource: https://packagist.org/packages/inovector/mixpost
    title: Mixpost (Packagist)
  - id: coolify-concepts
    resource: https://coolify.io/docs/get-started/concepts
    title: Coolify concepts (projects and environments)
  - id: coolify-compose
    resource: https://coolify.io/docs/knowledge-base/docker/compose
    title: Coolify Docker Compose and magic environment variables
  - id: coolify-image
    resource: https://coolify.io/docs/applications/deployments/docker-image
    title: Coolify deploy a Docker image
  - id: coolify-api
    resource: https://coolify.io/docs/api-reference/authorization
    title: Coolify API authorization
  - id: coolify-preview
    resource: https://coolify.io/docs/applications/deployments/preview-deployments
    title: Coolify preview deployments
  - id: n8n-security
    resource: https://docs.n8n.io/privacy-security/security
    title: Security at n8n
  - id: ig-login
    resource: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
    title: Instagram API with Instagram Login
  - id: wa-pricing
    resource: https://developers.facebook.com/docs/whatsapp/pricing
    title: Pricing on the WhatsApp Business Platform
  - id: yt-quota
    resource: https://developers.google.com/youtube/v3/determine_quota_cost
    title: YouTube Data API quota costs
  - id: kiwify-webhook
    resource: https://help.kiwify.com/en/article/understanding-webhook-functionality-15to8j/
    title: Kiwify webhook functionality
---

# Revisão da stack e do deploy

Pesquisa de 2026-10-23, feita para decidir a stack antes da Fatia 0. Nada aqui é decisão até entrar no [ADR-111](../decisions/adr-111-architecture.md). Fontes de blogs e guias de terceiros foram tratadas como indício, não como fato; onde a fonte é oficial, está dito.

## O que o mercado usa

| Produto | Função parecida | Stack | Lição para a BOSUN |
|---|---|---|---|
| Chatwoot | caixa multicanal | Rails + Vue, Sidekiq, PostgreSQL, Redis; web e worker em processos separados, mesma imagem[^chatwoot] | Worker separado do web é padrão; o Chatwoot configura canais por `.env` e reinício, que é o que queremos evitar |
| Postiz | agendador de posts | NestJS + Next.js + Temporal[^postiz] | Monorepo TypeScript; Temporal é pesado para uma VPS pequena |
| Mixpost | agendador de posts | Laravel + Vue/Inertia, Horizon, MySQL, Redis[^mixpost] | Fila obrigatória para publicar; também separa worker |

Os três rodam **web + worker + banco + (Redis)**. A BOSUN dispensa o Redis usando o próprio Postgres como fila.

## Aplicação

| Item | Hoje | Recomendação | Motivo |
|---|---|---|---|
| Framework | Next.js full-stack | **Manter**, com um processo **worker** separado, da mesma imagem | Um repositório TypeScript serve bem a uma pessoa com IA; o worker fora do Next evita jobs longos no processo web e problemas de build |
| Auth | Auth.js | **Trocar por Better Auth** | O time do Better Auth assumiu o Auth.js em 2025 e recomenda Better Auth para projetos novos; o Auth.js v5 nunca saiu do beta[^authjs-better-auth]. O Better Auth guarda sessão no banco, o que casa com a tabela `Session` do ADR-102 |
| ORM | Prisma | **Manter Prisma 7** (Drizzle é alternativa equivalente) | O Prisma 7 tirou o motor em Rust e fechou a distância para o Drizzle; para servidor em container a diferença de desempenho é pequena[^drizzle-prisma] |
| Fila | pg-boss | **Manter** | Sem Redis, com enfileiramento dentro da transação do banco; o BullMQ só vale se precisar de fluxos e painel prontos[^pgboss] |
| Mídia | RustFS | Manter | Sem achado contra |
| Tempo real (chat do site) | aberto | Decidir na Fatia 9 | SSE pelo próprio Next resolve o widget; WebSocket só se precisar de mão dupla intensa |

## Deploy no Coolify

### Ambientes stable e beta

- No Coolify, um **projeto** agrupa **ambientes** (production, staging…), cada um com as próprias variáveis[^coolify-concepts]. Não existe um botão de "promover" do beta para o stable; o padrão é implantar a **mesma imagem com tag fixa** nos dois e trocar a tag[^coolify-image].
- **Recomendação:**
  1. O CI (GitHub Actions) gera **uma imagem por versão** (`ghcr.io/…/bosun:1.4.0`), uma vez só.
  2. **Beta** roda num servidor do operador (um VPS seu), com dados de teste e contas de teste da Meta, Google e WhatsApp. Não fica na VPS da cliente: os webhooks da Meta, a sessão do WhatsApp e o número são únicos por instalação e não se duplicam sem conflito.
  3. **Stable** é a VPS de cada cliente. Promover = mudar a tag da imagem no app do cliente e implantar, pela API do Coolify (token com permissão por time)[^coolify-api] ou à mão no painel.
  4. Os previews de pull request do Coolify servem para desenvolvimento, com credenciais que não são de produção[^coolify-preview].
- Migrations em expandir/contrair (já no ADR-111) permitem voltar a tag anterior se a versão nova falhar.

### Um compose, quase nenhuma variável manual

- A BOSUN entra no Coolify como **um Docker Compose** com `web`, `worker`, `postgres`, `waha` e `rustfs`.
- O Coolify gera e guarda sozinho as variáveis `SERVICE_URL_*`, `SERVICE_PASSWORD_*`, `SERVICE_HEX_*` e `SERVICE_BASE64_*`, que persistem entre implantações[^coolify-compose]. Assim o domínio, a senha do banco, a chave do WAHA, as credenciais do RustFS, o segredo de sessão e a **chave mestra** nascem sem digitação.
- **Tudo o que é de integração vai para a UI da BOSUN** (Configurações > Integrações, só o Admin): app da Meta, cliente OAuth do Google e do YouTube, segredo do webhook da Kiwify, chaves VAPID (geradas no primeiro boot), URL do WAHA. Ficam no banco, cifrados com AES-256-GCM pela chave mestra, como faz o n8n com as credenciais[^n8n-security].
- **Risco:** perder a chave mestra é perder todas as credenciais. Ela precisa de um backup próprio, separado do backup do banco (o operador guarda; o setup mostra um aviso).
- Resultado esperado: instalar uma cliente nova = criar o recurso a partir do compose no Coolify, apontar o domínio e abrir a BOSUN. Zero variável digitada, exceto se o operador quiser sobrescrever.

## Integrações

- **Instagram:** a API com Instagram Login permite DM e comentários **sem página do Facebook** ligada à conta profissional (fonte oficial da Meta)[^ig-login]. Escopos: `instagram_business_basic`, `instagram_business_manage_messages`, `instagram_business_manage_comments` e `instagram_business_content_publish`. O Facebook (Messenger e comentários da página) continua pelo Facebook Login. Isso simplifica o setup: a conexão do Instagram e a do Facebook ficam separadas.
- **WhatsApp:** WAHA para conversas de entrada (escolha do usuário, já testada). Campanhas no futuro pela **Cloud API oficial**, cobrada por template entregue, com o marketing sempre pago e cobrança em BRL disponível desde julho de 2026[^wa-pricing]. As duas ficam atrás do `WhatsAppProvider`. **A conferir antes das campanhas:** se o mesmo número pode ficar no WAHA e na Cloud API ao mesmo tempo, ou se as campanhas usam outro número.
- **YouTube:** em dezembro de 2025 o Google reduziu o custo do upload; guias falam em cerca de 100 unidades ou um teto de 100 uploads por dia por projeto, mas as fontes divergem[^yt-quota]. Para o piloto sobra; conferir na página de cotas do projeto no Google Cloud.
- **Kiwify:** a ajuda oficial confirma webhook em JSON configurado em Apps > Webhooks, mas não documenta publicamente os campos de rastreio[^kiwify-webhook]. A Fatia 5 começa com um webhook de teste para ver o JSON real.

## Decisões para o usuário

1. Better Auth no lugar do Auth.js.
2. Worker separado, mesma imagem.
3. Beta num servidor do operador e stable nas VPS das clientes, com promoção por tag de imagem.
4. Compose único com variáveis geradas pelo Coolify e integrações configuradas pela UI da BOSUN.
5. Conexões separadas de Instagram (Instagram Login) e Facebook.
6. Prisma 7 mantido (ou Drizzle).

[^authjs-better-auth]: Auth.js is now part of Better Auth
[^drizzle-prisma]: Drizzle vs Prisma ORM in 2026
[^pgboss]: BullMQ vs Bee-Queue vs pg-boss (2026)
[^chatwoot]: Chatwoot self-hosted requirements
[^postiz]: Postiz hiring (stack)
[^mixpost]: Mixpost (Packagist)
[^coolify-concepts]: Coolify concepts (projects and environments)
[^coolify-compose]: Coolify Docker Compose and magic environment variables
[^coolify-image]: Coolify deploy a Docker image
[^coolify-api]: Coolify API authorization
[^coolify-preview]: Coolify preview deployments
[^n8n-security]: Security at n8n
[^ig-login]: Instagram API with Instagram Login
[^wa-pricing]: Pricing on the WhatsApp Business Platform
[^yt-quota]: YouTube Data API quota costs
[^kiwify-webhook]: Kiwify webhook functionality

## Relations

- details: [Stack](stack.md)
- details: [Deploy e operação](deployment.md)
- governed_by: [ADR-111 — Arquitetura, operação e privacidade](../decisions/adr-111-architecture.md)
