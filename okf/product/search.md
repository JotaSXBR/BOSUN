---
type: Product Spec
title: Busca
description: Busca global por palavra-chave em contatos, negócios, tarefas, projetos, posts e documentos, respeitando o papel.
tags: [bosun, busca, postgres]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Busca

- Um campo no topo, atalho de teclado; resultados agrupados por tipo.
- Contato por nome, @ do Instagram, telefone (com ou sem máscara) e e-mail; negócio, tarefa, projeto, post e documento por título e texto.
- `tsvector` + índice GIN em português no Postgres; telefone e @ por igualdade normalizada.
- A busca dentro da caixa (lista de conversas) filtra por contato e canal; o texto das mensagens não entra no índice global.
- A autorização vale na leitura: só aparece o que o papel pode ver, sempre no workspace ativo.
- Sem busca semântica nem resposta gerada.

## Relações

- governado_por: [ADR-104 — Documentos e busca](../decisions/adr-104-content.md)
- consome: [Contato](contact.md)
- consome: [Documento](document.md)
