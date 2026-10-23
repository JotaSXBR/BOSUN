---
type: ADR
title: ADR-105 — Trabalho e tempo
description: Tarefas, projetos, calendário, Meu dia, hábitos e objetivos.
tags: [bosun, adr, tasks, projects, calendar, habits, okr]
status: draft
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# ADR-105 — Trabalho e tempo

**Status:** vigente; consolidado em 2026-10-23 e sujeito à aprovação do design completo. Este ADR é a única fonte de decisão do domínio: decisão nova **edita este arquivo**.

## Tarefas e projetos

1. Tarefa é Item, com **vários responsáveis**, subtarefas, checklist, recorrência, estimativa/horas e dependências. **Pode existir sem projeto.**
2. Projeto: visões lista, quadro, calendário e linha do tempo; **seções**; **marco** é tarefa marcada como marco.
3. **Progresso** = % de tarefas concluídas, ponderado pela estimativa quando houver.
4. Fluxo de status vem do template e é editável por Admin/Manager; projetos herdam.
5. Dependências por **bloqueio simples + caminho crítico**.
6. Membro atribui dentro dos projetos em que participa.

## Calendário e Meu dia

7. **Calendário próprio**. Cada workspace conecta **um calendário externo** (Google primeiro, Outlook depois): eventos externos são só leitura; a BOSUN grava só os que criou (ID externo + `iCalUID`) e aceita edições de volta.
8. Cada membro tem calendário pessoal interno, privado, sem sync. Eventos do workspace bloqueiam disponibilidade; pessoais só avisam.
9. Conflito: campo simples segue a edição mais recente; horário ou participantes pedem resolução manual.
10. Recorrência em **RRULE (RFC 5545)**, gravada em UTC com fuso IANA; lembrete padrão 10 min.
11. **Time blocking**: arrastar tarefa para a agenda cria bloco vinculado. O bloco **não se move sozinho**: tarefa concluída deixa histórico; reagendada gera sugestão.
12. **Meu dia** é a home: tarefas, eventos, hábitos, atendimentos e objetivos que a pessoa pode ver, por prioridade calculada (atrasados, hoje, próximos; eventos por horário).

## Hábitos

13. Tipos: sim/não, medida com meta, frequência, negativo, pausa/exceções.
14. **Score flexível** numa janela móvel de **30 dias**; pausa não conta contra.
15. Hábito e tarefa recorrente são modelos separados; hábito pode gerar tarefas.
16. **Hábitos pessoais e de workspace desde o início.**

## Objetivos

17. **OKR**, período livre; KRs de número, percentual, moeda, marco e hábito; **peso igual por padrão**, editável.
18. Check-in semanal com valor, **confiança em três níveis** e observação; progresso combinado.
19. Objetivos pessoais ou de workspace (criados por Admin/Manager); pessoal pode contribuir para o do workspace.

## Capacidade futura

- Campos personalizados; tipos PDM de dependência; várias contas de calendário por membro; calendário pessoal externo.

## Origem

Consolida os antigos 028, 029, 030, 031, 037, 065, arquivados em `archive/adrs-2026-10-23/`.
