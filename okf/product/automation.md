---
type: Product Spec
title: Automação
description: Fluxo determinístico comentário → resposta pública → DM com link → entrega, configurado em formulário pelo Admin.
tags: [bosun, automação, fluxo, instagram, facebook]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Automação

Um modelo só, o funil de isca digital: a pessoa comenta a palavra-chave, recebe uma resposta pública curta e uma DM com o link e o material.

## Formulário do fluxo

- Nome, conta (Instagram ou Facebook), campanha opcional.
- Gatilho: comentário, resposta de story ou menção; em um post específico ou em qualquer post.
- Palavras-chave (sem diferenciar caixa nem acento).
- Resposta pública: uma ou mais variações, sorteadas.
- DM: texto e botão com o **link rastreável** ([Campanha](campaign.md)); material de entrega (documento ou link de [Documentos](document.md)).
- Palavras de handoff (ex.: "atendente", "preço"): levam a conversa para a fila humana.

## Regras

- **Um evento dispara no máximo um fluxo**: post + palavra vence palavra; empate segue a ordem definida pelo Admin. A tela avisa quando dois fluxos disputam o mesmo gatilho.
- **Deduplicação**: contato + post + palavra-chave executa uma vez para sempre.
- Sem DM fria; respeita a janela de resposta privada da Meta.
- Estados: `draft`, `active`, `paused`, `archived`. Só o Admin ativa.
- Cada execução registra evento, passos, resultado e erro, e é idempotente pelo ID do evento da Meta.
- O texto da mensagem é dado não confiável: nunca muda o fluxo.

## Fim do fluxo

O fluxo termina depois da entrega. A partir daí, a resposta da pessoa vai para o roteamento do [Ticket](ticket.md): fora do fluxo, palavra de handoff ou promoção manual levam a `waiting_human`.

## Critérios de aceite

1. Comentar a palavra no post gera uma resposta pública e uma DM, uma vez só.
2. Comentar de novo no mesmo post não repete a DM.
3. Responder a DM com uma palavra de handoff coloca o ticket na fila.

## Relações

- governado_por: [ADR-109 — Automação](../decisions/adr-109-automation.md)
- consome: [Post](post.md)
- produz: [Ticket](ticket.md)
- produz: [Contato](contact.md)
