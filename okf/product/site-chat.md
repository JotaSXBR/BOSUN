---
type: Product Spec
title: Chat do site
description: Widget de dúvidas na landing page do infoproduto, com identificação obrigatória antes da primeira mensagem.
tags: [bosun, chat, landing-page, atendimento]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Chat do site

Widget que a piloto cola na landing page do infoproduto para tirar dúvidas antes da compra.

- O Admin copia o snippet no setup; o widget é ligado a um workspace e a uma campanha opcional.
- Antes da primeira mensagem, o visitante informa **nome, e-mail e telefone**, e vê a finalidade e a base legal. Não existe conversa anônima.
- Os dados entram como identidade **declarada**: não verificados, não autorizam envio proativo, e um e-mail ou telefone que bate com um contato gera aviso de possível duplicado ([Contato](contact.md)).
- A conversa abre um ticket em `waiting_human` ([Ticket](ticket.md)) e é atendida na mesma caixa. Mensagens chegam em tempo real nos dois lados.
- O visitante recebe a resposta enquanto estiver na página; o identificador de sessão do navegador é só identidade auxiliar.
- Proteção contra abuso: limite de mensagens por sessão e por IP.

## Critérios de aceite

1. O visitante só envia depois de preencher os três campos.
2. A mensagem aparece na fila da caixa em segundos, e a resposta volta no widget.

## Relations

- governed_by: [ADR-107 — Canais e atendimento](../decisions/adr-107-service.md)
- produces: [Ticket](ticket.md)
- part_of: [Canal](channel.md)
