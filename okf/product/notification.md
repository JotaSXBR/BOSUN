---
type: Product Spec
title: Notificação
description: Avisos in-app e por web push para seis eventos, ligáveis por pessoa, sem níveis nem e-mail.
tags: [bosun, notificações, push]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Notificação

| Evento | Quem recebe |
|---|---|
| Conversa nova na fila | Admin e Membros |
| Conversa atribuída a mim | o responsável |
| Tarefa atribuída a mim | o responsável |
| Venda confirmada | Admin e responsável pelo contato |
| Falha de publicação | autor do post e Admin |
| Conexão expirada ou com erro | Admin |

- Canais: sino in-app (com lido/não lido) e **web push** (VAPID) quando a pessoa permite no navegador.
- Cada pessoa liga ou desliga cada evento em Perfil.
- A notificação guarda só a referência; a permissão é conferida ao abrir.
- Texto calmo, sem urgência artificial.

## Relations

- governed_by: [ADR-105 — Trabalho, tempo e notificações](../decisions/adr-105-work.md)
- depends_on: [Papéis](role.md)
