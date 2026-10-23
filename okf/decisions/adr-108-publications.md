---
type: ADR
title: ADR-108 — Publicações e campanha
description: Post criado e agendado na BOSUN e publicado por API no Instagram, Facebook e YouTube Shorts; campanha leve com link rastreável.
domain: publicacoes
tags: [bosun, adr, publicações, post, campanha]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# ADR-108 — Publicações e campanha

**Status:** vigente, em draft. Fonte única do domínio.

## Decisões

1. Objetivo: a piloto cria, agenda e publica **na BOSUN**, em vez de usar o app do Instagram.
2. Plataformas do piloto, todas por **API oficial**: **Instagram** (feed, carrossel, reel), **Facebook** (feed, reel) e **YouTube Shorts**. Sem automação de navegador nem modo assistido.
3. Todo post publicado numa rede, nativo ou da BOSUN, é um `ExternalPost`; a automação e a atribuição usam ele. Modelo da BOSUN: `Post` (campanha opcional, texto base, mídia) → `PostTarget` (uma conta conectada, com texto ou título próprio, status, `external_id`, `published_at` e erro). O YouTube exige título e descrição no próprio target.
4. Ciclo: `draft` → `scheduled` → `publishing` → `published`, `partial` ou `failed`. Todo post tem horário explícito, no fuso do workspace.
5. Cada target publica de forma independente, com retry limitado e idempotência por target. Uma falha não derruba os outros e gera notificação.
6. A mídia vem de [Documentos](../product/document.md). Cotas de 100 MB por arquivo e 1 GB por vídeo ([ADR-111](adr-111-architecture.md)).
7. Admin conecta as contas; Membro cria e publica. Sem aprovação nem time de Publicações.
8. **Campanha**: nome, período, status (`planned`, `active`, `closed`), posts, fluxos e link de checkout. Não é projeto e não cria tarefas.
9. **Link rastreável** gerado pela BOSUN para cada combinação de campanha, post, fluxo e contato. Ele redireciona ao checkout da Kiwify com UTM e um parâmetro de rastreio. Conferir na documentação da Kiwify qual parâmetro volta no webhook.
10. Analytics do piloto: o funil por post e por campanha (comentários, DMs, tickets, vendas, receita). Alcance e engajamento ficam para depois.
11. App OAuth da BOSUN por plataforma, apontando direto para o domínio da instalação; tokens cifrados ([ADR-111](adr-111-architecture.md)). Sem broker central no piloto.

## Relations

- details: [Post](../product/post.md)
- details: [Campanha](../product/campaign.md)
