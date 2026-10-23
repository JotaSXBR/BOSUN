---
type: Product Spec
title: Calendário
description: Agenda com eventos, tarefas com prazo e posts agendados, mais o Google Agenda de cada membro só leitura.
tags: [bosun, calendário, google, agenda]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Calendário

## Conteúdo

- **Eventos da BOSUN**: título, início, fim, fuso IANA, participantes do workspace, vínculo opcional com contato ou campanha. Lembrete padrão de 10 min.
- **Tarefas com prazo** e **posts agendados**, com cor por tipo.
- **Google Agenda do próprio membro**, só leitura e visível só para ele.

## Google Agenda

- Cada membro conecta o próprio Google Agenda (escopo de leitura) e escolhe quais agendas mostrar.
- A BOSUN lê por sync incremental e não grava nada no Google.
- Revogar remove os eventos externos da tela, sem afetar os eventos da BOSUN.

## Visões

Dia, semana e mês. Arrastar um evento da BOSUN muda o horário; tarefas e posts abrem a própria tela.

Sem recorrência própria, time blocking, calendário pessoal interno nem resolução de conflito.

## Relations

- governed_by: [ADR-105 — Trabalho, tempo e notificações](../decisions/adr-105-work.md)
- consumes: [Tarefa](task.md)
- consumes: [Post](post.md)
