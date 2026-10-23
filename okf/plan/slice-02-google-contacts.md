---
type: Execution Slice
title: Fatia 2 — Contatos e Google Contatos
description: Ficha e lista de contatos, mesclagem manual e sync em duas vias pela etiqueta BOSUN.
tags: [bosun, plano, fatia, contatos, google]
status: draft
generated:
  by: claude-opus/5.5
  at: 2026-10-23T00:00:00Z
---

# Fatia 2 — Contatos e Google Contatos

**Objetivo:** quem fala com a piloto no WhatsApp aparece com nome no celular dela, e ela edita o contato num lugar só.

## Escopo

- Lista e ficha do contato, com edição, identidades e linha do tempo de tickets.
- Mesclagem manual auditada, com registro-aliado ([Contato](../product/contact.md)).
- Conexão do Google Contatos, etiqueta BOSUN, importação, envio ao salvar, sync incremental com `syncToken`, escrita sequencial com `etag`, pergunta ao remover a etiqueta ([Google Contatos](../product/google-contacts.md), [Google People API](../tech/google-people.md)).
- Busca de contato por nome, telefone e e-mail ([Busca](../product/search.md)).

## Critério de aceite

Os cinco critérios de [Google Contatos](../product/google-contacts.md), mais:

1. Mesclar dois contatos move os tickets e deixa auditoria.
2. Buscar "11 9" acha o contato pelo telefone.

## Testes

- Unitários: diff de campos BOSUN → Google, regra "BOSUN é a fonte da verdade".
- Integração: People API com servidor fake (sync completo, incremental, token expirado, conflito de `etag`).
- E2E: editar contato → aparece como enviado ao Google.

## Observação

Enquanto o Google não verificar o app, use a conta da piloto como usuária de teste do projeto no Google Cloud.

## Relations

- depends_on: [Fatia 1 — Caixa com WhatsApp](slice-01-whatsapp-inbox.md)
- details: [Google Contatos](../product/google-contacts.md)
- governed_by: [ADR-106 — Contatos, CRM e venda](../decisions/adr-106-contacts.md)
