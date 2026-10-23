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
- Login com segundo fator TOTP (obrigatório para Admin) e códigos de recuperação cifrados, sessão de 12 h de inatividade com teto de 7 dias, sessão recente para ações sensíveis, rate limit, Argon2id, logout, sair de todos, senha temporária, troca forçada, `bosun admin create` e `bosun admin unlock` ([Autenticação](../tech/auth.md)).
- Papéis fixos e o guarda de autorização no servidor; convite por link ([Papéis](../product/role.md)).
- Criar e trocar de workspace.
- Cifra AES-256-GCM para segredos (`Integration.encrypted_credentials`).
- VPS com Coolify, Cloudflare Tunnel, Tailscale, disco cifrado e o checklist CIS; backup diário e **uma restauração testada** ([Deploy](../tech/deployment.md)).

## Portar do CRMv2

Cifra, verificação de webhook, logger com redação, início do pg-boss e CSP. CI/CD e design system **não**: CI/CD em [CI/CD](../tech/cicd.md); design system novo antes desta fatia. Caminhos no [mapa de porte](../tech/crmv2-review.md).

## Spec

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

## Ao terminar

Acrescente ao `AGENTS.md` os comandos exatos (instalar, lint, typecheck, testes, migrations, ambiente local) e preencha o `resource` dos conceitos que a fatia materializou.

## Relations

- details: [Arquitetura](../tech/architecture.md)
- depends_on: [Papéis](../product/role.md)
- governed_by: [ADR-111 — Arquitetura, operação e privacidade](../decisions/adr-111-architecture.md)
