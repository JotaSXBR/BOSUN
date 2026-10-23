---
type: Execution Slice
title: Fatia 8 — Publicações
description: Biblioteca de documentos, compositor e agendamento, e publicação por API no Instagram, Facebook e YouTube Shorts.
tags: [bosun, plano, fatia, publicações, youtube]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Fatia 8 — Publicações

**Objetivo:** a piloto sai do app do Instagram: escreve, agenda e publica nas três redes pela BOSUN, e o post já nasce ligado à campanha e aos fluxos.

## Escopo

- Biblioteca de documentos completa: arquivos e links, etiquetas, busca, bloqueio de exclusão em uso ([Documento](../product/document.md)).
- Conexão do YouTube (OAuth do Google, token cifrado).
- `Post`, `PostMedia` e `PostTarget`; compositor com texto base, ajuste por destino, contador de caracteres e prévia simples ([Post](../product/post.md)).
- Agendamento por job do pg-boss; publicação independente por target, idempotente, com 3 tentativas; status `partial` e `failed`; notificação de falha.
- Formatos: Instagram feed, carrossel e reel; Facebook feed e reel; YouTube Shorts.
- Posts no calendário e na campanha; o fluxo pode escolher um post da BOSUN; a campanha passa a usar o post da BOSUN.

## Critério de aceite

Os três critérios de [Post](../product/post.md), mais:

1. Um reel de até 1 GB publica no Instagram e como Short no YouTube.
2. A piloto agenda uma semana de posts sem abrir o app do Instagram.

## Testes

- Unitários: limites por plataforma, máquina de estados do post.
- Integração: Graph API e YouTube Data API fake (sucesso, falha, token expirado, container de mídia em processamento), idempotência por target.
- E2E: compor → agendar → job publica → status por destino.

## Observação

Confira na documentação oficial da versão em uso o fluxo de publicação com container de mídia do Instagram e a cota de upload do YouTube antes de escrever o código.

## Relations

- depends_on: [Fatia 7 — Calendário, Meu dia e push](slice-07-calendar-my-day.md)
- details: [Post](../product/post.md)
- governed_by: [ADR-108 — Publicações e campanha](../decisions/adr-108-publications.md)
