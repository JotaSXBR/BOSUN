---
type: Execution Slice
title: Fatia 9 — Chat do site
description: Widget de dúvidas na landing page, com identificação obrigatória, tempo real e aviso de possível duplicado.
tags: [bosun, plano, fatia, chat]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Fatia 9 — Chat do site

**Objetivo:** quem está na landing page do infoproduto tira a dúvida com a piloto antes de comprar, e a conversa entra na mesma caixa.

## Escopo

- Snippet do widget, ligado a workspace e campanha opcional ([Chat do site](../product/site-chat.md)).
- Formulário com nome, e-mail e telefone, finalidade e base legal; identidade declarada.
- Tempo real nos dois sentidos (SSE ou WebSocket, a decidir no início da fatia e registrar no ADR-107).
- Ticket em `waiting_human`; aviso de possível duplicado no ticket ([Contato](../product/contact.md)).
- Limite de mensagens por sessão e por IP.

## Critério de aceite

Os dois critérios de [Chat do site](../product/site-chat.md), mais:

1. O e-mail declarado que já existe gera o aviso, não a mesclagem.
2. O widget carrega na landing page real da piloto sem quebrar o layout dela.

## Testes

- Unitários: validação do formulário, limite de taxa.
- Integração: sessão do visitante, entrega em tempo real.
- E2E: visitante envia → fila → resposta chega no widget.

## Relations

- depends_on: [Fatia 3 — Instagram e Facebook na caixa](slice-03-meta-inbox.md)
- details: [Chat do site](../product/site-chat.md)
- governed_by: [ADR-107 — Canais e atendimento](../decisions/adr-107-service.md)
