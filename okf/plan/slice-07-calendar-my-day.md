---
type: Execution Slice
title: Fatia 7 — Calendário, Meu dia e push
description: Calendário com eventos e tarefas, Google Agenda só leitura por membro, Meu dia completo e web push.
tags: [bosun, plano, fatia, calendário, notificações]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Fatia 7 — Calendário, Meu dia e push

**Objetivo:** o dia da piloto cabe numa tela: conversas, tarefas e agenda, com aviso no celular quando alguém espera.

## Escopo

- `Event` com participantes, fuso e lembrete; visões dia, semana e mês; tarefas com prazo no calendário ([Calendário](../product/calendar.md)).
- Google Agenda do próprio membro, só leitura, com sync incremental e escolha de agendas.
- Meu dia completo, com os três blocos ([Meu dia](../product/my-day.md)).
- Web push (VAPID) para as notificações que já existem no sino, e preferências por evento em Perfil ([Notificação](../product/notification.md)).

## Spec

- Entidades: `Event`, `EventAttendee`, `ExternalCalendarEvent`, `PushSubscription`, `NotificationPreference`.
- Jobs: sync incremental do Google Agenda por membro.
- Telas: calendário (dia, semana, mês), Meu dia completo, preferências de notificação em Perfil.
- Fora: posts no calendário (Fatia 8).

## Dependências

Fatia 6. Bloqueio externo: verificação do escopo de leitura do Google Agenda (usuária de teste até lá).

## Critério de aceite

1. Um evento do Google Agenda da piloto aparece só para ela, ao lado das tarefas.
2. Revogar o Google Agenda remove os eventos externos da tela.
3. Conversa nova na fila gera push no celular, se ela permitiu.
4. Desligar um tipo de notificação para de enviá-lo.

## Testes

- Unitários: fuso e horário de verão, montagem do Meu dia.
- Integração: Calendar API com servidor fake (incremental, token inválido), envio de push.
- E2E: criar tarefa com prazo → aparece no calendário e no Meu dia.

## Relations

- depends_on: [Fatia 6 — Negócio, tarefa e projeto](slice-06-deal-task.md)
- details: [Calendário](../product/calendar.md)
- governed_by: [ADR-105 — Trabalho, tempo e notificações](../decisions/adr-105-work.md)
