---
type: Execution Slice
title: Fatia 3 — Instagram e Facebook na caixa
description: Conexão da Meta e comentários, DMs, respostas de story e menções do Instagram e do Facebook entrando como tickets.
tags: [bosun, plano, fatia, meta, instagram, facebook]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Fatia 3 — Instagram e Facebook na caixa

**Objetivo:** DMs e comentários do Instagram e do Facebook chegam na mesma caixa do WhatsApp, e a piloto responde por ali.

## Escopo

- Duas conexões: Instagram (Instagram Login, conta profissional) e Facebook (Facebook Login, página); tokens de longa duração cifrados e renovados antes de 60 dias ([Canal](../product/channel.md)).
- Webhook da Meta com assinatura validada e evento bruto gravado; processamento em job.
- Identidades `instagram` e `facebook`; contato criado pelo primeiro evento.
- Comentário, resposta de story, menção e DM viram ticket em `waiting_human` (ainda sem fluxos) ([Ticket](../product/ticket.md)).
- Responder DM e comentário (resposta pública) pela caixa, dentro da janela da Meta; a tela avisa quando a janela fechou.
- Filtro por canal na caixa.

## Portar do CRMv2

Só as fixtures e a verificação de assinatura da Meta; Instagram e Facebook são novos. Caminhos no [mapa de porte](../tech/crmv2-review.md).

## Spec

- Entidades: `Integration` (meta), identidades `instagram` e `facebook`, `ExternalPost` criado ao receber comentário.
- Webhook: `POST /api/webhooks/meta` (comentários, mensagens, story, menções), com verificação do desafio e da assinatura.
- Telas: conexão da Meta, filtro por canal, resposta a comentário, aviso de janela fechada.
- Notificação in-app: conexão expirada ou com erro.
- Fora: fluxos (Fatia 4), publicação (Fatia 8).

## Dependências

Fatia 1. Bloqueio externo: app da Meta (modo de desenvolvimento com a conta da piloto como testadora; App Review para ir a produção).

## Critério de aceite

1. Uma DM no Instagram da piloto aparece na fila e a resposta chega no app.
2. Responder um comentário publica a resposta no post.
3. Token perto de vencer é renovado sem ação da piloto; token revogado gera aviso de conexão com erro.

## Testes

- Integração: payloads reais da Meta gravados como fixtures (comentário, DM, story, menção), assinatura inválida rejeitada, idempotência.
- E2E: DM simulada → fila → resposta.

## Observação

Sem o App Review, o app funciona em modo de desenvolvimento só para contas com papel no app. Adicione a conta da piloto como testadora até a aprovação.

## Relations

- depends_on: [Fatia 1 — Caixa com WhatsApp](slice-01-whatsapp-inbox.md)
- details: [Canal](../product/channel.md)
- governed_by: [ADR-107 — Canais e atendimento](../decisions/adr-107-service.md)
