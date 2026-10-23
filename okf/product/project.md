---
type: Product Spec
title: Projeto
description: Agrupador de tarefas com descrição, vínculo opcional com campanha e visões lista e quadro.
tags: [bosun, projeto, trabalho]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Projeto

- Campos: nome, descrição, status (`active`, `archived`), campanha opcional.
- Contém tarefas; uma tarefa pertence a no máximo um projeto.
- Duas visões: **lista** (por prazo) e **quadro** (colunas `a_fazer` / `feita`).
- Arquivar o projeto não apaga as tarefas.
- Sem seções, marcos, linha do tempo nem progresso ponderado.

## Relations

- governed_by: [ADR-105 — Trabalho, tempo e notificações](../decisions/adr-105-work.md)
- consumes: [Campanha](campaign.md)
- depends_on: [Tarefa](task.md)
