---
type: Session Handoff
title: Handoff para a próxima etapa
description: Como retomar o BOSUN com pouco contexto, após a consolidação dos ADRs em 2026-10-23.
tags: [bosun, handoff, product, continuity, okf]
status: stable
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# Handoff para a próxima etapa

> **Documento derivado** de [`current-state.md`](current-state.md). O método está em [`../method.md`](../method.md).

## Leitura mínima

1. [`current-state.md`](current-state.md) — status, pendências e próximo passo.
2. [`../decisions/index.md`](../decisions/index.md) — 13 ADRs, um por domínio; leia só o do domínio da tarefa.
3. O conceito em `product/` ou `tech/` da tarefa.

Não leia `archive/`: é histórico e contém decisões substituídas.

## Prompt para a nova janela

> Estamos em `C:\Projetos\Bosun`. Leia `okf/memory/current-state.md` e `okf/decisions/index.md`. O design do produto completo não está aprovado; não crie código, scaffold, dependência ou migration. Siga o próximo passo do `current-state.md`. Decisão nova edita o ADR do domínio e o conceito; atualize `log.md` e `current-state.md`; valide com `npx -y @mfdaves/okf-mcp@0.9.1 --root ./okf validate`.

## Guardrails

- O MVP é um recorte, não o produto inteiro.
- Não invente requisitos: quando a fonte for omissa, pergunte.
- `status: stable` só com aprovação explícita do usuário.

## Links

- [Estado atual](current-state.md)
- [Decisões](../decisions/index.md)
- [Log](../log.md)
