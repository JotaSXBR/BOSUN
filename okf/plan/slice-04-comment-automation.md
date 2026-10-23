---
type: Execution Slice
title: Fatia 4 — Automação de comentário
description: Fluxo comentário → resposta pública → DM com link → entrega, com deduplicação, precedência e handoff para a fila.
tags: [bosun, plano, fatia, automação]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Fatia 4 — Automação de comentário

**Objetivo:** a piloto troca a ferramenta de automação de DM pela BOSUN. Quem comenta a palavra-chave recebe a resposta e o material sozinho.

## Escopo

- `Flow` e `FlowRun`; formulário do fluxo; estados `draft`, `active`, `paused`, `archived`; só o Admin ativa ([Automação](../product/automation.md)).
- Casamento de palavra-chave sem caixa nem acento; precedência post + palavra > palavra > ordem do Admin; aviso de disputa.
- Deduplicação única por fluxo, contato, post e palavra.
- Resposta pública (variação sorteada) e DM com botão e link; entrega de documento ou link.
- `TrackedLink` e redirecionamento `/l/<código>` com registro de clique; ainda sem campanha nem Kiwify ([Campanha](../product/campaign.md)).
- Documentos mínimos: upload de arquivo e cadastro de link para a entrega ([Documento](../product/document.md)).
- Estado `automation` no ticket; handoff para `waiting_human` por resposta fora do fluxo, palavra de handoff ou promoção manual; filtro Automação na caixa.

## Spec

- Entidades: `Flow`, `FlowRun`, `TrackedLink`, `LinkClick`, `Document` (mínimo).
- Rotas: `GET /l/<código>` (redireciona e registra o clique).
- Telas: lista e formulário do fluxo, aviso de disputa, filtro Automação, upload de entrega.
- Transições: comentário que casa → `automation`; resposta fora do fluxo, palavra de handoff ou promoção → `waiting_human`.
- Fora: campanha e Kiwify (Fatia 5), post da BOSUN (Fatia 8).

## Dependências

Fatia 3. Bloqueio externo: App Review da Meta para usar com o público (antes disso, só testadores).

## Critério de aceite

Os três critérios de [Automação](../product/automation.md), mais:

1. Dois fluxos no mesmo post e palavra: só o de maior prioridade dispara, e a tela avisa a disputa.
2. A piloto roda um post real por 7 dias sem a ferramenta antiga, sem DM repetida.

## Testes

- Unitários: normalização da palavra-chave, precedência, deduplicação.
- Integração: evento de comentário → execução → chamadas de saída à Meta (fake), repetição do mesmo evento.
- E2E: configurar fluxo → comentário simulado → ticket em `automation` → resposta fora do fluxo → fila.

## Relations

- depends_on: [Fatia 3 — Instagram e Facebook na caixa](slice-03-meta-inbox.md)
- details: [Automação](../product/automation.md)
- governed_by: [ADR-109 — Automação](../decisions/adr-109-automation.md)
