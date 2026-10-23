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

## Portar do CRMv2

Adaptador do chat do site com as correções AUD-010, AUD-011 e AUD-012. Caminhos no [mapa de porte](../tech/crmv2-review.md).

## Spec

- Entidades: `SiteChatVisitor`; identidade `site_visitor`; identidades declaradas `email` e `phone`.
- Rotas: script do widget, início de sessão com o formulário, envio e recebimento em tempo real.
- Telas: widget na landing page, snippet em Configurações, aviso de possível duplicado no ticket.
- Fora: automação no chat, agente de IA.

## Dependências

Fatia 3 (caixa com vários canais). Bloqueio externo: acesso para colar o snippet na landing page da piloto.

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
