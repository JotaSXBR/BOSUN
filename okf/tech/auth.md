---
type: Security Spec
title: Autenticação e sessão
description: Login com Argon2id, convite, senha temporária gerada para o Admin, unlock pela CLI, sessão revogável e papéis fixos.
tags: [bosun, auth, sessão, segurança]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Autenticação e sessão

Decisões em [ADR-102](../decisions/adr-102-identity.md).

## Login

- Usuário ou e-mail + senha; sem login social.
- Hash **Argon2id**; rate limiting por IP e por conta; mensagem de erro que não revela se o usuário existe.

## Convite

- Link com papel, validade de 7 dias e uso único; token guardado só como hash.
- O convidado define usuário e senha no aceite; o aceite é auditado.

## Senha esquecida ou troca

1. Na tela de login, "esqueci a senha" cria um `PasswordResetRequest` e avisa o Admin dentro do produto.
2. O Admin pede e a BOSUN gera uma **senha temporária**, mostrada uma vez e válida por 72 h; marca `must_change_password`.
3. No próximo login, a pessoa define uma senha nova, diferente da atual (comparação pelo hash).
4. Tudo é auditado; trocar a senha revoga as outras sessões.
5. Último recurso: `bosun admin unlock <email>` na VPS, com senha temporária, troca forçada e auditoria com ator **operador**.

## Sessão

- **Better Auth** com sessão no banco; uma linha em `Session` por login (conferir na Fatia 0 como mapear os campos do ADR-102 no modelo de sessão do Better Auth).
- Toda rota autenticada resolve a sessão no banco e verifica expiração; revogar apaga a linha. No máximo 5 sessões por pessoa. Senha de 12 a 128. TOTP de uso único (`UsedTotpCode`); step-up é novo login que revoga a sessão antiga. Setup 2FA sem QR no piloto; contas nascem com `emailVerified: true` e não há bloqueio de conta.
- **12 h sem atividade** derrubam a sessão, com teto absoluto de 7 dias; segundo fator TOTP obrigatório para todos; sessão recente (10 min) para ações sensíveis ([ADR-102](../decisions/adr-102-identity.md) itens 6 e 11). `last_seen_at` atualizado no máximo a cada 5 min.
- Sair de todos, trocar a senha e remover do workspace revogam as sessões. Mudança de papel não revoga.
- Trocar de workspace atualiza `active_workspace_id`.
- Cookies `__Secure-`, `HttpOnly`, `Secure` e `SameSite=Lax`; proteção CSRF nas mutações.

## Autorização

- Três papéis fixos por workspace ([Papéis](../product/role.md)), lidos de `Membership` a cada requisição.
- Um guarda de autorização no servidor para toda ação; nunca confiar no cliente.
- Toda consulta filtra pelo `workspace_id` da sessão.

## Auditoria

Login e logout, falhas relevantes, convites e remoções, mudança de papel, troca e reset de senha, revogação de sessão e ações sensíveis listadas no [ADR-111](../decisions/adr-111-architecture.md).

## Relations

- governed_by: [ADR-102 — Identidade, acesso e papéis](../decisions/adr-102-identity.md)
- details: [Papéis](../product/role.md)
