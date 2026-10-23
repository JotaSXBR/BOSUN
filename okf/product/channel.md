---
type: Integration Spec
title: Canal
description: Contas conectadas do piloto (Instagram, Facebook, WhatsApp, YouTube, chat do site) e os limites de cada plataforma.
tags: [bosun, canais, meta, whatsapp, youtube]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Canal

Canal é uma conta conectada a um workspace. O Admin conecta e desconecta; todos veem o estado (conectado, expirado, com erro).

| Canal | Conversa | Publicação | Conexão |
|---|---|---|---|
| Instagram | comentário, resposta de story, menção, DM | feed, carrossel, reel | OAuth da Meta; conta profissional com página |
| Facebook | comentário, Messenger | feed, reel | OAuth da Meta (mesma conexão) |
| WhatsApp | mensagens | — | WAHA/GOWS por QR code ([WhatsApp via WAHA](../tech/whatsapp-waha.md)) |
| YouTube | — | Shorts | OAuth do Google |
| Chat do site | mensagens | — | snippet na landing page ([Chat do site](site-chat.md)) |

## Limites

- **Meta:** sem DM fria; resposta privada a comentário dentro da janela; conversa de 7 dias; token de longa duração de 60 dias, renovado antes de vencer. Exige **App Review** (mensagens e comentários do Instagram) e verificação do negócio.
- **YouTube:** escopo de upload sensível; o app precisa de verificação no Google Cloud; a cota diária da API limita o número de uploads.
- **WhatsApp via WAHA** não é API oficial: há risco de bloqueio do número.
- Os apps da Meta e do Google precisam ser aprovados **antes** de a piloto usar; isso começa junto com a primeira fatia.

## Relations

- governed_by: [ADR-107 — Canais e atendimento](../decisions/adr-107-service.md)
- part_of: [Workspace](workspace.md)
