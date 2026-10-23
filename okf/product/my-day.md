---
type: Product Spec
title: Meu dia
description: Home com três blocos em ordem fixa — conversas que esperam por mim, tarefas de hoje e atrasadas, eventos de hoje.
tags: [bosun, meu-dia, home]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Meu dia

A home de cada pessoa. Três blocos, nesta ordem:

1. **Conversas que esperam por mim**: tickets em `human` comigo e esperando resposta, e o total da fila em `waiting_human`.
2. **Tarefas**: atrasadas e com prazo hoje, do meu responsável, por prazo.
3. **Eventos de hoje**: da BOSUN e do meu Google Agenda, por horário; posts agendados para hoje.

- Cada linha abre o item; concluir uma tarefa é um clique.
- Mostra só o que o papel pode ver.
- Bloco vazio mostra uma frase calma ("Nenhuma conversa esperando por você."), sem pressão.

## Relations

- governed_by: [ADR-105 — Trabalho, tempo e notificações](../decisions/adr-105-work.md)
- consumes: [Ticket](ticket.md)
- consumes: [Tarefa](task.md)
- consumes: [Calendário](calendar.md)
