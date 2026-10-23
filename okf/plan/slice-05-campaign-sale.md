---
type: Execution Slice
title: Fatia 5 — Campanha e venda
description: Campanha, webhook da Kiwify, atribuição da venda pelo link rastreável e painel do funil por campanha.
tags: [bosun, plano, fatia, campanha, venda, kiwify]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Fatia 5 — Campanha e venda

**Objetivo:** a piloto vê quanto cada post e cada fluxo vendeu. É a prova do piloto.

## Antes de começar

Confirmar na documentação oficial da Kiwify qual parâmetro de rastreio do link de checkout volta no webhook, e o formato e a assinatura do webhook. Registrar no [ADR-108](../decisions/adr-108-publications.md).

## Escopo

- `Campaign` com posts (`ExternalPost`, nativos até a fatia 8), fluxos e link de checkout ([Campanha](../product/campaign.md)).
- Link rastreável com campanha, fluxo e contato; redirecionamento ao checkout com UTM e o parâmetro de rastreio.
- Webhook da Kiwify com segredo validado e idempotência pela transação; `Sale` com status aprovada e reembolsada ([Venda](../product/sale.md)).
- Atribuição pelo link; sem link, pelo e-mail ou telefone; contato novo com identidade declarada quando não acha.
- Painel da campanha: comentários → DMs → cliques → tickets → vendas e receita.
- Notificação in-app de venda confirmada ([Notificação](../product/notification.md)).

## Spec

- Entidades: `Campaign`, `Sale`; `ExternalPost.campaign_id`; `TrackedLink` com campanha.
- Webhook: `POST /api/webhooks/kiwify`.
- Telas: campanha (posts, fluxos, link de checkout), painel do funil, venda na ficha do contato.
- Notificação in-app: venda confirmada.
- Fora: negócio (Fatia 6), post da BOSUN (Fatia 8).

## Dependências

Fatia 4. Bloqueio externo: documentação da Kiwify (parâmetro de rastreio e formato do webhook) e acesso ao painel de webhooks da conta da piloto.

## Critério de aceite

Os três critérios de [Venda](../product/sale.md), mais:

1. Um reembolso tira a venda da receita do painel.
2. Os números do painel batem com uma contagem manual nos registros.

## Testes

- Unitários: atribuição (com link, sem link, sem contato).
- Integração: webhook da Kiwify com payloads de exemplo da documentação, repetição, segredo inválido.
- E2E: link da DM → checkout (fake) → webhook → painel.

## Relations

- depends_on: [Fatia 4 — Automação de comentário](slice-04-comment-automation.md)
- details: [Venda](../product/sale.md)
- governed_by: [ADR-106 — Contatos, CRM e venda](../decisions/adr-106-contacts.md)
