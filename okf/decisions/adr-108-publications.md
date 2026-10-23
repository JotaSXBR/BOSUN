---
type: ADR
title: ADR-108 — Publicações
description: Área de Publicações — plataformas, modelo do post, aprovação, campanha, OAuth e analytics.
tags: [bosun, adr, publications, social, oauth, campaign]
status: draft
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# ADR-108 — Publicações

**Status:** vigente; consolidado em 2026-10-23 e sujeito à aprovação do design completo. Este ADR é a única fonte de decisão do domínio: decisão nova **edita este arquivo**.

## Área e plataformas

1. **Publicações** é a terceira área, ao lado de Social e Atendimento; cuida do ciclo do post.
2. Plataformas: Instagram, Facebook, TikTok, YouTube, Threads e Kwai. Regra **API oficial + modo assistido**; sem automação de navegador.
3. **TikTok começa assistido**: sem auditoria a API só publica como privado e para até 5 usuários/24 h. A auditoria do app BOSUN é tarefa de lançamento.
4. **Kwai só assistido** (sem API pública de publicação).
5. **Várias contas por rede**; cada conta conectada é um **canal** com aprovação, fila, slots e analytics próprios.

## Modelo do post

6. Post é **entidade própria**, fora do Item: `Post` (família) → `PostVariant` (texto e mídia por conta) → `PostOccurrence` (cada publicação, com ID e analytics). Rascunho pode nascer de uma Nota, por vínculo.
7. Ciclo: ideia/rascunho → revisão → aprovado → agendado → publicando → publicado/parcial/falhou → arquivado.
8. Compositor: texto base + variantes, limites, mídia, alt text, hashtags, CTA, link, primeiro comentário.
9. Mídia vem da biblioteca de Documentos, **fixada por versão**; arquivo em uso não é apagado; publicado vira tombstone.
10. Cada destino publica independente, com retry e idempotência por post + destino + horário.
11. Todo post tem horário explícito; reciclar cria nova ocorrência da mesma família e não reenvia a mesma DM.

## Time, aprovação e campanha

12. Post e campanha pertencem a um **time de Publicações**; workspace solo tem time padrão com o Admin.
13. Aprovação **opcional por canal**, por **versão** do post: aprovar ou recusar **com comentário**. Editar volta a pendente; sem aprovação no horário, segura e notifica. Admin/Manager pode aprovar o próprio post; Membro não.
14. **Campanha** leve: nome, objetivo, período, status, posts, fluxos e checkout. Não é projeto e não cria tarefas.
15. **UTM automático** nos links; venda confirmada por webhook é atribuída ao post, ao fluxo e à campanha.

## OAuth

16. App OAuth **único da BOSUN** por plataforma; tokens criptografados na instalação; Admin/Manager conecta contas.
17. **Broker central** (ex.: `auth.bosun.app`) com a única redirect URI; repassa só o código por `state` assinado; o token nunca passa por ele. No piloto, o app aponta direto para o domínio da cliente; o broker entra antes da segunda instalação.

## IA e analytics

18. IA só de texto (adaptar, variantes, hashtags); não gera imagem nem vídeo.
19. Analytics por post e plataforma.
20. Matriz com sete linhas: Publicações, Campanhas, Aprovação, Conexões, Fila e reciclagem, Analytics, Post → automação/checkout.

## Capacidade futura

- Normalização de métricas entre redes, melhor horário, API/MCP externo, vários times de Publicações por workspace.

## Origem

Consolida os antigos 048, 063, arquivados em `archive/adrs-2026-10-23/`.
