---
type: ADR
title: ADR-105 — Trabalho, tempo e notificações
description: Tarefas, projetos, calendário com Google só leitura, Meu dia e notificações de quatro tipos.
domain: trabalho
tags: [bosun, adr, tarefas, projetos, calendário, notificações]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# ADR-105 — Trabalho, tempo e notificações

**Status:** vigente, em draft. Fonte única do domínio. Consolida o antigo ADR-110 (notificações).

## Decisões

1. **Tarefa**: título, descrição, um responsável, prazo (data e hora opcional), status fixo `a_fazer`/`feita` e vínculo opcional com contato, ticket, negócio, campanha ou projeto. Nasce de um ticket ou de um negócio com um clique. Sem subtarefas, dependências, estimativa nem recorrência.
2. **Projeto**: nome, descrição, tarefas e vínculo opcional com uma campanha; duas visões, **lista** e **quadro por status**. Sem seções, marcos, linha do tempo nem progresso ponderado.
3. **Calendário** da BOSUN: eventos simples (título, início, fim, fuso IANA, vínculo opcional), tarefas com prazo e posts agendados.
4. Cada membro pode conectar o **próprio Google Agenda só leitura**; os eventos externos aparecem só para ele. A BOSUN não grava no Google.
5. **Meu dia** é a home com três blocos, em ordem fixa: conversas que esperam por mim, tarefas atrasadas e de hoje, eventos de hoje.
6. **Notificações** in-app e web push para: conversa nova na fila, conversa atribuída a mim, tarefa atribuída a mim, venda confirmada, falha de publicação e conexão expirada. Cada pessoa liga ou desliga cada tipo. Sem níveis, silêncio nem e-mail.
7. Notificação guarda só a referência e resolve a permissão na leitura.

## Relations

- details: [Tarefa](../product/task.md)
- details: [Projeto](../product/project.md)
- details: [Calendário](../product/calendar.md)
- details: [Meu dia](../product/my-day.md)
- details: [Notificação](../product/notification.md)
