---
type: Product Spec
title: Campanha
description: Agrupador leve do lançamento que liga posts, fluxos e checkout, gera links rastreáveis e mostra o funil.
tags: [bosun, campanha, atribuição, funil]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Campanha

- Campos: nome, período, status (`planned`, `active`, `closed`), link de checkout da Kiwify.
- Um post pertence a no máximo uma campanha; uma campanha tem vários posts e fluxos.
- Não é projeto e não cria tarefas. Um projeto pode apontar para a campanha.
- Encerrar a campanha não apaga posts, vendas nem auditoria.

## Link rastreável

- A BOSUN gera `/l/<código>` para cada combinação de campanha, post, fluxo e contato (a DM leva o link do contato).
- O redirecionamento registra o clique e envia ao checkout com UTM e o parâmetro de rastreio da Kiwify, que volta no webhook. Conferir o nome do parâmetro na documentação da Kiwify antes da fatia.

## Painel

Funil por campanha e por post: comentários com palavra-chave → DMs enviadas → cliques → tickets → negócios → vendas e receita. Tudo vem de registros da BOSUN; dado que falta aparece como indisponível, nunca estimado.

## Relations

- governed_by: [ADR-108 — Publicações e campanha](../decisions/adr-108-publications.md)
- part_of: [Piloto](pilot.md)
- consumes: [Post](post.md)
