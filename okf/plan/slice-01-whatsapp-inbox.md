---
type: Execution Slice
title: Fatia 1 — Caixa com WhatsApp
description: Primeira entrega de valor; a piloto atende o WhatsApp dela pela BOSUN, com fila, assumir, contato e Meu dia mínimo.
tags: [bosun, plano, fatia, whatsapp, ticket]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Fatia 1 — Caixa com WhatsApp

**Objetivo:** a piloto passa a responder o WhatsApp do negócio pela BOSUN, no computador e no celular. É a primeira entrega de valor e **vai ao ar** na VPS dela.

## Escopo

- Conectar uma sessão do WAHA por QR code, ver o estado e reconectar ([WhatsApp via WAHA](../tech/whatsapp.md)).
- Webhook idempotente por `external_id`, processado em job.
- `Contact` e `ContactIdentity` (telefone E.164, adesão por identidade atestada) ([Contato](../product/contact.md)).
- `Ticket` e `Message` com os estados `waiting_human`, `human` e `resolved`; o campo de estado já aceita os cinco valores ([Ticket](../product/ticket.md)).
- Caixa em três colunas, filtros Fila, Minhas e Resolvidas, ordenação por espera, assumir, responder, resolver, nota interna, drawer do contato.
- Mídia recebida e enviada no RustFS ([Mídia](../tech/media.md)).
- Meu dia com o bloco "conversas que esperam por mim" ([Meu dia](../product/my-day.md)).
- Sino de notificações in-app (`Notification`) com conversa nova na fila e conversa atribuída a mim ([Notificação](../product/notification.md)).

## Portar do CRMv2

Adaptador WAHA/GOWS completo, fixtures, reconcile, anti-ban, identidade por telefone e avatar. A caixa do CRMv2 é referência de comportamento, não de componentes. Caminhos no [mapa de porte](../tech/crmv2-review.md).

## Spec

- Entidades: `WhatsAppSession`, `Contact`, `ContactIdentity`, `Ticket`, `Message`, `InternalNote`, `Notification`.
- Webhook: `POST /api/webhooks/waha` (evento `message` e status da sessão).
- Telas: caixa em três colunas, conexão do WhatsApp (QR), Meu dia mínimo, sino de notificações.
- Transições do ticket: nova entrada → `waiting_human`; assumir → `human`; resolver → `resolved`; mensagem nova em `resolved` → `waiting_human`.
- Notificações in-app: conversa nova na fila, conversa atribuída a mim.
- Fora: Instagram, Facebook, automação, push.

## Dependências

Fatia 0. Bloqueio externo: número de WhatsApp da piloto para parear.

## Critério de aceite

1. Uma mensagem real chega na fila em menos de 5 s; responder pela BOSUN chega no WhatsApp.
2. O mesmo webhook enviado duas vezes gera uma mensagem.
3. Reconectar a sessão não perde o histórico.
4. A caixa é usável no navegador do celular.
5. A piloto usa a caixa por 3 dias seguidos sem voltar ao WhatsApp Web.

## Testes

- Unitários: normalização de telefone, roteamento para `waiting_human`.
- Integração: webhook do WAHA com payloads reais gravados (fixtures), envio, idempotência.
- E2E: mensagem simulada → fila → assumir → responder → resolver.

## Relations

- depends_on: [Fatia 0 — Fundação](slice-00-foundation.md)
- details: [Ticket](../product/ticket.md)
- governed_by: [ADR-107 — Canais e atendimento](../decisions/adr-107-service.md)
