---
type: Product Spec
title: Venda
description: Compra confirmada pelo webhook da Kiwify e atribuída ao contato, post, fluxo e campanha pelo link rastreável.
tags: [bosun, venda, kiwify, atribuição]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Venda

## Entrada

- O Admin configura o webhook da Kiwify no setup; a BOSUN valida o segredo de cada chamada.
- Cada evento é idempotente pelo ID da transação: repetir o webhook não duplica a venda.
- A venda guarda produto, valor, status (aprovada, reembolsada), comprador (nome, e-mail, telefone) e data.

## Atribuição

1. Se o checkout veio de um **link rastreável** da BOSUN, a venda herda o contato, o post, o fluxo e a campanha do link ([Campanha](campaign.md)).
2. Sem link, a BOSUN procura o contato pelo e-mail ou telefone do comprador. Se achar, liga a venda ao contato; se não achar, cria um contato com identidade declarada.
3. A venda sem atribuição de campanha fica visível como "sem origem".

Clique não é venda. Reembolso muda o status e sai da receita do painel.

## Efeitos

- Notificação de venda confirmada para o Admin e o responsável pelo contato.
- Sugestão de mover o negócio aberto para Ganho ([Negócio](deal.md)).

## Critérios de aceite

1. O mesmo webhook enviado duas vezes gera uma venda.
2. A venda pelo link da DM aparece no painel da campanha certa.
3. A venda sem link é ligada ao contato pelo e-mail.

## Relations

- governed_by: [ADR-106 — Contatos, CRM e venda](../decisions/adr-106-contacts.md)
- consumes: [Campanha](campaign.md)
- produces: [Contato](contact.md)
- triggers: [Notificação](notification.md)
