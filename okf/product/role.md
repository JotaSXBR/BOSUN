---
type: Role Matrix
title: Papéis
description: Três papéis fixos por workspace (Admin, Membro, Viewer), com a matriz do piloto verificada no servidor.
tags: [bosun, papéis, permissões, rbac]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Papéis

Três papéis fixos por workspace. Sem editor de permissões, exceções por membro nem times. A autorização é sempre no servidor.

| Recurso | Admin | Membro | Viewer |
|---|---|---|---|
| Workspace, membros e convites | tudo | ver | ver |
| Canais e integrações (Meta, WhatsApp, YouTube, Google, Kiwify, chat) | tudo | ver status | ver status |
| Auditoria e exportação | ver, exportar | — | — |
| Fluxos de automação | tudo | ver | ver |
| Tickets e mensagens | tudo | ver, assumir, responder, resolver | ver |
| Contatos e mesclagem | tudo | ver, criar, editar, mesclar | ver |
| Negócios e vendas | tudo | ver, criar, editar | ver |
| Posts e campanhas | tudo | ver, criar, editar, agendar, publicar | ver |
| Tarefas, projetos e eventos | tudo | ver, criar, editar, concluir | ver |
| Documentos | tudo | ver, criar, editar, excluir | ver |
| Excluir contato (LGPD) | sim | — | — |

- O Google Agenda conectado por um membro é visível só para ele, inclusive para o Admin.
- Membro removido: tickets, tarefas e negócios dele ficam sem responsável e aparecem para o Admin.
- **Atendente** é função de quem atende; **Agente** é reservado para IA.

## Relações

- governado_por: [ADR-102 — Identidade, acesso e papéis](../decisions/adr-102-identity.md)
- parte_de: [Workspace](workspace.md)
