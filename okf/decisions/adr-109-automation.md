---
type: ADR
title: ADR-109 — Automação
description: Fluxo determinístico comentário → resposta pública → DM com link, configurado em formulário; IA adiada.
domain: automacao
tags: [bosun, adr, automação, fluxo, ia]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# ADR-109 — Automação

**Status:** vigente, em draft. Fonte única do domínio.

## Decisões

1. **Automação determinística** é o único motor do piloto. Ordem: fluxo primeiro; agente como fallback (quando existir); pessoa por último.
2. Um só modelo de fluxo: **comentário → resposta pública → DM com link → entrega**, configurado em **formulário**, sem canvas.
3. Campos do fluxo: conta (Instagram ou Facebook), gatilho (comentário, resposta de story ou menção), post específico ou qualquer post, palavras-chave, variações da resposta pública, mensagem da DM com botão ou link rastreável, material de entrega (documento ou link) e palavras de handoff.
4. Palavra-chave reconhecida sem diferenciar caixa e acento.
5. **Deduplicação:** contato + post + palavra-chave executa uma vez para sempre.
6. **Um evento dispara no máximo um fluxo:** post + palavra vence palavra; empate pela ordem definida pelo Admin.
7. Sem DM fria; respeita a janela da Meta.
8. Admin cria, ativa, pausa e arquiva fluxos. Estados: `draft`, `active`, `paused`, `archived`. Uma edição vale para as próximas execuções.
9. Execução idempotente e registrada: evento, passos, resultado e erro.
10. Conteúdo de mensagem é dado não confiável: nunca altera o fluxo nem executa instruções.
11. **IA fora do piloto:** Copiloto, agentes, Base com RAG e BYOK estão no [later.md](../product/later.md). O estado `pending_agent` ([ADR-107](adr-107-service.md)) reserva o lugar dos agentes.

## Relações

- detalha: [Automação](../product/automation.md)
- consome: [ADR-108 — Publicações e campanha](adr-108-publications.md)
