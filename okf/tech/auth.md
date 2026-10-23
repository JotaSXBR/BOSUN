---
type: Security Spec
title: Autenticação e sessão
description: Login, convite, senha temporária, chave de recuperação, sessão revogável, RBAC e auditoria.
tags: [bosun, auth, security, session, rbac]
status: stable
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
sources:
  - resource: https://authjs.dev/
    title: Auth.js documentation
  - resource: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
    title: OWASP Password Storage Cheat Sheet
---

# Autenticação e sessão

## Login

- Usuário/e-mail + senha.
- Sem login social no MVP.
- O Admin define o e-mail da conta.
- Contas convidadas criam usuário e senha pelo link de convite.
- Hash forte: **Argon2id** preferido; bcrypt aceitável.
- Rate limiting contra brute force.
- Mensagens de erro não revelam se o usuário existe.

## Convite

- Link com papel, validade e limite de uso.
- Token armazenado apenas como hash.
- O Admin define o e-mail da conta no convite; o convidado cria usuário e senha.
- Convite expirado ou esgotado não pode ser reutilizado.
- Aceite do convite é auditado.

## Troca de senha

1. Usuário solicita a troca.
2. BOSUN cria um **alerta interno** para o Admin e envia notificação por **Resend**.
3. Admin define uma **senha temporária**.
4. BOSUN marca `must_change_password`.
5. No próximo login, o usuário é forçado a definir uma nova senha.
6. A troca exige confirmação e complexidade padrão.
7. A ação é auditada.

O MVP rejeita uma nova senha idêntica à senha atual, comparando hashes; não mantém histórico de senhas anteriores. Ver [ADR-102](../decisions/adr-102-identity-access.md).

## Recuperação de conta

Ver [ADR-102](../decisions/adr-102-identity-access.md).

- **Sem segundo fator no MVP.**
- **Chave de recuperação** gerada no onboarding, exibida uma vez e guardada fora do sistema; armazenada só como hash, de uso único, auditada e notificada ao ser usada.
- A chave redefine a senha **sem depender de e-mail** e, quando o segundo fator existir, também o dispensa.
- A chave pode ser regenerada por um Admin autenticado; a anterior deixa de valer.
- **Último caso:** `bosun admin unlock <email>` na VPS, pelo operador, com senha temporária, troca forçada e auditoria registrada como **operador**.
- **Código por e-mail foi descartado.** O segundo fator futuro é **app autenticador (TOTP)**, para Admin/Manager; **passkey** segue como evolução para login e desbloqueio.

## Sessão

- **Auth.js com JWT**, mais uma linha em `Session` por login ([ADR-102](../decisions/adr-102-identity-access.md)).
- O token carrega `sid`, `user_id`, `workspace_id` e `role_id`.
- Em toda rota autenticada o servidor resolve a sessão e verifica **revogada e expirada**.
- **Expiração absoluta de 12 h** (8/12/24 por workspace), contada da criação; sem renovação deslizante.
- **Trava por inatividade de 30 min** (15/30/60/desligada): cobre a tela e pede a senha, sem encerrar a sessão.
- **Reautenticação para ação sensível** quando a última prova de senha tem mais de 5 min.
- Revogar um dispositivo marca `revoked_at`; sair de todos revoga todas as linhas do usuário.
- Troca de senha, uso da chave de recuperação e remoção do workspace revogam as demais sessões.
- Mudança de papel **não** revoga: as permissões são resolvidas no servidor a cada requisição.
- Troca de workspace atualiza `active_workspace_id` e reemite o token.
- `last_seen_at` e `last_auth_at` são atualizados no máximo a cada 5 minutos.
- Permissões efetivas são resolvidas no servidor; não confiar em permissões do cliente.
- Cookies `HttpOnly`, `Secure` e `SameSite`; CSRF protection em mutações.
- A lista de dispositivos é capacidade posterior; o modelo já a suporta.

## RBAC

- Permissões granulares por recurso e ação.
- Quatro presets: Admin, Manager, Membro, Viewer.
- O Admin ajusta a matriz, mas não cria papéis.
- Guardas de autorização no servidor para toda ação.
- Mudança de papel ou permissão vale na requisição seguinte, porque as permissões são resolvidas no servidor; não é preciso revogar sessão.
- A UI mostra o que o papel pode fazer e por quê.

## Auditoria

Registrar, no mínimo:

- Login e logout.
- Falhas de autenticação relevantes.
- Criação, alteração e remoção de membros.
- Mudanças de papel/permissão.
- Troca de senha e revogação de sessão.
- Ações sensíveis em contatos, conversas e configurações.

## Pendências

- Provedor de e-mail: Resend já decidido; template e remetente a definir.
- Segundo fator por app autenticador (TOTP): pós-MVP; código por e-mail descartado.
- Passkey como login e desbloqueio: evolução.
- Tela de chave de recuperação no onboarding.
- Tela de dispositivos e revogação por dispositivo.
- Política de expurgo das linhas de sessão revogadas e expiradas.

## Links

- [ADR-102](../decisions/adr-102-identity-access.md)
- [ADR-102](../decisions/adr-102-identity-access.md)
- [Papéis e permissões](../product/roles-permissions.md)
- [Modelo de dados](data-model.md)
- [Wireframe de autenticação](../design/wireframes/auth.md)
- [ADR-102 — Reutilização de senha](../decisions/adr-102-identity-access.md)
- [ADR-102 — Recuperação de conta e segundo fator](../decisions/adr-102-identity-access.md)
