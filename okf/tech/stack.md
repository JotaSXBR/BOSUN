---
type: Technology Decision
title: Stack da aplicação
description: Opção A aprovada, justificativa, alternativas e pontos em aberto.
tags: [bosun, stack, nextjs, prisma, authjs, postgres]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
sources:
  - resource: https://nextjs.org/docs
    title: Next.js documentation
  - resource: https://www.prisma.io/docs
    title: Prisma documentation
  - resource: https://authjs.dev/
    title: Auth.js documentation
  - resource: https://github.com/timgit/pg-boss
    title: pg-boss repository
  - resource: https://resend.com/docs
    title: Resend documentation
---

# Stack

**Opção A aprovada em 2026-10-21.**

## Decisão

- **Next.js full-stack (App Router) + TypeScript**.
- **PostgreSQL + Prisma**.
- **Auth.js** com **JWT + tabela `Session`** para sessões revogáveis e expiração curta ([ADR-102](../decisions/adr-102-identity-access.md)).
- **Tailwind CSS + shadcn/ui**.
- **pg-boss** para jobs no PostgreSQL.
- **RustFS** para storage S3-compatível (Apache 2.0).
- **Resend** para e-mail transacional.
- **Docker + Coolify + VPS CIS Level 1 + Tailscale + Cloudflare Tunnel**.
- **Vitest + Playwright** para testes.

## Por que A

- Menos serviços e um único deploy; ideal para uma pessoa + IA.
- Prisma é maduro, schema declarativo, migrations e client type-safe.
- Auth.js tem Credentials provider; a lógica de senha temporária e troca forçada fica no domínio.
- pg-boss evita Redis; webhooks e sync rodam como jobs no PostgreSQL.
- Next.js `output: "standalone"` é suportado para Docker.
- Grande base de exemplos e boa compatibilidade com agentes de IA.

## Alternativas

- **B — Drizzle:** mais leve e próximo de SQL, mas migrations e relações exigem mais disciplina manual; ecossistema menor.
- **C — NestJS + API separada:** boundaries fortes, mas mais boilerplate, dois deployables e mais contexto para uma pessoa + IA.
- **Supabase gerenciado:** acelera auth/banco/storage, mas adiciona dependência externa e dificulta o fluxo customizado de senha temporária.

## Consequências

- Um único app pode ficar grande; precisa de boundaries internos claros.
- A revogação de sessão exige resolver a linha de `Session` a cada requisição autenticada.
- O storage S3 adiciona um serviço e precisa entrar no backup.
- Prisma adiciona uma camada de abstração; consultas críticas precisam de revisão.

## Pontos em aberto

- Hash de senha: **Argon2id** (preferido) ou bcrypt.
- Política de reutilização de senha.
- Configuração fina do RustFS: single-node, backup e retenção.
- Valor final da expiração de sessão.
- Provedor de IA do copiloto.

## Links

- [ADR-111](../decisions/adr-111-architecture-operations.md)
- [Arquitetura](architecture.md)
- [Deploy](deploy.md)
