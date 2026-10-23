---
type: Product Spec
title: Meu dia
description: Página inicial que agrega tarefas, eventos, hábitos, atendimentos e objetivos, filtrados por permissão.
tags: [bosun, product, my-day, home, priority]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Meu dia

## Composição

O Meu dia é a **tela inicial padrão** e agrega:

- **tarefas** com prazo, atrasadas e do dia;
- **eventos** do calendário;
- **hábitos** com check-in pendente;
- **atendimentos** que exigem resposta;
- **objetivos** com progresso e próximos passos.

## Regras

- Só aparece o que a pessoa **tem permissão de ver**. Conteúdo pessoal de outro membro nunca entra.
- A ordem é **prioridade calculada**: atrasados primeiro, depois hoje, depois próximos; eventos entram por horário.
- O time blocking aparece como bloco do dia.
- O dashboard operacional de Admin/Manager, se existir, é uma tela separada.

## Em aberto

- O usuário pode ocultar blocos que não usa?
- Como o Meu dia trata fins de semana e dias sem agenda.
- Como o copiloto sugere prioridades sem roubar o controle.
- Limite de itens e paginação para dias cheios.

## Links

- [Agenda e calendário](calendar.md)
- [Hábitos](habits.md)
- [Objetivos](goals.md)
- [ADR-105 — Calendário, Meu dia e time blocking](../decisions/adr-105-work-time.md)
