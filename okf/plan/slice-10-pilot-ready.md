---
type: Execution Slice
title: Fatia 10 — Piloto pronto
description: Setup com checklist, busca global, LGPD, auditoria revisada e o golden path completo de ponta a ponta.
tags: [bosun, plano, fatia, piloto, lgpd]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Fatia 10 — Piloto pronto

**Objetivo:** fechar o golden path e começar o ciclo de uma campanha real + 30 dias ([Piloto](../product/pilot.md)).

## Escopo

- Tela de setup com o checklist fixo, juntando as conexões que as fatias anteriores criaram ([Onboarding](../product/onboarding.md)).
- Busca global em todas as entidades do piloto ([Busca](../product/search.md)).
- Exportar e excluir um contato com tudo dele; retenção fixa (logs de fluxo por 90 dias) ([LGPD](../product/lgpd.md)).
- Revisão da lista de auditoria do ADR-111 contra o código.
- E2E do golden path inteiro, de ponta a ponta.
- Segunda restauração de backup testada.

## Critério de aceite

1. O E2E do golden path passa: post → comentário → automação → ticket → negócio → venda → tarefa → calendário → Meu dia.
2. Excluir um contato apaga tudo dele e deixa só uma linha de auditoria.
3. A piloto inicia a campanha real; o checklist semanal do ciclo começa.

## Testes

- E2E do golden path com todos os serviços externos fake.
- Integração: exportação e exclusão completas.

## Relations

- depends_on: [Fatia 8 — Publicações](slice-08-publishing.md)
- depends_on: [Fatia 9 — Chat do site](slice-09-site-chat.md)
- details: [Piloto](../product/pilot.md)
