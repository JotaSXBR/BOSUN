---
type: Product Spec
title: Post
description: Post criado e agendado na BOSUN e publicado por API no Instagram, Facebook e YouTube Shorts, com status por destino.
tags: [bosun, publicações, post, instagram, youtube]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Post

A piloto sai do app do Instagram: escreve, agenda e publica na BOSUN.

## Modelo

- `Post`: campanha opcional, texto base, mídia (de [Documentos](document.md)), horário, autor.
- `PostTarget`: uma conta conectada (Instagram, Facebook ou YouTube), formato, texto ou título próprio, status, `external_id`, `published_at` e último erro.
- Formatos: Instagram feed, carrossel e reel; Facebook feed e reel; YouTube Shorts (título e descrição obrigatórios).

## Ciclo

`draft` → `scheduled` → `publishing` → `published` / `partial` / `failed`.

- Todo post tem horário explícito no fuso do workspace; "publicar agora" é um horário.
- Um job do pg-boss publica cada target de forma independente, com idempotência por target e retry limitado (3 tentativas com espera crescente).
- Falha num destino não derruba os outros, deixa o post `partial` e gera notificação; o usuário pode tentar de novo.
- Conta com token expirado bloqueia só os targets dela e pede reconexão.
- Publicado é imutável na BOSUN: correção é feita na plataforma ou num post novo.

## Telas

- Compositor: texto base, ajuste por destino, contador de caracteres por plataforma, mídia e prévia simples.
- Os posts aparecem no [Calendário](calendar.md) e na campanha.

## Critérios de aceite

1. Um post agendado sai nas três plataformas no horário, uma vez só.
2. Uma falha no YouTube deixa o Instagram publicado e o post `partial`.
3. O comentário no post publicado pode disparar um fluxo ([Automação](automation.md)).

## Relations

- governed_by: [ADR-108 — Publicações e campanha](../decisions/adr-108-publications.md)
- depends_on: [Canal](channel.md)
- consumes: [Documento](document.md)
- part_of: [Campanha](campaign.md)
