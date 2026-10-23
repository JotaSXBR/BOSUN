---
type: ADR
title: ADR-102 — Identidade, acesso e permissões
description: Login, recuperação, sessão, senha e papéis com permissões granulares.
tags: [bosun, adr, auth, session, rbac, permissions]
status: draft
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# ADR-102 — Identidade, acesso e permissões

**Status:** vigente; consolidado em 2026-10-23 e sujeito à aprovação do design completo. Este ADR é a única fonte de decisão do domínio: decisão nova **edita este arquivo**.

## Login e senha

1. Login por **usuário/e-mail + senha**; sem login social. Convidado cria usuário/senha no aceite do convite.
2. Pedido de troca de senha gera alerta interno ao Admin e aviso por Resend; o Admin define **senha temporária** e o próximo login **força a troca**.
3. Nova senha não pode ser igual à atual (comparação por hash); sem histórico de senhas. Hash: proposta **Argon2id**, em aberto (ver [ADR-111](adr-111-architecture-operations.md)).

## Recuperação e segundo fator

4. MVP sem segundo fator. Depois: **TOTP** para Admin/Manager e ações sensíveis. **Código por e-mail descartado.** Passkey é evolução.
5. **Chave de recuperação** gerada no onboarding: exibida uma vez, guardada como hash, uso único, auditada e notificada, regenerável por Admin.
6. Último caso: `bosun admin unlock <email>` na VPS; gera senha temporária com troca forçada; auditado com ator **operador**.

## Sessão

7. Cada login é uma linha em **`Session`** (`id`/sid, `user_id`, `active_workspace_id`, `device_label`, `user_agent`, `ip`, `created_at`, `last_seen_at`, `last_auth_at`, `expires_at`, `revoked_at`, `revoked_reason`). O JWT do Auth.js carrega o `sid`; toda rota verifica revogada e expirada. Não existe `session_version`.
8. Expiração **absoluta de 12 h** (8/12/24 por workspace), sem renovação deslizante. **Trava de 30 min** por inatividade (15/30/60/desligada), sem perder rascunho.
9. **Reautenticação** quando `last_auth_at` > 5 min para: permissões, membros, canais e integrações, exportação, pacote de encerramento, expurgo e exclusão.
10. Revogar dispositivo, sair de todos, trocar senha, usar chave de recuperação e remover do workspace revogam sessões. Mudança de papel **não** revoga: permissão é resolvida no servidor a cada requisição.
11. Trocar de workspace atualiza `active_workspace_id` e reemite o token. `last_seen_at`/`last_auth_at` gravados no máximo a cada 5 min. Lista de dispositivos é UI posterior.

## Papéis e permissões

12. Papéis humanos: **Admin, Manager, Membro e Viewer**. **Atendente** é função, não papel. **Agente** é reservado para IA, com perfil próprio.
13. Permissões granulares por recurso e ação, editadas em tabela; quatro presets; o Admin ajusta presets e cria **exceções por membro**, mas não cria papéis.
14. **Times por módulo** (atendimento, vendas, projetos, publicações). Visibilidade híbrida: projetos, CRM e Publicações por time; Base e calendário abertos; documentos com biblioteca compartilhada e pessoal.
15. Admin e Manager exportam dados do workspace e veem a auditoria.
16. Membro removido: projetos, tarefas e CRM passam ao Manager; dados pessoais vão com o membro.
17. **Uma matriz só**: a matriz completa aprovada é a fonte; o MVP esconde recursos inexistentes e o seed de permissões é gerado dela.
18. Permissão nunca vem do cliente; autorização sempre no servidor.

## Capacidade futura

- TOTP, passkey, lista de dispositivos, convidados externos.

## Origem

Consolida os antigos 005, 006, 018, 021, 022, 036, 056, 057, arquivados em `archive/adrs-2026-10-23/`.
