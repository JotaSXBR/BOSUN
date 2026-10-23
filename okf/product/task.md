---
type: Product Spec
title: Tarefa
description: Tarefa com um responsável, prazo e vínculo opcional com contato, ticket, negócio, campanha ou projeto.
tags: [bosun, tarefa, trabalho]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Tarefa

- Campos: título, descrição, **um responsável**, prazo (data, hora opcional), status `a_fazer` / `feita`.
- Vínculos opcionais: contato, ticket, negócio, campanha, projeto.
- Nasce em qualquer lugar e, com um clique, a partir do ticket ou do negócio, já ligada ao contato.
- Atribuir a outra pessoa gera notificação.
- Com prazo, aparece no [Calendário](calendar.md) e no [Meu dia](my-day.md).
- Sem subtarefas, checklist, dependências, estimativa nem recorrência.

## Relations

- governed_by: [ADR-105 — Trabalho, tempo e notificações](../decisions/adr-105-work.md)
- consumes: [Ticket](ticket.md)
- part_of: [Projeto](project.md)
- triggers: [Notificação](notification.md)
