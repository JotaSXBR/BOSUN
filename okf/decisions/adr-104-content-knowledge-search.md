---
type: ADR
title: ADR-104 — Conteúdo, conhecimento e busca
description: Item como supertype, documentos, Base de Conhecimento, links, arquivamento de mídia e busca.
tags: [bosun, adr, content, item, knowledge, search, media]
status: draft
generated: { by: agent/claude-opus-5-5, at: 2026-10-23T00:00:00Z }
---

# ADR-104 — Conteúdo, conhecimento e busca

**Status:** vigente; consolidado em 2026-10-23 e sujeito à aprovação do design completo. Este ADR é a única fonte de decisão do domínio: decisão nova **edita este arquivo**.

## Item

1. **Item é supertype real** com escopo fechado. **Dentro:** Nota, Tarefa, Documento e Link. **Fora** (e só vinculados): projeto, campanha, workspace, time, conversa, ticket, mensagem, contato, empresa, negócio, evento, artigo da Base e post.
2. O item carrega identidade, workspace, dono, visibilidade, tipo, estado e datas; cada tipo tem detalhe 1:1. Comentário, menção, vínculo, anexo, auditoria, busca e exportação apontam para `item.id`. O guarda-chuva não aparece na interface.
3. Toda captura cria um item; a classificação sugere tipo e destino; o usuário corrige.
4. Estados: `inbox`, `processado`, `arquivado`. **Subtarefa é item; linha de checklist não é.**
5. **Transformar** troca o tipo do mesmo item (sem filhos específicos). **Promover** cria a entidade ao lado e registra `originou`. Item publicado ou arquivado congela o tipo.
6. Nota promovida a projeto é o **brief vivo** do projeto; apagar o projeto devolve a nota ao `inbox`.
7. **Entrega** é uma tarefa ligada ao rascunho de post.

## Documentos, notas e links

8. **Documentos** é biblioteca de arquivos externos, do workspace e pessoal (pessoal privado). Anexos **referenciam** a biblioteca. Notas são Itens, não Documentos.
9. **Link é favorito**: URL externa (nunca cópia), com categoria e visibilidade **privada, de projeto ou compartilhada**.

## Base de Conhecimento

10. Wiki interna + base do RAG; a IA só usa artigos **publicados**.
11. Revisão por **quatro olhos**, em dois formatos configuráveis por workspace: **pares** do mesmo setor aprovam um ao outro, ou **somente Admin/Manager**.
12. O artigo vence em **180 dias** e sai do RAG até ser revisto.

## Arquivamento de mídia

13. Projeto (ou campanha/post) encerrado gera **pacote de encerramento** determinístico e restaurável: `LEIA.md`, `manifest.json` com checksums, conteúdo, mídia e registro.
14. Download manual por Admin/Manager em até **90 dias**; **expurgo 24 h após download verificado**, nunca antes dos 90 dias; sem download não há expurgo. Legal hold suspende.
15. O registro fica, o byte sai: mídia vira `arquivado_externo`, com checksum e ação de restaurar. Backup de 30 dias continua valendo. Tudo auditado.

## Busca

16. **Palavra-chave em tudo** (`tsvector` + GIN em português, no Postgres). Sem resposta gerada.
17. **Semântica só no corpus curado**: sempre na Base; opcional em notas e documentos; nunca em conversas.
18. Embeddings no **pgvector** da instalação, com modelo versionado; vetor é índice descartável; sem provedor, degrada para palavra-chave.
19. Autorização no **read time**; conversa aparece na busca global como ponteiro.

## Capacidade futura

- Segundo Cérebro; OCR.

## Origem

Consolida os antigos 026, 027, 034, 051, 053, 054, 066, arquivados em `archive/adrs-2026-10-23/`.
