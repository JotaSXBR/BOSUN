---
type: Product Spec
title: Busca global
description: Palavra-chave em todos os corpora; semântica no corpus curado, com filtros e respeito a permissões.
tags: [bosun, product, search, full-text, semantic, filters, pgvector]
status: draft
generated: { by: reference_agent/deepseek-v4.1-flash-free, at: 2026-10-22T00:00:00Z }
---

# Busca global

## Modelo

- **Palavra-chave em tudo; semântica só onde ganha da palavra-chave** ([ADR-104](../decisions/adr-104-content-knowledge-search.md)).
- **Sem resposta gerada**: a busca devolve resultados, não um texto sintetizado.
- Um buscador com **política por corpus**; não dois sistemas.
- A busca textual usa o `tsvector` do Postgres, em português, na própria instalação — sem serviço externo e sem custo por uso.
- Atravessa Itens, documentos, contatos, empresas, negócios, tickets, mensagens, artigos publicados da Base de Conhecimento, eventos, objetivos e hábitos.

## Onde há semântica

| Corpus | Palavra-chave | Semântica |
|---|---|---|
| Base de Conhecimento | sim | **sempre** — é o corpus que sustenta o RAG |
| Notas e documentos | sim | **opcional por workspace** |
| Tarefas, projetos, contatos, empresas, negócios | sim | não |
| Conversas, tickets e mensagens | sim | não por padrão; opt-in futuro por workspace |

- Embeddings ficam no **pgvector do Postgres da instalação**; cada chunk guarda `modelo` e `versao_modelo`.
- Vetor é **índice descartável**: apagar não perde conteúdo, só volta a busca à palavra-chave.
- Sem provedor ou credencial, a busca **degrada** para palavra-chave; não falha.
- Telefone, CPF e número de pedido são buscados por palavra-chave — é exatamente onde a semântica erra.

## Filtros

- Tipo de item.
- Data e período.
- Status e prioridade.
- Contexto, projeto, contato e canal.
- Dono e visibilidade.

## Regras

- A busca respeita **permissões e privacidade**: conteúdo pessoal de outro membro nunca aparece.
- **A autorização é resolvida no read time**; o índice não decide visibilidade.
- Artigos em rascunho só aparecem para quem tem permissão de edição.
- Na busca global, conversa aparece como **ponteiro** — quantas, onde — e abre no Atendimento.
- Cada resultado mostra contexto suficiente para decisão rápida e um link para o item.
- O Copiloto usa o corpus curado; dentro de uma conversa, lê aquela conversa. Ele nunca recebe um índice semântico de todas as conversas.

## Em aberto

- Paleta de comandos (⌘K) para navegar e agir.
- Busca salva e alertas de novos resultados.
- Reindexação, latência e limites; particionamento do índice de mensagens.
- Busca dentro de mídia (áudio, vídeo, imagem) e OCR/parsing.
- Pesos de ranking entre palavra-chave e semântica por corpus.
- Chunking, sobreposição e tamanho dos trechos.
- Critério e consentimento para ligar semântica em conversa por workspace.

## Links

- [Itens, notas, documentos e conhecimento](content-model.md)
- [Copiloto e agentes de IA](copilot-ai.md)
- [ADR-110 — Busca híbrida e notificações](../decisions/adr-110-notifications-gamification-apps.md)
- [ADR-104 — Busca por palavra-chave em tudo, semântica no corpus curado](../decisions/adr-104-content-knowledge-search.md)
