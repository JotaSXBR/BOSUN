---
type: Execution Slice
title: Fatia 0 — Fundação
description: Scaffold, banco, login, papéis, workspace, auditoria, CI e uma VPS com backup restaurado, prontos para a fatia 1.
tags: [bosun, plano, fatia, fundação]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Fatia 0 — Fundação

**Objetivo:** a piloto consegue entrar numa BOSUN real, na VPS dela, com segurança. Nada de produto ainda; a base para a fatia 1 ir ao ar.

**Em paralelo, fora do código (começar no dia 1):** criar o app da Meta e pedir o App Review e a verificação do negócio; criar o projeto no Google Cloud e pedir a verificação dos escopos de Contatos, Agenda e YouTube ([Canal](../product/channel.md)).

## Escopo

- Scaffold Next.js + TypeScript, Prisma + PostgreSQL, Better Auth, Tailwind/shadcn, pg-boss ([Stack](../tech/stack.md)); docker compose local com Postgres, WAHA e RustFS.
- **Projeto-piloto de 1 hora primeiro:** Next.js 16.3 + Prisma 7 + Better Auth + TS 7 + Oxlint compilam e passam juntos; se não, voltar ao TS 6 e registrar no ADR-111.
- Oxlint, typecheck (TS 7), Vitest e Playwright configurados; CI na ordem do [padrão de qualidade](../tech/quality-gate.md).
- Docker Compose para o Coolify (`web`, `worker`, `postgres`, `waha`, `rustfs`) com variáveis geradas; tela de integrações com credenciais cifradas.
- Entidades `Environment`, `Workspace`, `User`, `Membership`, `Invite`, `Session`, `PasswordResetRequest`, `AuditLog`, `Integration` ([Modelo de dados](../tech/data-model.md)).
- Login com segundo fator TOTP (obrigatório para todos) e códigos de recuperação cifrados, sessão de 12 h de inatividade com teto de 7 dias, sessão recente para ações sensíveis, rate limit, Argon2id, logout, sair de todos, senha temporária, troca forçada, `bosun admin create` e `bosun admin unlock` ([Autenticação](../tech/auth.md)).
- Papéis fixos e o guarda de autorização no servidor; convite por link ([Papéis](../product/role.md)).
- Criar e trocar de workspace.
- Cifra AES-256-GCM para segredos (`Integration.encrypted_credentials`).
- VPS com Coolify, Cloudflare Tunnel, Tailscale, disco cifrado e o checklist CIS; backup diário e **uma restauração testada** ([Deploy](../tech/deployment.md)).

## Portar do CRMv2

Cifra, verificação de webhook, logger com redação, início do pg-boss e CSP. CI/CD e design system **não**: CI/CD em [CI/CD](../tech/cicd.md); design system novo antes desta fatia. Caminhos no [mapa de porte](../tech/crmv2-review.md).

## Mapa de módulos

Aprovado em 2026-10-23 (`/agent-skills:spec`, fase 0). Os ids são fixos; cada módulo tem a sua spec abaixo, escrita na ordem.

| Módulo | O que cobre | Depende de |
|---|---|---|
| `toolchain` | Projeto-piloto, scaffold, compose local, padrão de qualidade, `ci.yml` | — |
| `identity` | Login, Argon2id, senha, TOTP, códigos de recuperação, sessão, rate limit, troca forçada, CLI `bosun admin` | toolchain |
| `workspace` | Organization, member, invitation, papéis, guarda no servidor, extensão `workspace_id`, seletor | identity |
| `audit` | `AuditLog` e os eventos auditados | identity, workspace |
| `secrets` | Cifra AES-256-GCM, `Integration`, tela de integrações | workspace, audit |
| `delivery` | Compose do Coolify, `release.yml`, beta, `/api/health`, smoke, backup e restauração | toolchain (fecha depois de todos) |

Ordem: `toolchain` → `identity` → `workspace` → `audit` → `secrets`; `delivery` começa depois do `toolchain`, em paralelo.

Áreas comuns a todos os módulos, não repetidas aqui: [Stack](../tech/stack.md), [Engenharia](../tech/engineering.md) (estrutura, estilo, fronteiras), [Padrão de qualidade](../tech/quality-gate.md), [Estratégia de testes](../tech/test-strategy.md), [CI/CD](../tech/cicd.md).

## Spec

### toolchain

**Objetivo:** um repositório que instala, compila, passa no padrão de qualidade e roda localmente com um comando, antes de qualquer linha de produto. Usuário: quem desenvolve (humano ou agente).

**Premissas:** aplicação Next.js única (sem monorepo), `web` e `worker` da mesma imagem; pnpm; Node LTS fixado no `.nvmrc`.

**Passo 1 — projeto-piloto (até 1 h, descartável, fora do repositório):** Next.js 16.3 com `experimental.useTypeScriptCli`, TS 7, Prisma 7 com uma tabela, Better Auth com email+senha, Oxlint + tsgolint. Passa se `tsc`, `oxlint`, `next build` e um login de teste funcionam. Se falhar: registrar no ADR-111 e usar TS 6 (ou Drizzle, se o problema for o Prisma).

**Comandos (os nomes viram scripts no `package.json`):**

```bash
pnpm install --frozen-lockfile
pnpm dev            # next dev + worker em watch
pnpm typecheck      # tsc --noEmit
pnpm lint           # oxlint --deny-warnings
pnpm test           # vitest run --coverage
pnpm test:int       # vitest run --project integration (Postgres e RustFS reais)
pnpm test:e2e       # playwright test
pnpm dup            # jscpd
pnpm db:migrate     # prisma migrate dev
pnpm verify         # typecheck + lint + test + dup + ./scripts/validate.sh ./okf
docker compose -f compose.dev.yml up -d   # postgres, rustfs, waha
```

**Estrutura:** a de [Engenharia](../tech/engineering.md); a fatia cria só as pastas que usa.

**Entrega:**
- `.oxlintrc.json` com as regras e limites do padrão de qualidade; `vitest.config.ts` com limites de cobertura; `.jscpd.json`.
- `compose.dev.yml` com Postgres, RustFS e WAHA; `.env.example` sem nenhum valor real.
- `.github/workflows/ci.yml` como em [CI/CD](../tech/cicd.md), ações fixadas por SHA; `dependabot.yml`; pre-commit com gitleaks.
- Página inicial mínima e o `worker` com um job de exemplo no pg-boss.

**Critério de aceite:**
1. Clone limpo + `pnpm install` + `docker compose up` + `pnpm dev` abre a página e o worker processa o job de exemplo.
2. `pnpm verify` sai 0.
3. Um PR com `any`, uma função de 61 linhas ou um segredo falso é **bloqueado** no CI (um caso por regra, em branch de teste).
4. O CI completo leva até 12 min.

**Limites:**
- Sempre: versões exatas no `package.json`; conferir a doc da versão (Context7) antes de configurar cada ferramenta.
- Perguntar antes: qualquer dependência fora da [Stack](../tech/stack.md); afrouxar um limite.
- Nunca: valor real no `.env.example`; domínio, IP ou dado da piloto no repositório.

**A conferir:** opções do `max-lines` no Oxlint, `oxlint-plugin-complexity` como jsPlugin, SHAs das ações.

### identity, workspace, audit, secrets, delivery

A escrever, um por vez, depois da aprovação da spec anterior. Rascunho atual abaixo, mantido como insumo.

#### Rascunho anterior

- Entidades: `Environment`, `Workspace`, `User`, `Membership`, `Invite`, `Session`, `PasswordResetRequest`, `AuditLog`, `Integration`.
- Rotas: login, logout, sair de todos, aceite de convite, troca de senha, pedido de reset; CLI `bosun admin create|unlock`.
- Telas: login, troca forçada, membros e convites, seletor de workspace.
- Transições: `must_change_password` → senha nova; `Session` ativa → revogada ou expirada.
- Fora: setup com checklist (Fatia 10), qualquer canal.

## Dependências

Nenhuma fatia. Bloqueio externo: VPS e domínio da piloto.

## Critério de aceite

1. O Admin criado pela CLI entra, troca a senha e convida um Membro, que entra pelo link.
2. Um Viewer recebe 403 numa ação de escrita, testada no servidor.
3. Uma consulta sem `workspace_id` não passa no teste de repositório.
4. A restauração do backup na VPS devolve o banco com os usuários.

## Testes

- Unitários: hash e verificação de senha, cifra, guarda de autorização.
- Integração: login, revogação de sessão, convite, troca forçada.
- E2E: login → troca de senha → convite → aceite.

## Perguntas abertas

Nenhuma no `toolchain`.

## Ao terminar

Acrescente ao `AGENTS.md` os comandos exatos (instalar, lint, typecheck, testes, migrations, ambiente local) e preencha o `resource` dos conceitos que a fatia materializou.

## Relations

- details: [Arquitetura](../tech/architecture.md)
- depends_on: [Papéis](../product/role.md)
- governed_by: [ADR-111 — Arquitetura, operação e privacidade](../decisions/adr-111-architecture.md)
