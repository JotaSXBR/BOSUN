---
type: ADR
title: ADR-104 — Documentos e busca
description: Biblioteca de arquivos e links do workspace e busca por palavra-chave nas entidades do piloto.
domain: conteudo
tags: [bosun, adr, documentos, busca]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# ADR-104 — Documentos e busca

**Status:** vigente, em draft. Fonte única do domínio.

## Decisões

1. **Documentos** é a biblioteca do workspace. Cada entrada é um **arquivo** (no RustFS) ou um **link** (URL externa com título e descrição, nunca cópia), com etiquetas. Cobre a mídia dos posts, o material de entrega dos fluxos e os links úteis do time.
2. Sem biblioteca pessoal, versões nem pastas aninhadas. Arquivo em uso por um post agendado ou por um fluxo ativo não pode ser excluído.
3. Não há Item como supertype: tarefa, documento e post são entidades próprias.
4. **Busca por palavra-chave** em contato (nome, @, telefone, e-mail), negócio, tarefa, projeto, post e documento, com `tsvector` + GIN em português. O texto das mensagens não entra no índice global.
5. A autorização vale no momento da leitura: a busca só mostra o que o papel pode ver.
6. Sem busca semântica, embeddings nem pgvector no piloto.

## Relações

- detalha: [Documento](../product/document.md)
- detalha: [Busca](../product/search.md)
