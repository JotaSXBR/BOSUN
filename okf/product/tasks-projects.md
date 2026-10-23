---
type: Product Spec
title: Tarefas e projetos
description: Recursos de tarefa, responsáveis, fluxo de status, visões e dependências.
tags: [bosun, product, tasks, projects, dependencies, timeline]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-21T00:00:00Z }
---

# Tarefas e projetos

## Tarefa

Tarefa é um tipo de **Item**. Campos previstos:

- título, descrição, status e prioridade;
- prazo e contexto;
- **vários responsáveis**;
- vínculos com projeto, contato, atendimento, documento e objetivo.

Recursos da primeira versão do módulo:

- **subtarefas**;
- **checklist**;
- **recorrência** por regra;
- **estimativa de esforço e horas gastas**;
- **dependências** entre tarefas.

**Subtarefa é um item** (tarefa com pai); **linha de checklist não é**. Uma etapa vira tarefa quando tem dono, dia ou bloqueio próprios; caso contrário, é checklist. É essa regra que impede um projeto de nascer com 21 tarefas.

## Projeto

- Agrupa tarefas, documentos, notas, prazos e contexto.
- Mostra progresso e indicadores discretos de avanço.
- Pode nascer de uma conversa ou atendimento.

### Visões

- **Lista**;
- **Quadro**;
- **Calendário**;
- **Linha do tempo**.

### Status e fluxo

- O **template** define o fluxo inicial de status.
- Depois da criação, o **Admin/Manager edita** o fluxo nas configurações do workspace.
- Os projetos herdam o fluxo do workspace.

### Dependências

- O modelo é de **bloqueio simples**: uma tarefa bloqueia ou é bloqueada por outra.
- A linha do tempo calcula o **caminho crítico** sobre esse grafo.
- Os quatro tipos PDM (FS, SS, FF, SF) ficam fora desta versão; podem voltar se houver demanda real.

## Recorrência e hábitos

- São **modelos separados**.
- Hábito acompanha frequência e histórico; tarefa recorrente executa uma ação.
- Um hábito pode gerar tarefas, mas não é a mesma entidade.

## Em aberto

- ~~Tarefa pode existir sem projeto?~~ — sim ([ADR-105](../decisions/adr-105-work-time.md)).
- Seções, fases e marcos dentro do projeto.
- Cálculo de progresso: manual, por tarefas concluídas ou por esforço.
- Override de fluxo por projeto.
- Campos personalizados.
- Quem pode atribuir, reatribuir e observar tarefas.

## Decisões de 2026-10-23

- Projeto tem **seções**; **marco** é tarefa marcada como marco.
- **Progresso** = % de tarefas concluídas, ponderado pela estimativa quando houver.
- Membro atribui dentro dos projetos em que participa; campos personalizados ficam para depois.

## Links

- [Itens, notas, documentos e conhecimento](content-model.md)
- [ADR-105 — Tarefas e projetos](../decisions/adr-105-work-time.md)
- [Papéis e permissões](roles-permissions.md)
