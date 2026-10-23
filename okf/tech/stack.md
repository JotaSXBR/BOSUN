---
type: Technology Decision
title: Stack da aplicação
description: Opção A aprovada, justificativa, alternativas e pontos em aberto.
tags: [bosun, stack, nextjs, prisma, better-auth, postgres]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
sources:
  - resource: https://nextjs.org/docs
    title: Next.js documentation
  - resource: https://www.prisma.io/docs
    title: Prisma documentation
  - resource: https://www.better-auth.com/docs
    title: Better Auth documentation
  - resource: https://github.com/timgit/pg-boss
    title: pg-boss repository
  - resource: https://resend.com/docs
    title: Resend documentation
---

# Stack

Decidida em 2026-10-23, com base na [revisão da stack](stack-review.md). Fonte da decisão: [ADR-111](../decisions/adr-111-architecture.md).

## Decisão

- **Next.js full-stack (App Router) + TypeScript 7** (compilador nativo; `next build` com `experimental.useTypeScriptCli`).
- **Dois processos da mesma imagem:** `web` (Next.js) e `worker` (pg-boss), com o mesmo código.
- **PostgreSQL + Prisma 7**.
- **Better Auth** com sessão no banco (tabela `Session`) e revogação ([ADR-102](../decisions/adr-102-identity.md)).
- **Tailwind CSS + shadcn/ui**.
- **pg-boss** para jobs no PostgreSQL, sem Redis.
- **RustFS** para storage compatível com S3 (Apache 2.0).
- **Oxlint** (com tsgolint) para lint e **Vitest + Playwright** para testes; limites em [Padrão de qualidade](quality-gate.md).
- **Docker Compose no Coolify**, VPS com CIS Level 1, Tailscale e Cloudflare Tunnel ([Deploy](deployment.md)).
- Resend fica fora do piloto (o piloto não envia e-mail).

## Por que

- Um repositório TypeScript serve uma pessoa com IA; o worker separado segue o padrão do Chatwoot, Postiz e Mixpost.
- O Auth.js está em manutenção e o próprio time recomenda o Better Auth para projetos novos.
- O pg-boss enfileira dentro da transação do banco e dispensa o Redis.
- O TS 7 compila de 8 a 12 vezes mais rápido; o Oxlint substitui o typescript-eslint, que não roda no TS 7.

## Riscos

- TS 7 sem API do compilador: ferramentas que dependem dela não rodam. Se o Prisma 7 ou o Next.js falharem com o TS 7 no projeto-piloto da Fatia 0, voltamos ao TS 6 com Oxlint e registramos no ADR-111.
- Um app grande precisa de limites internos claros ([Engenharia](engineering.md)).
- A revogação de sessão consulta a `Session` a cada requisição.

## Relations

- governed_by: [ADR-111 — Arquitetura, operação e privacidade](../decisions/adr-111-architecture.md)
- part_of: [Arquitetura](architecture.md)
