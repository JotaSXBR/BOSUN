---
type: Product Spec
title: Ticket
description: Conversa de canal com estado único, roteamento de entrada, fila FIFO, atribuição manual e caixa em três colunas.
tags: [bosun, atendimento, ticket, caixa, fila]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Ticket

O ticket é a conversa de um canal com estado e responsável. Social e Atendimento são filtros da mesma caixa.

## Estado

| Estado | Quem conduz |
|---|---|
| `automation` | um fluxo ativo |
| `pending_agent` | um agente de IA; existe no modelo, nunca é atingido no piloto |
| `waiting_human` | ninguém; está na fila |
| `human` | uma pessoa que assumiu |
| `resolved` | encerrado |

## Roteamento de entrada

1. Comentário, resposta de story ou menção que casa com um fluxo ativo → `automation`.
2. Qualquer outra entrada (DM fora do fluxo, WhatsApp, chat do site) → `pending_agent` se houver agente habilitado, senão `waiting_human`.
3. Em `automation`, vão para `waiting_human`: resposta fora do fluxo, palavra de handoff ou promoção manual.
4. Mensagem nova num ticket `resolved` reabre em `waiting_human`.

## Regras

- Uma conversa aberta por thread de canal; a ficha do contato reúne os tickets; o ticket avisa se há outra conversa aberta com a mesma pessoa.
- Enviar exige **assumir**; assumir pausa a automação naquele ticket.
- A fila ordena pela espera mais longa e **não distribui**; a atribuição é manual e auditada.
- Notas internas não vão ao cliente.
- Do ticket, um clique cria tarefa ou negócio já ligados ao contato.

## Caixa

- Três colunas: canais/sessões, lista de conversas, conversa; ficha do contato em drawer lateral.
- Filtros: Fila, Minhas, Automação, Resolvidas, Pendentes (visível e desabilitado sem agente). Filtro por canal.
- Indicadores: não lidas, tempo de espera, responsável, canal.
- Funciona no navegador do celular.

## Critérios de aceite

1. Mensagem de WhatsApp sem fluxo entra na fila.
2. Assumir e responder envia pelo canal certo e pausa a automação.
3. Nenhuma mensagem é perdida nem duplicada com webhooks repetidos.

## Relations

- governed_by: [ADR-107 — Canais e atendimento](../decisions/adr-107-service.md)
- depends_on: [Canal](channel.md)
- depends_on: [Contato](contact.md)
- triggers: [Notificação](notification.md)
