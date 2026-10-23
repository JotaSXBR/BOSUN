---
type: Product Spec
title: Documento
description: Biblioteca do workspace com arquivos no RustFS e links úteis, usada na mídia dos posts e na entrega dos fluxos.
tags: [bosun, documentos, biblioteca, links]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Documento

Uma biblioteca por workspace, navegável, com busca e etiquetas.

- **Arquivo**: upload para o RustFS ([Mídia e RustFS](../tech/media.md)); nome, etiquetas, tipo e tamanho. Limite de 100 MB por arquivo e 1 GB por vídeo.
- **Link**: URL externa com título, descrição e etiquetas; nunca uma cópia da página. Cobre os "links úteis" do time.
- Usado como mídia do [Post](post.md) e como material de entrega da [Automação](automation.md).
- Arquivo em uso por post agendado ou por fluxo ativo não pode ser excluído; a tela mostra onde está em uso.
- Download por URL assinada de curta duração.
- Sem biblioteca pessoal, versões nem pastas aninhadas.

## Relations

- governed_by: [ADR-104 — Documentos e busca](../decisions/adr-104-content.md)
- part_of: [Workspace](workspace.md)
