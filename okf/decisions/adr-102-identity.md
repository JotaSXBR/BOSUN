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
6. Sessão cai após **12 h sem atividade** (`expiresIn` + `updateAge`) e tem **teto absoluto de 7 dias** desde o login (checagem nossa sobre `created_at`; o Better Auth não tem teto nativo). Trocar de workspace atualiza `active_workspace_id`. Substitui a expiração fixa de 12 h em 2026-10-23.
7. Trocar senha, sair de todos e remover do workspace revogam as sessões. Mudar o papel não revoga, porque a permissão é resolvida no servidor a cada requisição.
8. **Três papéis fixos por workspace**: **Admin** (configura canais, integrações, membros, fluxos e vê a auditoria), **Membro** (opera atendimento, CRM, posts, tarefas, projetos, calendário e documentos), **Viewer** (só leitura). Sem matriz editável, exceções por membro, times nem Manager.
9. **Atendente** é função, não papel. **Agente** é reservado para IA.
10. Permissão nunca vem do cliente; a autorização é sempre no servidor.
11. **Segurança desde a Fatia 0** (2026-10-23, substitui o "sem segundo fator"):
    - **Segundo fator TOTP** (plugin `twoFactor`), compatível com Google Authenticator, Microsoft Authenticator, 1Password e semelhantes. **Obrigatório para todos os papéis** (ASVS 6.3.3; decidido em 2026-10-23). 10 códigos de recuperação, guardados **cifrados** (o padrão do plugin é texto puro). Perdeu o celular e os códigos: `bosun admin unlock` reseta o segundo fator, auditado.
    - **Sessão recente** para ações sensíveis (trocar senha, ligar ou mudar integração, remover membro, mudar papel, ver códigos de recuperação): `freshAge` de 10 minutos; fora disso, a BOSUN pede senha e código de novo.
    - **Limite de tentativas** no login e no código (`rateLimit` do Better Auth, guardado no banco).
    - **Argon2id** por `@node-rs/argon2` no `password.hash`/`verify` (o padrão do Better Auth é scrypt).
    - Alvo: **OWASP ASVS 5.0 nível 2** na autenticação e na sessão; os itens exatos entram na spec da Fatia 0.
12. **Workspace, membro e convite usam o plugin `organization` do Better Auth** (organização = workspace, `member` = Membership, `invitation` = Invite, `activeOrganizationId` = `active_workspace_id`). Os três papéis são os papéis do plugin. Contas, criação pela CLI, revogação de sessões e bloqueio usam o plugin `admin`. Decidido em 2026-10-23.
14. **Sessão opaca no banco**, sem JWT e com o `cookieCache` do Better Auth desligado: revogar vale na requisição seguinte. Cookie `__Host-`, `HttpOnly`, `Secure`, `SameSite=Lax`.
15. **Sem checagem de senha vazada** (exceção registrada ao ASVS 6.2.12, nível 2): fica só a lista de senhas comuns e palavras do contexto. Decidido em 2026-10-23.
13. **Isolamento por `workspace_id`:** extensão de query do Prisma ligada ao workspace da requisição, mais o teste de repositório; sem RLS no Postgres no piloto (uma VPS por cliente). Decidido em 2026-10-23.

## Relations

- details: [Papéis](../product/role.md)
- governed_by: [ADR-111 — Arquitetura, operação e privacidade](adr-111-architecture.md)
