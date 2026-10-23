---
type: Product Spec
title: Agenda e calendário
description: Calendário próprio com calendário externo por workspace, eventos e time blocking.
tags: [bosun, product, calendar, events, time-blocking, sync]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Agenda e calendário

## Modelo

- A BOSUN tem **calendário próprio** e um **calendário externo por workspace**.
- O calendário externo é **compartilhado** e conectado pelo Admin/Manager; o workspace escolhe Google ou Outlook. Google entra primeiro; Outlook depois.
- A BOSUN **lê** os eventos do calendário externo. Eventos criados fora da BOSUN são **somente leitura**; para editá-los, o usuário abre o provedor.
- A BOSUN **grava apenas eventos que ela criou**, com vínculo por ID externo e `iCalUID`. Eventos externos não são reescritos.
- Cada membro tem um **calendário pessoal interno**, privado e sem sync externo. Ele não entra na disponibilidade do time.
- **Prioridade do workspace:** eventos do workspace bloqueiam a disponibilidade; eventos pessoais são privados, não bloqueiam o time e, em colisão, a BOSUN avisa mas não impede.
- Evento tem título, início, fim, dia inteiro, local, participantes, descrição e vínculos com contatos, projetos, tarefas e atendimentos.
- **Conflito:** campos simples seguem a alteração mais recente; horário ou participantes geram conflito explícito para resolução manual, com histórico.

## Time blocking

- Uma tarefa pode ser **arrastada para a agenda** e vira um bloco de tempo.
- O bloco mantém o vínculo com a tarefa; alterações de horário refletem no calendário.
- O Meu dia mostra os blocos do dia junto dos demais itens.

## Visões

- Dia, semana, mês e agenda.
- Filtro por calendário, membro, projeto e contexto.

## Em aberto

- Eventos recorrentes, exceções e fuso horário.
- Lembretes e notificações de eventos.
- O que acontece com o bloco quando a tarefa é concluída, movida ou excluída.
- Edição de evento externo: fora da primeira versão.
- Múltiplos provedores no mesmo workspace: fora da primeira versão.
- Calendário pessoal externo: fora da primeira versão.
- Quem pode criar evento no calendário do workspace; a linha da matriz ainda será aprovada.
- Política de retenção de eventos.

## Decisões de 2026-10-23

- Recorrência em **RRULE (RFC 5545)**, gravada em UTC com fuso IANA; lembrete padrão 10 min.
- **Bloco de tempo não se move sozinho**: tarefa concluída deixa o bloco como histórico; tarefa reagendada gera sugestão de mover.

## Links

- [Integrações externas](integrations.md)
- [Meu dia](my-day.md)
- [Tarefas e projetos](tasks-projects.md)
- [ADR-105 — Calendário, Meu dia e time blocking](../decisions/adr-105-work-time.md)
- [ADR-105 — Calendário externo por workspace](../decisions/adr-105-work-time.md)
