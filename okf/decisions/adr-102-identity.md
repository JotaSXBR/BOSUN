---
type: ADR
title: ADR-102 — Identidade, acesso e papéis
description: Login com senha, sessão revogável, recuperação pelo Admin e três papéis fixos verificados no servidor.
domain: identidade
tags: [bosun, adr, auth, sessão, papéis]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# ADR-102 — Identidade, acesso e papéis

**Status:** vigente, em draft. Fonte única do domínio. A matriz granular aprovada em 2026-10-22 foi substituída pelos papéis fixos abaixo e foi para o [later.md](../product/later.md).

## Decisões

1. Login por **usuário ou e-mail + senha**; sem login social. Senha com **Argon2id** ([ADR-111](adr-111-architecture.md)).
2. Convite por link; o convidado define a senha no aceite.
3. Esqueceu a senha: o pedido na tela de login avisa o Admin dentro do produto. O Admin define uma **senha temporária**, e o próximo login **força a troca**. A nova senha não pode ser igual à atual.
4. Último recurso: `bosun admin unlock <email>` na VPS gera senha temporária com troca forçada, auditada com o ator **operador**.
5. Cada login é uma linha em **`Session`** (`id`, `user_id`, `active_workspace_id`, `user_agent`, `ip`, `created_at`, `last_seen_at`, `expires_at`, `revoked_at`, `revoked_reason`). A sessão é do **Better Auth**, guardada no banco; toda requisição confere a sessão e a revogação.
6. Expiração **fixa de 12 h**, sem renovação deslizante. Trocar de workspace atualiza `active_workspace_id`.
7. Trocar senha, sair de todos e remover do workspace revogam as sessões. Mudar o papel não revoga, porque a permissão é resolvida no servidor a cada requisição.
8. **Três papéis fixos por workspace**: **Admin** (configura canais, integrações, membros, fluxos e vê a auditoria), **Membro** (opera atendimento, CRM, posts, tarefas, projetos, calendário e documentos), **Viewer** (só leitura). Sem matriz editável, exceções por membro, times nem Manager.
9. **Atendente** é função, não papel. **Agente** é reservado para IA.
10. Permissão nunca vem do cliente; a autorização é sempre no servidor.
11. Sem segundo fator, chave de recuperação, trava de inatividade nem reautenticação por ação no piloto.
12. **Workspace, membro e convite usam o plugin `organization` do Better Auth** (organização = workspace, `member` = Membership, `invitation` = Invite, `activeOrganizationId` = `active_workspace_id`). Os três papéis são os papéis do plugin. Contas, criação pela CLI, revogação de sessões e bloqueio usam o plugin `admin`. Decidido em 2026-10-23.
13. **Isolamento por `workspace_id`:** extensão de query do Prisma ligada ao workspace da requisição, mais o teste de repositório; sem RLS no Postgres no piloto (uma VPS por cliente). Decidido em 2026-10-23.

## Relations

- details: [Papéis](../product/role.md)
- governed_by: [ADR-111 — Arquitetura, operação e privacidade](adr-111-architecture.md)
