---
type: Execution Slice
title: Fatia 6 — Negócio, tarefa e projeto
description: Negócio com pipeline fixo, tarefa criada do ticket ou do negócio e projeto em lista e quadro.
tags: [bosun, plano, fatia, crm, tarefa, projeto]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Fatia 6 — Negócio, tarefa e projeto

**Objetivo:** a piloto acompanha os leads quentes e não esquece follow-up nem entrega, sem planilha.

## Escopo

- `Deal` com pipeline fixo, valor, campanha, responsável; quadro por estágio com filtro por campanha; Perdido pede motivo; auditoria de mudanças ([Negócio](../product/deal.md)).
- Venda confirmada sugere mover o negócio para Ganho.
- `Task` com responsável, prazo e vínculos; criar a partir do ticket e do negócio com um clique ([Tarefa](../product/task.md)).
- `Project` com lista e quadro, vínculo com campanha ([Projeto](../product/project.md)).
- Meu dia ganha o bloco de tarefas atrasadas e de hoje.
- Notificação de tarefa atribuída.
- Busca em negócios, tarefas e projetos.

## Spec

- Entidades: `Deal`, `Task`, `Project`.
- Telas: quadro de negócios, tarefa (lista e detalhe), projeto em lista e quadro, botões no ticket e no negócio.
- Transições: negócio Novo → Em conversa → Ganho ou Perdido (com motivo); tarefa `a_fazer` → `feita`.
- Notificação in-app: tarefa atribuída a mim.
- Fora: calendário (Fatia 7).

## Dependências

Fatia 5.

## Critério de aceite

1. Do ticket, um clique cria um negócio e uma tarefa já ligados ao contato.
2. A venda do contato mostra o botão "mover para Ganho" no negócio aberto.
3. A tarefa com prazo hoje aparece no Meu dia do responsável.

## Testes

- Unitários: transições de estágio, regra de Perdido com motivo.
- Integração: criação a partir do ticket, permissões de Viewer.
- E2E: ticket → negócio → tarefa → Meu dia.

## Relations

- depends_on: [Fatia 5 — Campanha e venda](slice-05-campaign-sale.md)
- details: [Negócio](../product/deal.md)
- governed_by: [ADR-105 — Trabalho, tempo e notificações](../decisions/adr-105-work.md)
